import psycopg2
import json
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

DATABASE_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
}

def fetch_suricata_events():
    """Fetches Suricata events from the PostgreSQL database."""
    connection = psycopg2.connect(**DATABASE_CONFIG)
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM suricata_events;")
    events = cursor.fetchall()
    connection.close()
    return events

if __name__ == "__main__":
    events = fetch_suricata_events()
    print(json.dumps(events, indent=2))
