import React, { useState } from 'react';
import styles from './ThreatDetection.module.css';

const API_URL = "http://localhost:8080";

interface Threat {
  id: string;
  threat_type: string;
  description: string;
  detected_at: string;
}

interface PythonThreat {
  id: string;
  analysis_type: string;
  description: string;
  detected_at: string;
}

const ThreatDetection: React.FC = () => {
  const [results, setResults] = useState<Threat[]>([]);
  const [pythonResults, setPythonResults] = useState<PythonThreat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDetection = async () => {
    setLoading(true);
    setError('');
    try {
      const [threatRes, pythonRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/threats`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${API_URL}/python-analysis`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (!threatRes.ok || !pythonRes.ok)
        throw new Error('Failed to fetch threat detection results');

      const threatData = await threatRes.json();
      const pythonData = await pythonRes.json();

      setResults(threatData);
      setPythonResults(pythonData);
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

      <h3>Threats Detected by the System</h3>
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

      <h3>Python-Generated Threat Analysis</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Analysis Type</th>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {pythonResults.map((result) => (
            <tr key={result.id}>
              <td>{result.analysis_type}</td>
              <td>{result.description}</td>
              <td>{result.detected_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pythonResults.length === 0 && !loading && !error && <p className={styles.noResults}>No Python-generated threats detected.</p>}
    </div>
  );
};

export default ThreatDetection;
