
import logging
import json
import psycopg2
from datetime import datetime

class BehaviorModel:
    def __init__(self, user, db_pool):
        self.user = user
        self.db_pool = db_pool
        self.baseline = {}
        self.last_updated = None
        self.dirty = False # Flag to indicate if model has changed since load
        self._load_from_db()

    def _load_from_db(self):
        """Loads the baseline from the database using the connection pool."""
        conn = None
        try:
            conn = self.db_pool.getconn()
            cursor = conn.cursor()
            cursor.execute("SELECT baseline_data, last_updated FROM ueba_models WHERE username = %s;", (self.user,))
            row = cursor.fetchone()
            if row:
                self.baseline = row[0]
                self.last_updated = row[1]
                logging.info(f"Loaded UEBA model for user {self.user}")
            else:
                logging.info(f"No existing UEBA model for user {self.user}, starting fresh.")
        except Exception as e:
            logging.error(f"Error loading UEBA model for {self.user}: {e}")
        finally:
            if conn:
                self.db_pool.putconn(conn)

    def save_to_db(self):
        """Saves the baseline to the database if it is dirty."""
        if not self.dirty:
            return

        conn = None
        try:
            conn = self.db_pool.getconn()
            cursor = conn.cursor()
            query = """
                INSERT INTO ueba_models (username, baseline_data, last_updated)
                VALUES (%s, %s, %s)
                ON CONFLICT (username) DO UPDATE
                SET baseline_data = EXCLUDED.baseline_data,
                    last_updated = EXCLUDED.last_updated;
            """
            cursor.execute(query, (self.user, json.dumps(self.baseline), datetime.now()))
            conn.commit()
            logging.debug(f"Saved UEBA model for user {self.user}")
            self.dirty = False
        except Exception as e:
            logging.error(f"Error saving UEBA model for {self.user}: {e}")
        finally:
             if conn:
                self.db_pool.putconn(conn)

    def update_baseline(self, events):
        """Updates the baseline with new events."""
        changed = False
        for event in events:
            event_type = event.get("event_type")
            if event_type:
                if event_type not in self.baseline:
                    self.baseline[event_type] = 0
                self.baseline[event_type] += 1
                changed = True

        if changed:
            self.dirty = True

    def detect_anomalies(self, event):
        """Detects anomalies in the user's behavior."""
        event_type = event.get("event_type")
        if event_type and event_type not in self.baseline:
             return True
        return False
