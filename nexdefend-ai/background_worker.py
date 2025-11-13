import logging
import os
import json
import requests
from confluent_kafka import Consumer, KafkaException
import sys
import time
import psycopg2
from psycopg2 import pool

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = "nexdefend-events"
GO_API_URL = os.getenv("GO_API_URL", "http://api:8080/api/v1")
AI_SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN", "default_secret_token")
DB_CONN_STRING = os.getenv("DB_CONN_STRING", "postgresql://user:password@db:5432/nexdefend")

# --- Database Connection Pool ---
db_pool = None

def init_db_pool():
    """Initializes the PostgreSQL connection pool."""
    global db_pool
    try:
        logging.info("Initializing database connection pool...")
        db_pool = psycopg2.pool.SimpleConnectionPool(1, 10, dsn=DB_CONN_STRING)
        if db_pool:
            logging.info("Database connection pool created successfully.")
        else:
            logging.error("Failed to create database connection pool.")
    except psycopg2.OperationalError as e:
        logging.error(f"Database connection failed: {e}")
        sys.exit(1)

def get_db_conn():
    """Gets a connection from the pool."""
    if db_pool:
        return db_pool.getconn()
    return None

def release_db_conn(conn):
    """Releases a connection back to the pool."""
    if db_pool and conn:
        db_pool.putconn(conn)

