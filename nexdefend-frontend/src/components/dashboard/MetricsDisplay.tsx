import React from 'react';
import './MetricsDisplay.css';

interface Metrics {
  events_processed: number;
  anomalies_detected: number;
}

interface MetricsDisplayProps {
  metrics: Metrics;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  return (
    <div className="metrics-display">
      <h2>AI Service Metrics</h2>
      <div className="metrics-container">
        <div className="metric">
          <p>Events Processed</p>
          <p>{metrics.events_processed}</p>
        </div>
        <div className="metric">
          <p>Anomalies Detected</p>
          <p>{metrics.anomalies_detected}</p>
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;
