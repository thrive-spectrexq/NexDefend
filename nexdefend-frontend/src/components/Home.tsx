import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    "Comprehensive Threat Detection",
    "Real-Time System Monitoring and Alerts",
    "Incident Response and Reports",
  ];

  return (
    <div className={styles.homeContainer}>
      <section className={styles.heroSection}>
        <h1>NexDefend Real-Time System Monitoring and Threat Detection</h1>
        <p>NexDefend is designed to provide real-time system monitoring, 
          AI-powered threat detection, alerts and automated incident response management 
          that traces from Suricata logs, stores, analyzes and displays the results with dashboards.</p>
        <button onClick={() => navigate('/login')} className={styles.loginButton}>Continue to Dashboard</button>
      </section>
      
      <section className={styles.featuresSection}>
        <h2>Key Features</h2>
        <ul>
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Home;
