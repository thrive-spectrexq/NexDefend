
import pytest
from unittest.mock import MagicMock, patch
from ueba.behavior_model import BehaviorModel
import json

@pytest.fixture
def mock_db_pool():
    pool = MagicMock()
    conn = MagicMock()
    cursor = MagicMock()
    pool.getconn.return_value = conn
    conn.cursor.return_value = cursor
    return pool, conn, cursor

def test_behavior_model_load_fresh(mock_db_pool):
    pool, conn, cursor = mock_db_pool
    # Mock DB returning nothing
    cursor.fetchone.return_value = None

    model = BehaviorModel("test_user", pool)

    assert model.baseline == {}
    assert model.last_updated is None
    pool.getconn.assert_called()
    pool.putconn.assert_called_with(conn)

def test_behavior_model_load_existing(mock_db_pool):
    pool, conn, cursor = mock_db_pool
    # Mock DB returning existing data
    cursor.fetchone.return_value = ({"process": 10}, "2023-01-01 10:00:00")

    model = BehaviorModel("test_user", pool)

    assert model.baseline == {"process": 10}
    assert model.last_updated == "2023-01-01 10:00:00"

def test_update_baseline(mock_db_pool):
    pool, conn, cursor = mock_db_pool
    # Simulate fresh user
    cursor.fetchone.return_value = None

    model = BehaviorModel("test_user", pool)

    events = [{"event_type": "process"}, {"event_type": "net_connection"}]
    model.update_baseline(events)

    assert model.baseline.get("process") == 1
    assert model.baseline.get("net_connection") == 1
    assert model.dirty is True

def test_save_to_db_only_if_dirty(mock_db_pool):
    pool, conn, cursor = mock_db_pool
    # Simulate fresh user
    cursor.fetchone.return_value = None

    model = BehaviorModel("test_user", pool)

    # Reset mock to ignore the call during __init__
    cursor.execute.reset_mock()

    # Not dirty, should not save
    model.save_to_db()
    cursor.execute.assert_not_called()

    # Make dirty
    model.dirty = True
    model.save_to_db()

    cursor.execute.assert_called()
    assert "INSERT INTO ueba_models" in cursor.execute.call_args[0][0]
    assert model.dirty is False # Should be reset
