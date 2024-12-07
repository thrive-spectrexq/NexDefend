import psycopg2
import json

DATABASE_CONFIG = {
    "dbname": "nexdefend_db",
    "user": "nexdefend",
    "password": "password",
    "host": "localhost",
    "port": 5432,
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
