import React, { useState } from 'react';
import styles from './TrivyScan.module.css';

const API_URL = "http://localhost:8080/api/v1/vulnerability-scan";

interface ScanRequest {
  target: string;
  type: string;
}

interface Vulnerability {
  ID: string;
  Title: string;
  Description: string;
  Severity: string;
}

interface ScanResult {
  target: string;
  rawOutput: string;
  parsed: Vulnerability[];
  error: string;
}

const TrivyScan: React.FC = () => {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('image');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setError('');
    setLoading(true);

    const request: ScanRequest = { target, type: scanType };
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate the scan');
      }

      const result: ScanResult = await response.json();
      setScanResult(result);
    } catch (err) {
      // Check if 'err' is an instance of Error and extract the message
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during the scan');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Trivy Vulnerability Scanner</h2>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.form}>
        <input
          type="text"
          placeholder="Target (e.g., image or path)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className={styles.input}
        />
        <select
          value={scanType}
          onChange={(e) => setScanType(e.target.value)}
          className={styles.select}
        >
          <option value="image">Container Image</option>
          <option value="fs">Filesystem</option>
          <option value="config">Configuration</option>
        </select>
        <button onClick={handleScan} className={styles.button} disabled={loading}>
          {loading ? 'Scanning...' : 'Start Scan'}
        </button>
      </div>

      {scanResult && (
        <div className={styles.results}>
          <h3>Scan Results for: {scanResult.target}</h3>
          {scanResult.parsed.length > 0 ? (
            <ul className={styles.vulnerabilityList}>
              {scanResult.parsed.map((vuln, index) => (
                <li key={index} className={styles.vulnerabilityItem}>
                  <strong>{vuln.ID}</strong>: {vuln.Title}
                  <p>{vuln.Description}</p>
                  <span className={`${styles.severity} ${styles[vuln.Severity.toLowerCase()]}`}>
                    {vuln.Severity}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No vulnerabilities found.</p>
          )}
          {scanResult.rawOutput && (
            <details>
              <summary>View Raw Output</summary>
              <pre className={styles.rawOutput}>{scanResult.rawOutput}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default TrivyScan;
