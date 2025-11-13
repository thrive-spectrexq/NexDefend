import logging
import os
import json
import requests
from confluent_kafka import Consumer, KafkaException
import sys
import time

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:9092")
KAFKA_TOPIC = "nexdefend-events"
GO_API_URL = os.getenv("GO_API_URL", "http://api:8080/api/v1")
AI_SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN", "default_secret_token")

# --- In-memory state for UEBA ---
suspicious_processes = {}  # pid -> timestamp

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

    return base_score

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
    """Processes a single event and checks for behavioral anomalies."""
    event_type = event.get("event_type")

    if event_type == "process":
        process_data = event['data']
        if "/tmp" in process_data.get("cmdline", ""):
            logging.warning(f"Suspicious process detected: {process_data['cmdline']} (PID: {process_data['pid']})")
            suspicious_processes[process_data['pid']] = time.time()

    elif event_type == "net_connection":
        net_data = event['data']
        pid = net_data.get("pid")
        if pid in suspicious_processes:
            if time.time() - suspicious_processes[pid] < 60:
                description = f"UEBA Anomaly: Process {pid} started from /tmp and made a network connection to {net_data['remote_address']}"
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

    for pid, timestamp in list(suspicious_processes.items()):
        if time.time() - timestamp > 300:
            del suspicious_processes[pid]

def run_worker():
    """Initializes and runs the Kafka consumer worker."""
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

if __name__ == "__main__":
    run_worker()
