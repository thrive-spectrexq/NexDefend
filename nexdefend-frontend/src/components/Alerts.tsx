// src/components/Alerts.tsx
import React, { useEffect, useState } from 'react';

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
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch alerts');
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        setError('Error fetching alerts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [level, page]);

  return (
    <div>
      <h2>Alerts</h2>
      <div>
        <label>Filter by level:</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">All</option>
          <option value="critical">Critical</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <p>Loading alerts...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {alerts.map((alert) => (
            <li key={alert.id}>
              {alert.alert_message} - Level: {alert.alert_level}
            </li>
          ))}
        </ul>
      )}

      <div>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={alerts.length === 0} // Disable if no more alerts to show
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Alerts;
