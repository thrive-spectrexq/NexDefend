import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    "Comprehensive Threat Detection",
    "Real-Time Alerts and Monitoring",
    "Incident Management Tools",
    "Compliance Audits and Reports",
    "User-Friendly Dashboard"
  ];

  return (
    <div className={styles.homeContainer}>
      <section className={styles.heroSection}>
        <h1>Welcome to NexDefend</h1>
        <p>Your trusted platform for threat detection and incident management.</p>
        <button onClick={() => navigate('/login')} className={styles.loginButton}>Log in to continue</button>
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
