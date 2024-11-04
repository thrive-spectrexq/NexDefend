import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import styles from './Dashboard.module.css';
import IOCScan from './IOCScan';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchWithAuth = async (endpoint: string) => {
          const response = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
          }

          return response.json();
        };

        const [threatsData, alertsData, uploadsData, auditsData] = await Promise.all([
          fetchWithAuth("/api/v1/threats"),
          fetchWithAuth("/api/v1/alerts"),
          fetchWithAuth("/api/v1/upload"),
          fetchWithAuth("/api/v1/audit"),
        ]);

        setThreats(threatsData || []);
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
        setUploads(uploadsData || []);
        setAudits(auditsData || []);
      } catch (err) {
        setError("Failed to fetch dashboard data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Charts with fallback data
  const alertPieData = useMemo(() => {
    const alertCounts = alerts.reduce(
      (counts, alert) => {
        if (alert.level === 'Critical') counts.critical += 1;
        else if (alert.level === 'Medium') counts.medium += 1;
        else if (alert.level === 'Low') counts.low += 1;
        return counts;
      },
      { critical: 0, medium: 0, low: 0 }
    );

    return {
      labels: ['Critical', 'Medium', 'Low'],
      datasets: [
        {
          data: [alertCounts.critical, alertCounts.medium, alertCounts.low],
          backgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'],
        },
      ],
    };
  }, [alerts]);

  const threatBarData = useMemo(() => {
    const threatSeverityCounts = threats.reduce(
      (counts, threat) => {
        if (threat.severity === 'Critical') counts.critical += 1;
        else if (threat.severity === 'High') counts.high += 1;
        else if (threat.severity === 'Medium') counts.medium += 1;
        else counts.low += 1;
        return counts;
      },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );

    return {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [
        {
          label: 'Threat Severity',
          data: [
            threatSeverityCounts.critical,
            threatSeverityCounts.high,
            threatSeverityCounts.medium,
            threatSeverityCounts.low,
          ],
          backgroundColor: ['#FF6384', '#FF9F40', '#FFCE56', '#36A2EB'],
        },
      ],
    };
  }, [threats]);

  const uploadLineData = useMemo(() => {
    const uploadDates = uploads.map(upload => new Date(upload.timestamp).toLocaleDateString());
    const uploadCounts = uploadDates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(uploadCounts),
      datasets: [
        {
          label: 'Uploads Over Time',
          data: Object.values(uploadCounts),
          fill: false,
          borderColor: '#36A2EB',
        },
      ],
    };
  }, [uploads]);

  return (
    <div className={styles.dashboardContainer}>
      <h2>System Overview</h2>

      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          <section className={styles.section}>
            <h3>Alerts Overview</h3>
            <Pie data={alertPieData} />
          </section>

          <section className={styles.section}>
            <h3>Threats by Severity</h3>
            <Bar data={threatBarData} />
          </section>

          <section className={styles.section}>
            <h3>Uploads Over Time</h3>
            <Line data={uploadLineData} />
          </section>

          <section className={styles.section}>
            <h3>Compliance Audits</h3>
            <p>Pending actions: {audits.filter(audit => audit.status === "Pending").length}</p>
            <ul>
              {audits.map(audit => (
                <li key={audit.id}>
                  Findings: {audit.findings} - Status: {audit.status} - Date: {new Date(audit.date).toLocaleString()}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h3>IOC Scan</h3>
            <IOCScan />
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
