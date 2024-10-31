import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';

const API_URL = "http://localhost:8080";

interface Threat {
  id: string;
  description: string;
  severity: string;
  timestamp: string;
}

interface Alert {
  id: string;
  message: string;
  level: string;
}

interface Upload {
  id: string;
  filename: string;
  timestamp: string;
}

interface Audit {
  id: string;
  status: string;
  findings: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch threats
        const threatsResponse = await fetch(`${API_URL}/api/v1/threats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const threatsData = await threatsResponse.json();
        setThreats(threatsData);

        // Fetch alerts
        const alertsResponse = await fetch(`${API_URL}/api/v1/alerts`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const alertsData = await alertsResponse.json();
        // Ensure alertsData is an array
        if (Array.isArray(alertsData)) {
          setAlerts(alertsData);
        } else {
          console.error("Unexpected alerts data format:", alertsData);
          setAlerts([]); // Reset to empty array if data is not an array
        }

        // Fetch uploads
        const uploadsResponse = await fetch(`${API_URL}/api/v1/upload`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const uploadsData = await uploadsResponse.json();
        setUploads(uploadsData);

        // Fetch audits
        const auditsResponse = await fetch(`${API_URL}/api/v1/audit`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const auditsData = await auditsResponse.json();
        setAudits(auditsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const alertCounts = alerts.reduce(
    (counts, alert) => {
      if (alert.level === 'Critical') counts.critical += 1;
      else if (alert.level === 'Medium') counts.medium += 1;
      else if (alert.level === 'Low') counts.low += 1;
      return counts;
    },
    { critical: 0, medium: 0, low: 0 }
  );

  return (
    <div className={styles.dashboardContainer}>
      <h2>System Overview</h2>

      <section className={styles.section}>
        <h3>Threat Detection</h3>
        <p>Total threats: {threats.length}</p>
        <div className={styles.sectionContent}>
          <ul>
            {threats.map(threat => (
              <li key={threat.id}>
                {threat.description} - Severity: {threat.severity} - {new Date(threat.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Alerts</h3>
        <p className={styles.alertStats}>
          Critical: {alertCounts.critical} | Medium: {alertCounts.medium} | Low: {alertCounts.low}
        </p>
        <div className={styles.sectionContent}>
          <ul>
            {alerts.map(alert => (
              <li key={alert.id}>
                {alert.message} - Level: {alert.level}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Recent Uploads</h3>
        <p>Total uploads: {uploads.length}</p>
        <div className={styles.sectionContent}>
          <ul>
            {uploads.map(upload => (
              <li key={upload.id}>
                {upload.filename} - Uploaded on: {new Date(upload.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Compliance Audits</h3>
        <p>Pending actions: {audits.filter(audit => audit.status === "Pending").length}</p>
        <div className={styles.sectionContent}>
          <ul>
            {audits.map(audit => (
              <li key={audit.id}>
                Findings: {audit.findings} - Status: {audit.status} - Date: {new Date(audit.date).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;