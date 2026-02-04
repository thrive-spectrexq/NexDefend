import time
import json
import os
import sys
import subprocess
import logging
from kafka import KafkaConsumer

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Config
ALLOWED_UPLOAD_DIR = os.getenv("ALLOWED_UPLOAD_DIR", "/data/uploads")

def validate_path(filepath):
    """
    Ensures the filepath is within the allowed directory and has no traversal attempts.
    Uses os.path.realpath to resolve symlinks.
    """
    if not filepath:
        return False

    # Resolve real path (follow symlinks)
    try:
        real_path = os.path.realpath(filepath)
        real_allowed = os.path.realpath(ALLOWED_UPLOAD_DIR)
    except OSError:
        return False

    # Check prefix
    # os.path.commonpath returns the longest common sub-path
    # We check if the common path is the allowed dir
    try:
        common = os.path.commonpath([real_path, real_allowed])
    except ValueError:
        # Paths are on different drives or mix relative/absolute
        return False

    if common != real_allowed:
        logging.warning(f"Path traversal attempt or restricted dir: {filepath} -> {real_path} (Allowed: {real_allowed})")
        return False

    # Check existence
    if not os.path.exists(real_path):
        logging.warning(f"File not found: {filepath}")
        return False

    return True

def main():
    logging.info("Forensics Worker Starting...")

    broker = os.environ.get("KAFKA_BROKER", "kafka:9092")
    topic = "forensics.tasks"

    # Retry loop for Kafka connection
    consumer = None
    for i in range(10):
        try:
            consumer = KafkaConsumer(
                topic,
                bootstrap_servers=broker,
                group_id="forensics-group",
                value_deserializer=lambda m: json.loads(m.decode('utf-8'))
            )
            logging.info(f"Connected to Kafka at {broker}")
            break
        except Exception as e:
            logging.warning(f"Waiting for Kafka ({e})...")
            time.sleep(5)

    if not consumer:
        logging.error("Could not connect to Kafka. Exiting.")
        return

    logging.info("Listening for tasks...")
    for message in consumer:
        task = message.value
        logging.info(f"Received task: {task}")
        process_task(task)

def process_task(task):
    task_type = task.get("type", "unknown")
    filepath = task.get("filepath")

    logging.info(f"Processing {task_type} for {filepath}")

    # Validate Filepath
    # We skip validation if filepath is None or if it's a test/mock without real file
    if filepath and not validate_path(filepath):
         logging.error(f"Security Alert: Unsafe filepath detected {filepath}. Aborting task.")
         return

    # Mock Analysis
    time.sleep(2)

    try:
        if task_type == "memory":
            logging.info("Running Volatility3...")
            # Secure subprocess execution
            # cmd = ["vol", "-f", filepath, "windows.pslist"]
            # result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            logging.info(f"Volatility analysis simulated for {filepath}")

        elif task_type == "binary":
            logging.info("Running Ghidra Headless...")
            # cmd = ["analyzeHeadless", ..., "-import", filepath]
            # subprocess.run(cmd, check=True, timeout=600)
            logging.info(f"Ghidra analysis simulated for {filepath}")

    except Exception as e:
        logging.error(f"Task processing error: {e}")

    logging.info(f"Task {task.get('id')} complete.")

if __name__ == "__main__":
    main()
