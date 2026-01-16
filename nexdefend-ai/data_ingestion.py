import sqlite3
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Use the shared file path from environment or default
DB_PATH = os.getenv("DB_PATH", "/data/nexdefend.db")

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # Access columns by name
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        return None

def fetch_all_suricata_events():
    """Fetches all Suricata events from the SQLite database."""
    conn = get_db_connection()
    if not conn: return []
    
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, timestamp, event_type, src_ip, dest_ip, dest_port, http, tls, dns, alert, is_analyzed FROM suricata_events;")
        events = [dict(row) for row in cursor.fetchall()]
    except sqlite3.OperationalError:
        # Table might not exist yet if Go hasn't migrated it
        events = []
    finally:
        conn.close()
    return events

def fetch_unprocessed_suricata_events():
    """Fetches all unprocessed Suricata events (is_analyzed = 0 or FALSE)."""
    conn = get_db_connection()
    if not conn: return []
    
    cursor = conn.cursor()
    try:
        # SQLite uses 0 for False. We check for 0 or NULL.
        cursor.execute("SELECT id, timestamp, event_type, src_ip, dest_ip, dest_port, http, tls, dns, alert, is_analyzed FROM suricata_events WHERE is_analyzed = 0 OR is_analyzed IS NULL;")
        events = [dict(row) for row in cursor.fetchall()]
    except sqlite3.OperationalError:
        events = []
    finally:
        conn.close()
    return events

def fetch_suricata_event_by_id(event_id):
    """Fetches a single Suricata event by its ID."""
    conn = get_db_connection()
    if not conn: return None
    
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, timestamp, event_type, src_ip, dest_ip, dest_port, http, tls, dns, alert, is_analyzed FROM suricata_events WHERE id = ?;", (event_id,))
        row = cursor.fetchone()
        event = dict(row) if row else None
    finally:
        conn.close()
    return event

def update_event_analysis_status(event_id, status):
    """Updates the is_analyzed status of a Suricata event."""
    conn = get_db_connection()
    if not conn: return
    
    cursor = conn.cursor()
    # Convert boolean to int (1/0) for SQLite
    val = 1 if status else 0
    try:
        cursor.execute("UPDATE suricata_events SET is_analyzed = ? WHERE id = ?;", (val, event_id))
        conn.commit()
    finally:
        conn.close()

if __name__ == "__main__":
    # Test execution
    if not os.path.exists(DB_PATH):
        print(f"Warning: Database file not found at {DB_PATH}")
    events = fetch_unprocessed_suricata_events()
    print(json.dumps(events, indent=2, default=str))
