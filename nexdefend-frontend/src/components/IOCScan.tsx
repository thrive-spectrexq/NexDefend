// src/components/IOCScan.tsx

import React, { useState } from "react";
import styles from "./IOCScan.module.css";

const API_URL = "http://localhost:8080";

interface IOCResult {
  name: string;
  pid: number;
  path: string;
  parent: string;
  uid: number;
}

const IOCScan: React.FC = () => {
  const [iocName, setIocName] = useState("");
  const [results, setResults] = useState<IOCResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/ioc-scan?name=${encodeURIComponent(iocName)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch IOC scan results");

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Error during IOC scan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>IOC Scan</h2>
      <input
        type="text"
        placeholder="Enter IOC name"
        value={iocName}
        onChange={(e) => setIocName(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleScan} disabled={loading} className={styles.button}>
        {loading ? "Scanning..." : "Run IOC Scan"}
      </button>
      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>PID</th>
            <th>Path</th>
            <th>Parent</th>
            <th>UID</th>
          </tr>
        </thead>
        <tbody>
          {results.length > 0 ? (
            results.map((result, index) => (
              <tr key={index}>
                <td>{result.name}</td>
                <td>{result.pid}</td>
                <td>{result.path}</td>
                <td>{result.parent}</td>
                <td>{result.uid}</td>
              </tr>
            ))
          ) : (
            !loading && <tr><td colSpan={5}>No results found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default IOCScan;
