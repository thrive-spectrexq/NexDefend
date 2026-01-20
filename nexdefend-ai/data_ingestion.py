import sqlite3
import json
import os
from dotenv import load_dotenv

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    RealDictCursor = None

load_dotenv()

# Configuration
DB_TYPE = os.getenv("DB_TYPE", "sqlite")
DB_PATH = os.getenv("DB_PATH", "/data/nexdefend.db")

# Enterprise DB Config
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "nexdefend")
DB_PASS = os.getenv("DB_PASSWORD", "nexdefend")
DB_NAME = os.getenv("DB_NAME", "nexdefend")
DB_PORT = os.getenv("DB_PORT", "5432")

# Define columns explicitly for consistency
EVENT_COLUMNS = [
    "id", "timestamp", "event_type", "src_ip", "dest_ip", "dest_port",
    "http", "tls", "dns", "alert", "is_analyzed"
]

def get_db_connection():
    """Establishes a connection to either SQLite or PostgreSQL based on env."""
    try:
        if DB_TYPE == "postgres":
            if psycopg2 is None:
                raise ImportError("psycopg2 module not found. Cannot connect to PostgreSQL.")
            conn = psycopg2.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASS,
                dbname=DB_NAME,
                port=DB_PORT
            )
            return conn
        else:
            # Default to SQLite
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            return conn
    except Exception as e:
        print(f"Database connection error ({DB_TYPE}): {e}")
        return None

def execute_query(query, params=()):
    """Executes a query safely handling DB differences."""
    conn = get_db_connection()
    if not conn: return []

    # Adjust placeholders: SQLite uses ?, Postgres uses %s
    if DB_TYPE == "postgres":
        query = query.replace("?", "%s")
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()

    try:
        cursor.execute(query, params)
        if query.strip().upper().startswith("SELECT"):
            results = [dict(row) for row in cursor.fetchall()]
            return results
        else:
            conn.commit()
            return None
    except Exception as e:
        print(f"Query error: {e}")
        return []
    finally:
        conn.close()

def fetch_all_suricata_events():
    cols = ", ".join(EVENT_COLUMNS)
    return execute_query(f"SELECT {cols} FROM suricata_events;")

def fetch_unprocessed_suricata_events():
    cols = ", ".join(EVENT_COLUMNS)
    return execute_query(f"SELECT {cols} FROM suricata_events WHERE is_analyzed = 0 OR is_analyzed IS NULL;")

def fetch_suricata_event_by_id(event_id):
    cols = ", ".join(EVENT_COLUMNS)
    results = execute_query(f"SELECT {cols} FROM suricata_events WHERE id = ?;", (event_id,))
    return results[0] if results else None

def update_event_analysis_status(event_id, status):
    # Convert boolean to int (1/0) because SQLite needs it, Postgres handles bool but int works for both usually
    # However, Postgres 'boolean' type implies 'true'/'false'.
    val = 1 if status else 0
    if DB_TYPE == "postgres":
        val = True if status else False # Use native bool for Postgres

    execute_query("UPDATE suricata_events SET is_analyzed = ? WHERE id = ?;", (val, event_id))

if __name__ == "__main__":
    print(f"Running in {DB_TYPE} mode")
    events = fetch_unprocessed_suricata_events()
    print(json.dumps(events, indent=2, default=str))
