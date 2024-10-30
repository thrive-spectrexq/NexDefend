import React, { useState } from 'react';
import styles from './ThreatDetection.module.css';

const API_URL = "http://localhost:8080";

interface Threat {
  id: string;
  threat_type: string;
  description: string;
  detected_at: string;
}

const ThreatDetection: React.FC = () => {
  const [results, setResults] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDetection = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/threats`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to run threat detection');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError('Error running threat detection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Threat Detection</h2>
      <button onClick={handleDetection} disabled={loading} className={styles.detectButton}>
        {loading ? 'Running...' : 'Run Threat Detection'}
      </button>
      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Threat Type</th>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>{result.threat_type}</td>
              <td>{result.description}</td>
              <td>{result.detected_at}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {results.length === 0 && !loading && !error && <p className={styles.noResults}>No threats detected.</p>}
    </div>
  );
};

export default ThreatDetection;
