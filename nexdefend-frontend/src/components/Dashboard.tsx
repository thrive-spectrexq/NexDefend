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
  Tooltip,
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import styles from './Dashboard.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
  source: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [threatData, setThreatData] = useState<Threat[]>([]);
  const [alertData, setAlertData] = useState<Alert[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [threatRes, alertRes] = await Promise.all([
          fetch(`${API_URL}/threats`),
          fetch(`${API_URL}/alerts`),
        ]);

        if (!threatRes.ok || !alertRes.ok) throw new Error("Failed to fetch data");

        setThreatData(await threatRes.json());
        setAlertData(await alertRes.json());
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFetchError("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const severityCounts = threatData.reduce((acc: Record<string, number>, threat) => {
    acc[threat.severity] = (acc[threat.severity] || 0) + 1;
    return acc;
  }, {});

  const alertCounts = alertData.reduce((acc: Record<string, number>, alert) => {
    acc[alert.level] = (acc[alert.level] || 0) + 1;
    return acc;
  }, {});

  const threatOverTime = threatData.reduce((acc: Record<string, number>, threat) => {
    const date = new Date(threat.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const alertOverTime = alertData.reduce((acc: Record<string, number>, alert) => {
    const date = new Date(alert.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const alertSources = alertData.reduce((acc: Record<string, number>, alert) => {
    acc[alert.source] = (acc[alert.source] || 0) + 1;
    return acc;
  }, {});

  const threatChartData = {
    labels: Object.keys(severityCounts),
    datasets: [{ label: 'Threat Severity Levels', data: Object.values(severityCounts), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }],
  };

  const alertChartData = {
    labels: Object.keys(alertCounts),
    datasets: [{ label: 'Alert Levels', data: Object.values(alertCounts), backgroundColor: ['#4BC0C0', '#FF9F40', '#FF6384'] }],
  };

  const threatOverTimeChartData = {
    labels: Object.keys(threatOverTime),
    datasets: [{ label: 'Threats Over Time', data: Object.values(threatOverTime), borderColor: '#FF6384', fill: false }],
  };

  const alertOverTimeChartData = {
    labels: Object.keys(alertOverTime),
    datasets: [{ label: 'Alerts Over Time', data: Object.values(alertOverTime), borderColor: '#36A2EB', fill: false }],
  };

  const alertSourceChartData = {
    labels: Object.keys(alertSources),
    datasets: [{ label: 'Alert Sources', data: Object.values(alertSources), backgroundColor: ['#FFCE56', '#4BC0C0', '#36A2EB'] }],
  };

  return (
    <div className={styles.dashboard}>
      <h2>System Overview</h2>
      {fetchError && <p className={styles.error}>{fetchError}</p>}

      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          <h3>Threat Severity Distribution</h3>
          <Pie data={threatChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className={styles.chart}>
          <h3>Alert Level Distribution</h3>
          <Bar data={alertChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className={styles.chart}>
          <h3>Threats Over Time</h3>
          <Line data={threatOverTimeChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className={styles.chart}>
          <h3>Alerts Over Time</h3>
          <Line data={alertOverTimeChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className={styles.chart}>
          <h3>Alert Source Distribution</h3>
          <Pie data={alertSourceChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className={styles.eventList}>
        <h3>Recent Threats</h3>
        <ul>{threatData.slice(0, 5).map(threat => <li key={threat.id}><strong>{threat.severity}</strong> - {threat.description}</li>)}</ul>
      </div>

      <div className={styles.eventList}>
        <h3>Recent Alerts</h3>
        <ul>{alertData.slice(0, 5).map(alert => <li key={alert.id}><strong>{alert.level}</strong> - {alert.message}</li>)}</ul>
      </div>
    </div>
  );
};

export default Dashboard;
