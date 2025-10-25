import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

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
  const [search, setSearch] = useState('');

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
          setError('Unexpected response format');
        }
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [level, page]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const filteredAlerts = alerts.filter(alert =>
    alert.alert_message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Alerts</h2>
      {error && <p>{error}</p>}
      <div>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">All Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="text"
          placeholder="Search alerts"
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {filteredAlerts.map(alert => (
            <div key={alert.id}>
              <p><strong>Message:</strong> {alert.alert_message}</p>
              <p><strong>Level:</strong> {alert.alert_level}</p>
            </div>
          ))}
        </div>
      )}
      <div>
        <button onClick={() => setPage(page => Math.max(page - 1, 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page => page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Alerts;
