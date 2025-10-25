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

const API_URL = process.env.REACT_APP_API_URL;

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

interface ApiMetrics {
  events_processed: number;
  anomalies_detected: number;
}

const Dashboard: React.FC = () => {
  const [threatData, setThreatData] = useState<Threat[]>([]);
  const [alertData, setAlertData] = useState<Alert[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisResult[]>([]);
  const [anomalyData, setAnomalyData] = useState<Anomaly[]>([]);
  const [apiMetrics, setApiMetrics] = useState<ApiMetrics | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [threatRes, alertRes, analysisRes, anomalyRes, apiMetricsRes] = await Promise.all([
          fetch(`${API_URL}/threats`),
          fetch(`${API_URL}/alerts`),
          fetch(`${API_URL}/python-analysis`),
          fetch(`${API_URL}/python-anomalies`),
          fetch(`${process.env.REACT_APP_AI_API_URL}/api-metrics`),
        ]);

        if (!threatRes.ok || !alertRes.ok || !analysisRes.ok || !anomalyRes.ok || !apiMetricsRes.ok)
          throw new Error("Failed to fetch data");

        setThreatData(await threatRes.json());
        setAlertData(await alertRes.json());
        setAnalysisData(await analysisRes.json());
        setAnomalyData(await anomalyRes.json());
        setApiMetrics(await apiMetricsRes.json());
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFetchError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'dashboardUpdate') {
        setThreatData(data.threats);
        setAlertData(data.alerts);
        setAnalysisData(data.analysis);
        setAnomalyData(data.anomalies);
        setApiMetrics(data.apiMetrics);
      }
    };

    ws.onclose = () => {
      console.log('disconnected');
    };

    return () => {
      ws.close();
    };
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
    <div className="p-5 font-sans">
      <h2 className="text-4xl mb-5 text-gray-800">System Overview</h2>
      {loading ? (
        <p>Loading data...</p>
      ) : fetchError ? (
        <p className="text-red-500 text-xl mb-5">{fetchError}</p>
      ) : (
        <>
          <div className="flex gap-5 mb-5">
            <div className="flex-1 bg-white rounded-lg shadow-md p-5 text-center">
              <h3 className="text-xl mb-2 text-gray-600">Events Processed</h3>
              <p className="text-3xl font-bold text-gray-800">{apiMetrics?.events_processed}</p>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-md p-5 text-center">
              <h3 className="text-xl mb-2 text-gray-600">Anomalies Detected</h3>
              <p className="text-3xl font-bold text-gray-800">{apiMetrics?.anomalies_detected}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <div className="flex-1 basis-full md:basis-1/2-5 bg-white rounded-lg shadow-md p-5 mb-5">
              <h3 className="text-2xl mb-2 text-gray-600">Threat Severity Distribution</h3>
              <Pie data={{
                labels: Object.keys(severityCounts),
                datasets: [{ label: 'Threat Severity Levels', data: Object.values(severityCounts), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }],
              }} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>

            <div className="flex-1 basis-full md:basis-1/2-5 bg-white rounded-lg shadow-md p-5 mb-5">
              <h3 className="text-2xl mb-2 text-gray-600">Alert Level Distribution</h3>
              <Bar data={{
                labels: Object.keys(alertCounts),
                datasets: [{ label: 'Alert Levels', data: Object.values(alertCounts), backgroundColor: ['#4BC0C0', '#FF9F40', '#FF6384'] }],
              }} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>

            <div className="flex-1 basis-full md:basis-1/2-5 bg-white rounded-lg shadow-md p-5 mb-5">
              <h3 className="text-2xl mb-2 text-gray-600">Analysis Results</h3>
              <Pie data={analysisChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>

            <div className="flex-1 basis-full md:basis-1/2-5 bg-white rounded-lg shadow-md p-5 mb-5">
              <h3 className="text-2xl mb-2 text-gray-600">Anomalies Detected</h3>
              <Line data={anomalyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="w-full bg-white rounded-lg shadow-md p-5 mb-5">
            <h3 className="text-2xl mb-2 text-gray-600">Recent Threats</h3>
            <ul className="list-none p-0">{threatData.slice(0, 5).map(threat => <li key={threat.id} className="text-base mb-1 text-gray-700"><strong>{threat.severity}</strong> - {threat.description}</li>)}</ul>
          </div>

          <div className="w-full bg-white rounded-lg shadow-md p-5 mb-5">
            <h3 className="text-2xl mb-2 text-gray-600">Recent Alerts</h3>
            <ul className="list-none p-0">{alertData.slice(0, 5).map(alert => <li key={alert.id} className="text-base mb-1 text-gray-700"><strong>{alert.level}</strong> - {alert.message}</li>)}</ul>
          </div>

          <div className="w-full bg-white rounded-lg shadow-md p-5 mb-5">
            <h3 className="text-2xl mb-2 text-gray-600">Recent Anomalies</h3>
            <ul className="list-none p-0">{anomalyData.slice(0, 5).map(anomaly => <li key={anomaly.id} className="text-base mb-1 text-gray-700">{anomaly.description}</li>)}</ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