def update_risk_score(entity_id, entity_type, score_change, reasoning):
    """Updates the risk score for an entity in the database."""
    conn = get_db_conn()
    if not conn:
        logging.error("Database connection not available, cannot update risk score.")
        return None
    try:
        with conn.cursor() as cur:
            # Check if an entry for the entity already exists
            cur.execute(
                "SELECT score, reasoning_jsonb FROM entity_risk_scores WHERE entity_id = %s AND entity_type = %s",
                (entity_id, entity_type)
            )
            result = cur.fetchone()

            if result:
                # Update existing score
                current_score, reasoning_jsonb = result
                new_score = current_score + score_change
                reasoning_jsonb.append(reasoning)
                cur.execute(
                    """
                    UPDATE entity_risk_scores
                    SET score = %s, reasoning_jsonb = %s, last_updated = CURRENT_TIMESTAMP
                    WHERE entity_id = %s AND entity_type = %s
                    """,
                    (new_score, json.dumps(reasoning_jsonb), entity_id, entity_type)
                )
            else:
                # Insert new entry
                new_score = score_change
                reasoning_jsonb = [reasoning]
                cur.execute(
                    """
                    INSERT INTO entity_risk_scores (entity_id, entity_type, score, reasoning_jsonb)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (entity_id, entity_type, new_score, json.dumps(reasoning_jsonb))
                )
            conn.commit()
            logging.info(f"Updated risk score for {entity_type}:{entity_id} to {new_score}")
            return new_score
    except psycopg2.Error as e:
        logging.error(f"Database error in update_risk_score: {e}")
        conn.rollback()
        return None
    finally:
        release_db_conn(conn)

def create_incident_in_backend(description, severity, source_ip=None, entity_name=None, risk_score=None, disposition=None):
    """Calls the Go backend to create a new incident."""
    try:
        payload = {
            "description": description,
            "severity": severity,
            "status": "Open",
            "risk_score": risk_score,
            "entity_name": entity_name,
            "disposition": disposition,
        }
        if source_ip:
            payload["source_ip"] = source_ip

        headers = {
            "Authorization": f"Bearer {AI_SERVICE_TOKEN}",
            "Content-Type": "application/json"
        }
        incident_url = f"{GO_API_URL}/incidents"
        response = requests.post(incident_url, json=payload, headers=headers)

        if response.status_code == 201:
            logging.info(f"Successfully created incident: {description}")
        else:
            logging.error(f"Failed to create incident. Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        logging.error(f"Error calling create_incident_in_backend: {e}")

def process_event(event):
    """Processes a single event, applies UEBA rules, and updates risk scores."""
    event_type = event.get("event_type")
    data = event.get("data", {})
    hostname = data.get("hostname", "unknown_host")
    user = data.get("user", "unknown_user")

    rules = []

    # Rule 1: Process execution from a suspicious path
    if event_type == "process":
        cmdline = data.get("cmdline", "")
        suspicious_paths = ["/tmp", "/var/tmp", "/dev/shm"]
        if any(path in cmdline for path in suspicious_paths):
            rules.append({
                "entity_id": hostname, "entity_type": "asset", "score_change": 20,
                "reasoning": f"Process '{cmdline}' executed from suspicious path."
            })
            # Add user context if available
            if user != "unknown_user":
                rules.append({
                    "entity_id": user, "entity_type": "user", "score_change": 20,
                    "reasoning": f"User '{user}' executed process '{cmdline}' from suspicious path on {hostname}."
                })

    # Rule 2: Network connection to a known malicious IP (example)
    elif event_type == "net_connection":
        remote_addr = data.get("remote_address", "")
        # In a real system, this would be a lookup against a threat intel feed
        malicious_ips = ["123.123.123.123", "198.51.100.1"]
        if remote_addr in malicious_ips:
            rules.append({
                "entity_id": hostname, "entity_type": "asset", "score_change": 50,
                "reasoning": f"Outbound connection to known malicious IP {remote_addr}."
            })

    # Rule 3: Critical file modification
    elif event_type == "fim":
        file_path = data.get("file_path", "")
        critical_files = ["/etc/passwd", "/etc/shadow", "/etc/sudoers"]
        if file_path in critical_files:
            rules.append({
                "entity_id": hostname, "entity_type": "asset", "score_change": 80,
                "reasoning": f"Critical file '{file_path}' was modified."
            })
            if user != "unknown_user":
                rules.append({
                    "entity_id": user, "entity_type": "user", "score_change": 80,
                    "reasoning": f"User '{user}' modified critical file '{file_path}' on {hostname}."
                })

    # Apply all triggered rules and check for thresholds
    for rule in rules:
        new_score = update_risk_score(
            rule["entity_id"], rule["entity_type"], rule["score_change"], rule["reasoning"]
        )
        if new_score:
            check_risk_threshold(rule["entity_id"], rule["entity_type"], new_score)

def check_risk_threshold(entity_id, entity_type, score):
    """Checks if a risk score has crossed a threshold and creates an incident."""
    thresholds = {
        "High": 100,
        "Medium": 60
    }
    incident_severity = None
    if score >= thresholds["High"]:
        incident_severity = "High"
    elif score >= thresholds["Medium"]:
        incident_severity = "Medium"

    if incident_severity:
        description = f"UEBA Alert: {entity_type.capitalize()} '{entity_id}' has reached a risk score of {score}."
        create_incident_in_backend(
            description,
            incident_severity,
            entity_name=entity_id,
            risk_score=score,
            disposition="Not Reviewed"
        )
        # Optionally, reset the score after an incident is created to avoid repeat alerts
        # reset_risk_score(entity_id, entity_type)

def run_worker():
    """Initializes and runs the Kafka consumer worker."""
    init_db_pool()
    logging.info("Starting background worker...")

    consumer_conf = {
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': 'nexdefend-ai-worker',
        'auto.offset.reset': 'earliest'
    }

    consumer = Consumer(consumer_conf)

    try:
        consumer.subscribe([KAFKA_TOPIC])
        logging.info(f"Subscribed to topic: {KAFKA_TOPIC}")

        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaException._PARTITION_EOF:
                    sys.stderr.write('%% %s [%d] reached end at offset %d\n' %
                                     (msg.topic(), msg.partition(), msg.offset()))
                elif msg.error():
                    raise KafkaException(msg.error())
            else:

                try:
                    event = json.loads(msg.value().decode('utf-8'))
                    process_event(event)
                except json.JSONDecodeError:
                    logging.error(f"Failed to decode JSON message: {msg.value()}")

    finally:
        consumer.close()
        logging.info("Kafka consumer closed.")
        if db_pool:
            db_pool.closeall()
            logging.info("Database connection pool closed.")

if __name__ == "__main__":
    run_worker()
