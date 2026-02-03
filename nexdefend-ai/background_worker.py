
import logging
import os
import json
import requests
import threading
from concurrent.futures import ThreadPoolExecutor
from confluent_kafka import Consumer, KafkaException
import sys
import time
from advanced_threat_detection import analyze_command_line, detect_ransomware_activity
from mitre_attack import get_mitre_technique
from specialized_models.dga_detector import is_dga
from ueba.behavior_model import BehaviorModel
from cachetools import TTLCache
import psycopg2.pool

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = "nexdefend-events"
GO_API_URL = os.getenv("GO_API_URL", "http://api:8080/api/v1")
AI_SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN")

if not AI_SERVICE_TOKEN:
    logging.error("AI_SERVICE_TOKEN environment variable is not set. Exiting.")
    sys.exit(1)
if AI_SERVICE_TOKEN == "default_secret_token":
    logging.warning("Security Warning: Using default AI_SERVICE_TOKEN.")

DATABASE_CONFIG = {
    "dbname": os.getenv("DB_NAME", "nexdefend_db"),
    "user": os.getenv("DB_USER", "nexdefend"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "host": os.getenv("DB_HOST", "db"),
    "port": os.getenv("DB_PORT", "5432"),
}

# --- DB Connection Pool ---
try:
    db_pool = psycopg2.pool.SimpleConnectionPool(1, 10, **DATABASE_CONFIG)
except Exception as e:
    # Fallback or exit if DB is critical
    logging.error(f"Failed to create DB pool: {e}")
    # We might want to exit or wait, but for now we proceed and hope it's fixed later or connection works
    db_pool = None

# --- In-memory state for UEBA ---
suspicious_processes = {}  # pid -> timestamp

# Wrapper to handle eviction
def on_model_eviction(key, value):
    """Callback for when a BehaviorModel is evicted from cache."""
    logging.info(f"Evicting model for user {key}, saving to DB...")
    value.save_to_db()

class SavingTTLCache(TTLCache):
    def popitem(self):
        """Override popitem to save model before eviction."""
        key, value = super().popitem()
        on_model_eviction(key, value)
        return key, value

# LRU Cache: Max 1000 users, expire after 1 hour (3600s).
behavior_models = SavingTTLCache(maxsize=1000, ttl=3600)

# Thread pool for async backend calls
executor = ThreadPoolExecutor(max_workers=10)

def calculate_risk_score(severity, event_data):
    """Calculates a risk score for an incident."""
    base_score = 0
    if severity == "High":
        base_score = 70
    elif severity == "Medium":
        base_score = 40
    elif severity == "Low":
        base_score = 10

    # Add points for suspicious process activity
    if "/tmp" in event_data.get("cmdline", ""):
        base_score += 20

    if event_data.get("mitre_technique"):
        base_score += 10

    return base_score

def create_incident_in_backend(description, severity, source_ip=None, entity_name=None, risk_score=None, disposition=None, mitre_technique=None):
    """Calls the Go backend to create a new incident asynchronously."""
    def _send_request():
        try:
            payload = {
                "description": description,
                "severity": severity,
                "status": "Open",
                "risk_score": risk_score,
                "entity_name": entity_name,
                "disposition": disposition,
                "mitre_technique": mitre_technique,
            }
            if source_ip:
                payload["source_ip"] = source_ip

            headers = {
                "Authorization": f"Bearer {AI_SERVICE_TOKEN}",
                "Content-Type": "application/json"
            }
            incident_url = f"{GO_API_URL}/incidents"
            response = requests.post(incident_url, json=payload, headers=headers, timeout=5)

            if response.status_code == 201:
                logging.info(f"Successfully created incident: {description}")
            else:
                logging.error(f"Failed to create incident. Status: {response.status_code}, Body: {response.text}")
        except Exception as e:
            logging.error(f"Error calling create_incident_in_backend: {e}")

    # Run in a separate thread to avoid blocking the Kafka consumer
    executor.submit(_send_request)

def process_event(event):
    """Processes a single event and checks for behavioral anomalies."""
    event_type = event.get("event_type")
    user = event.get("user")

    # Only perform UEBA if we have a valid user and DB pool
    if user and user != "unknown" and db_pool:
        if user not in behavior_models:
            behavior_models[user] = BehaviorModel(user, db_pool)

        if behavior_models[user].detect_anomalies(event):
            description = f"UEBA Anomaly: Unusual behavior detected for user {user}"
            risk_score = calculate_risk_score("Medium", {})
            create_incident_in_backend(
                description,
                "Medium",
                entity_name=user,
                risk_score=risk_score,
                disposition="Not Reviewed",
            )

        # Update baseline with current event (marks as dirty)
        behavior_models[user].update_baseline([event])

    if event_type == "process":
        process_data = event.get('data', {})
        cmdline = process_data.get("cmdline", "")
        pid = process_data.get("pid")

        # Advanced threat detection
        if analyze_command_line(cmdline):
            description = f"Advanced Threat Detection: Suspicious command line detected: {cmdline}"
            risk_score = calculate_risk_score("High", {"cmdline": cmdline})
            create_incident_in_backend(
                description,
                "High",
                entity_name=pid,
                risk_score=risk_score,
                disposition="Not Reviewed",
            )

        if "/tmp" in cmdline and pid:
            logging.warning(f"Suspicious process detected: {cmdline} (PID: {pid})")
            suspicious_processes[pid] = time.time()

    elif event_type == "file":
        file_data = event.get("data", {})
        path = file_data.get("path") or file_data.get("target_path")

        if path and detect_ransomware_activity(path):
            description = f"Ransomware Activity Detected: Suspicious file extension in {path}"
            risk_score = 90 # Very High
            create_incident_in_backend(
                description,
                "Critical",
                entity_name=path,
                risk_score=risk_score,
                disposition="Not Reviewed",
                mitre_technique="T1486" # Data Encrypted for Impact
            )

    elif event_type == "net_connection":
        net_data = event.get('data', {})
        pid = net_data.get("pid")
        if pid in suspicious_processes:
            if time.time() - suspicious_processes[pid] < 60:
                description = f"UEBA Anomaly: Process {pid} started from /tmp and made a network connection to {net_data.get('remote_address')}"
                risk_score = calculate_risk_score("High", {"cmdline": "/tmp"})
                create_incident_in_backend(
                    description,
                    "High",
                    source_ip=net_data.get('local_address'),
                    entity_name=net_data.get('local_address'),
                    risk_score=risk_score,
                    disposition="Not Reviewed",
                )
                del suspicious_processes[pid]

    elif event_type == "flow":
        flow_data = event.get('flow', {})
        bytes_transferred = flow_data.get('bytes_toserver', 0) + flow_data.get('bytes_toclient', 0)

        # Anomaly Rule 1: High Data Transfer (Exfiltration) > 100MB
        if bytes_transferred > 100 * 1024 * 1024:
            src_ip = event.get("src_ip")
            dest_ip = event.get("dest_ip")
            description = f"Network Anomaly: High data volume transfer detected ({bytes_transferred / (1024*1024):.2f} MB) from {src_ip} to {dest_ip}"
            risk_score = 60 # Medium-High
            create_incident_in_backend(
                description,
                "High",
                source_ip=src_ip,
                entity_name=src_ip,
                risk_score=risk_score,
                disposition="Not Reviewed"
            )

        # Anomaly Rule 2: Connection to Rare Ports (Simple heuristic)
        dest_port = event.get("dest_port")
        common_ports = [80, 443, 53, 22, 123, 445]
        if dest_port and dest_port not in common_ports and dest_port < 1024:
             # Just a warning/logging, maybe not incident unless combined with other signals
             pass

    elif event_type == "alert":
        alert_data = event.get("alert", {})
        signature = alert_data.get("signature")
        if signature:
            mitre_technique = get_mitre_technique(signature)
            if mitre_technique:
                description = f"MITRE ATT&CK Detection: {signature}"
                risk_score = calculate_risk_score("Medium", {"mitre_technique": mitre_technique})
                create_incident_in_backend(
                    description,
                    "Medium",
                    source_ip=event.get("src_ip"),
                    entity_name=event.get("src_ip"),
                    risk_score=risk_score,
                    disposition="Not Reviewed",
                    mitre_technique=mitre_technique,
                )

    elif event_type == "dns":
        dns_data = event.get("dns", {})
        domain = dns_data.get("rrname")
        if domain and is_dga(domain):
            description = f"DGA Domain Detected: {domain}"
            risk_score = calculate_risk_score("High", {})
            create_incident_in_backend(
                description,
                "High",
                source_ip=event.get("src_ip"),
                entity_name=domain,
                risk_score=risk_score,
                disposition="Not Reviewed",
            )

    # Clean up old suspicious processes
    for pid, timestamp in list(suspicious_processes.items()):
        if time.time() - timestamp > 300:
            del suspicious_processes[pid]

def run_worker():
    """Initializes and runs the Kafka consumer worker."""
    logging.info("Starting background worker...")

    global db_pool
    if not db_pool:
         # Retry logic for DB connection
        max_retries = 5
        for i in range(max_retries):
            try:
                db_pool = psycopg2.pool.SimpleConnectionPool(1, 10, **DATABASE_CONFIG)
                logging.info("Connected to database successfully.")
                break
            except Exception as e:
                logging.warning(f"Database connection failed, retrying in 5 seconds ({i+1}/{max_retries})... Error: {e}")
                time.sleep(5)
        else:
            logging.error("Could not connect to database after multiple retries. Exiting.")
            sys.exit(1)

    consumer_conf = {
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': 'nexdefend-ai-worker',
        'auto.offset.reset': 'earliest'
    }

    consumer = Consumer(consumer_conf)
    last_save_time = time.time()

    try:
        consumer.subscribe([KAFKA_TOPIC])
        logging.info(f"Subscribed to topic: {KAFKA_TOPIC}")

        while True:
            # Poll for messages
            msg = consumer.poll(timeout=1.0)

            # Periodic save (every 60 seconds)
            if time.time() - last_save_time > 60:
                logging.info("Running periodic UEBA model save...")
                for user, model in list(behavior_models.items()):
                    model.save_to_db()
                last_save_time = time.time()

            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaException._PARTITION_EOF:
                    # End of partition event
                    pass
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
        if db_pool:
            db_pool.closeall()
        logging.info("Kafka consumer and DB pool closed.")

if __name__ == "__main__":
    run_worker()
