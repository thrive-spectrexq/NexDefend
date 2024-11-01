// src/components/Dashboard.tsx
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const threatsResponse = await fetch(`${API_URL}/api/v1/threats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const threatsData = await threatsResponse.json();
        setThreats(threatsData);

        const alertsResponse = await fetch(`${API_URL}/api/v1/alerts`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const alertsData = await alertsResponse.json();
        if (Array.isArray(alertsData)) setAlerts(alertsData);
        else console.error("Unexpected alerts data format:", alertsData);

        const uploadsResponse = await fetch(`${API_URL}/api/v1/upload`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const uploadsData = await uploadsResponse.json();
        setUploads(uploadsData);

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

  // Data for Pie Chart (Alerts)
  const alertCounts = alerts.reduce(
    (counts, alert) => {
      if (alert.level === 'Critical') counts.critical += 1;
      else if (alert.level === 'Medium') counts.medium += 1;
      else if (alert.level === 'Low') counts.low += 1;
      return counts;
    },
    { critical: 0, medium: 0, low: 0 }
  );

  const alertPieData = {
    labels: ['Critical', 'Medium', 'Low'],
    datasets: [
      {
        data: [alertCounts.critical, alertCounts.medium, alertCounts.low],
        backgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'],
      },
    ],
  };

  // Data for Bar Chart (Threats by Severity)
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

  const threatBarData = {
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

  // Data for Line Chart (Uploads over Time)
  const uploadDates = uploads.map(upload => new Date(upload.timestamp).toLocaleDateString());
  const uploadCounts = uploadDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uploadLineData = {
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

  return (
    <div className={styles.dashboardContainer}>
      <h2>System Overview</h2>

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

      {/* IOC Scan Section */}
      <section className={styles.section}>
        <h3>IOC Scan</h3>
        <IOCScan />
      </section>
    </div>
  );
};

export default Dashboard;
