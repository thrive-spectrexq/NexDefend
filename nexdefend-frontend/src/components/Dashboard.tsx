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

interface AnalysisResult {
  type: string;
  value: number;
}

interface Anomaly {
  id: string;
  description: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [threatData, setThreatData] = useState<Threat[]>([]);
  const [alertData, setAlertData] = useState<Alert[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisResult[]>([]);
  const [anomalyData, setAnomalyData] = useState<Anomaly[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [threatRes, alertRes, analysisRes, anomalyRes] = await Promise.all([
          fetch(`${API_URL}/threats`),
          fetch(`${API_URL}/alerts`),
          fetch(`${API_URL}/python-analysis`),
          fetch(`${API_URL}/python-anomalies`),
        ]);

        if (!threatRes.ok || !alertRes.ok || !analysisRes.ok || !anomalyRes.ok)
          throw new Error("Failed to fetch data");

        setThreatData(await threatRes.json());
        setAlertData(await alertRes.json());
        setAnalysisData(await analysisRes.json());
        setAnomalyData(await anomalyRes.json());
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

  const analysisChartData = {
    labels: analysisData.map((result) => result.type),
    datasets: [
      {
        label: 'Analysis Results',
        data: analysisData.map((result) => result.value),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
      },
    ],
  };

  const anomalyChartData = {
    labels: anomalyData.map((anomaly) => new Date(anomaly.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Anomalies Detected',
        data: anomalyData.map(() => 1),
        borderColor: '#FF6384',
        fill: false,
      },
    ],
  };

  return (
    <div className={styles.dashboard}>
      <h2>System Overview</h2>
      {fetchError && <p className={styles.error}>{fetchError}</p>}

      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          <h3>Threat Severity Distribution</h3>
          <Pie data={{
            labels: Object.keys(severityCounts),
            datasets: [{ label: 'Threat Severity Levels', data: Object.values(severityCounts), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }],
          }} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className={styles.chart}>
          <h3>Alert Level Distribution</h3>
          <Bar data={{
            labels: Object.keys(alertCounts),
            datasets: [{ label: 'Alert Levels', data: Object.values(alertCounts), backgroundColor: ['#4BC0C0', '#FF9F40', '#FF6384'] }],
          }} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className={styles.chart}>
          <h3>Analysis Results</h3>
          <Pie data={analysisChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className={styles.chart}>
          <h3>Anomalies Detected</h3>
          <Line data={anomalyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
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

      <div className={styles.eventList}>
        <h3>Recent Anomalies</h3>
        <ul>{anomalyData.slice(0, 5).map(anomaly => <li key={anomaly.id}>{anomaly.description}</li>)}</ul>
      </div>
    </div>
  );
};

export default Dashboard;
