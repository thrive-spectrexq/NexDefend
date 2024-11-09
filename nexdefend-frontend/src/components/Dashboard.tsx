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
import { Bar, Pie } from 'react-chartjs-2';
import styles from './Dashboard.module.css';

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

const Dashboard: React.FC = () => {
  const [threatData, setThreatData] = useState<Threat[]>([]);
  const [alertData, setAlertData] = useState<Alert[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch latest data from backend periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [threatRes, alertRes] = await Promise.all([
          fetch(`${API_URL}/threats`),
          fetch(`${API_URL}/alerts`),
        ]);

        if (!threatRes.ok || !alertRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const threats = await threatRes.json();
        const alerts = await alertRes.json();

        setThreatData(threats);
        setAlertData(alerts);
        setFetchError(null); // Reset error on successful fetch
      } catch (error) {
        console.error("Error fetching data:", error);
        setFetchError("Error fetching data. Please try again later.");
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Data processing for charts
  const severityCounts = threatData.reduce((acc: Record<string, number>, threat) => {
    acc[threat.severity] = (acc[threat.severity] || 0) + 1;
    return acc;
  }, {});

  const alertCounts = alertData.reduce((acc: Record<string, number>, alert) => {
    acc[alert.level] = (acc[alert.level] || 0) + 1;
    return acc;
  }, {});

  // Chart configurations
  const threatChartData = {
    labels: Object.keys(severityCounts),
    datasets: [{
      label: 'Threat Severity Levels',
      data: Object.values(severityCounts),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    }],
  };

  const alertChartData = {
    labels: Object.keys(alertCounts),
    datasets: [{
      label: 'Alert Levels',
      data: Object.values(alertCounts),
      backgroundColor: ['#4BC0C0', '#FF9F40', '#FF6384'],
    }],
  };

  return (
    <div className={styles.dashboard}>
      <h2>System Overview</h2>
      
      {fetchError && <p className={styles.error}>{fetchError}</p>}

      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          <h3>Threat Severity Distribution</h3>
          {threatData.length > 0 && (
            <Pie data={threatChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          )}
        </div>
        
        <div className={styles.chart}>
          <h3>Alert Level Distribution</h3>
          {alertData.length > 0 && (
            <Bar data={alertChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          )}
        </div>
      </div>

      <div className={styles.eventList}>
        <h3>Recent Threats</h3>
        {threatData.length > 0 ? (
          <ul>
            {threatData.slice(0, 5).map(threat => (
              <li key={threat.id}>
                <strong>{threat.severity}</strong> - {threat.description} at {new Date(threat.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No threats available.</p>
        )}
      </div>

      <div className={styles.eventList}>
        <h3>Recent Alerts</h3>
        {alertData.length > 0 ? (
          <ul>
            {alertData.slice(0, 5).map(alert => (
              <li key={alert.id}>
                <strong>{alert.level}</strong> - {alert.message}
              </li>
            ))}
          </ul>
        ) : (
          <p>No alerts available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
