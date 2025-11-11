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

# Define the full set of columns we expect
EVENT_COLUMNS = [
    'id', 'timestamp', 'event_type', 'src_ip', 'dest_ip', 
    'dest_port', 'http', 'tls', 'dns', 'alert', 'is_analyzed'
]

def fetch_all_suricata_events():
    """Fetches all Suricata events from the PostgreSQL database."""
    connection = psycopg2.connect(**DATABASE_CONFIG)
    cursor = connection.cursor()
    # Select all columns needed for feature extraction
    cursor.execute("SELECT id, timestamp, event_type, src_ip, dest_ip, dest_port, http, tls, dns, alert, is_analyzed FROM suricata_events;")
    events = cursor.fetchall()
    connection.close()
    return events

def fetch_unprocessed_suricata_events():
    """Fetches all unprocessed Suricata events from the PostgreSQL database."""
    connection = psycopg2.connect(**DATABASE_CONFIG)
    cursor = connection.cursor()
    # Select all columns needed for feature extraction
    cursor.execute("SELECT id, timestamp, event_type, src_ip, dest_ip, dest_port, http, tls, dns, alert, is_analyzed FROM suricata_events WHERE is_analyzed = FALSE;")
    events = cursor.fetchall()
    connection.close()
    return events

def fetch_suricata_event_by_id(event_id):
    """Fetches a single Suricata event by its ID."""
    connection = psycopg2.connect(**DATABASE_CONFIG)
    cursor = connection.cursor()
    # Select all columns needed for feature extraction
    cursor.execute("SELECT id, timestamp, event_type, src_ip, dest_ip, dest_port, http, tls, dns, alert, is_analyzed FROM suricata_events WHERE id = %s;", (event_id,))
    event = cursor.fetchone()
    connection.close()
    return event

def update_event_analysis_status(event_id, status):
    """Updates the is_analyzed status of a Suricata event."""
    connection = psycopg2.connect(**DATABASE_CONFIG)
    cursor = connection.cursor()
    cursor.execute("UPDATE suricata_events SET is_analyzed = %s WHERE id = %s;", (status, event_id))
    connection.commit()
    connection.close()

if __name__ == "__main__":
    events = fetch_unprocessed_suricata_events()
    print(json.dumps(events, indent=2, default=str))
