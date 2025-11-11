import React from 'react';
import './AnomalyList.css';

interface Anomaly {
  id: number;
  description: string;
  timestamp: string;
}

interface AnomalyListProps {
  anomalies: Anomaly[];
}

const AnomalyList: React.FC<AnomalyListProps> = ({ anomalies }) => {
  return (
    <div className="anomaly-list">
      <h2>Detected Anomalies</h2>
      {anomalies.length === 0 ? (
        <p>No anomalies detected.</p>
      ) : (
        <ul>
          {anomalies.map((anomaly) => (
            <li key={anomaly.id}>
              <p><strong>ID:</strong> {anomaly.id}</p>
              <p><strong>Description:</strong> {anomaly.description}</p>
              <p><strong>Timestamp:</strong> {anomaly.timestamp}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnomalyList;
