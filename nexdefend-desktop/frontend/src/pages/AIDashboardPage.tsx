import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AnomalyList from '../components/dashboard/AnomalyList';
import MetricsDisplay from '../components/dashboard/MetricsDisplay';
import TrainModelButton from '../components/dashboard/TrainModelButton';
import './AIDashboardPage.css';

const AIDashboardPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [metrics, setMetrics] = useState({ events_processed: 0, anomalies_detected: 0 });

  const fetchAnomalies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/anomalies');
      setAnomalies(response.data.anomalies);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api-metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleTrainModel = async () => {
    try {
      await axios.post('http://localhost:5000/train');
      alert('Model training started successfully');
    } catch (error) {
      console.error('Error training model:', error);
      alert('Failed to start model training');
    }
  };

  useEffect(() => {
    fetchAnomalies();
    fetchMetrics();
  }, []);

  return (
    <div className="ai-dashboard-page">
      <h1>AI Dashboard</h1>
      <TrainModelButton onTrain={handleTrainModel} />
      <MetricsDisplay metrics={metrics} />
      <AnomalyList anomalies={anomalies} />
    </div>
  );
};

export default AIDashboardPage;
