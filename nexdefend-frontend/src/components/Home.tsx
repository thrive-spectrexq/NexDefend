// src/components/Home.tsx
import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to NexDefend</h1>
        <p>Your trusted platform for threat detection and incident management.</p>
        <a href="/login" className="login-button">Log in to continue</a>
      </div>
      <div className="features-section">
        <h2>Key Features</h2>
        <ul>
          <li>Comprehensive Threat Detection</li>
          <li>Real-Time Alerts and Monitoring</li>
          <li>Incident Management Tools</li>
          <li>Compliance Audits and Reports</li>
          <li>User-Friendly Dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
