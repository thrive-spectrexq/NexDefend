import time
import json
import os
import sys
from kafka import KafkaConsumer

def main():
    print("Forensics Worker Starting...")

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
            print(f"Connected to Kafka at {broker}")
            break
        except Exception as e:
            print(f"Waiting for Kafka ({e})...")
            time.sleep(5)

    if not consumer:
        print("Could not connect to Kafka. Exiting.")
        return

    print("Listening for tasks...")
    for message in consumer:
        task = message.value
        print(f"Received task: {task}")
        process_task(task)

def process_task(task):
    task_type = task.get("type", "unknown")
    filepath = task.get("filepath")

    print(f"Processing {task_type} for {filepath}")

    # Mock Analysis
    time.sleep(2)

    if task_type == "memory":
        print("Running Volatility3...")
        # os.system(f"vol -f {filepath} windows.pslist")
    elif task_type == "binary":
        print("Running Ghidra Headless...")
        # os.system("analyzeHeadless ...")

    print(f"Task {task.get('id')} complete.")

if __name__ == "__main__":
    main()
