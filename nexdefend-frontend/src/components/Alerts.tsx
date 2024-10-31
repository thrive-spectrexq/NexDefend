import React, { useEffect, useState } from 'react';
import styles from './Alerts.module.css';

const API_URL = "http://localhost:8080";

interface Alert {
  id: string;
  alert_message: string;
  alert_level: string;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [level, setLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/api/v1/alerts?level=${level}&page=${page}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch alerts');
        
        const data = await res.json();
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setAlerts(data);
        } else {
          console.error("Unexpected alerts data format:", data);
          setAlerts([]); // Reset to empty array if data is not an array
        }
      } catch (err) {
        console.error(err); // Log the error for debugging
        setError('Error fetching alerts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [level, page]);

  return (
    <div className={styles.alertsContainer}>
      <h2 className={styles.header}>Alerts</h2>

      <div className={styles.filterContainer}>
        <label htmlFor="levelFilter">Filter by level:</label>
        <select
          id="levelFilter"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className={styles.select}
        >
          <option value="all">All</option>
          <option value="critical">Critical</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading alerts...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : alerts.length === 0 ? (
        <p className={styles.noAlerts}>No alerts to display</p>
      ) : (
        <ul className={styles.alertList}>
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`${styles.alertItem} ${
                alert.alert_level === 'critical'
                  ? styles.critical
                  : alert.alert_level === 'medium'
                  ? styles.medium
                  : styles.low
              }`}
            >
              {alert.alert_message} - <strong>Level:</strong> {alert.alert_level}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.pagination}>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className={styles.pageButton}
        >
          Previous
        </button>
        <span className={styles.pageInfo}>Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={alerts.length === 0}
          className={styles.pageButton}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Alerts;