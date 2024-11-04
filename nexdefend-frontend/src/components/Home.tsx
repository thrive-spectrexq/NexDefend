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
        <h3>Your Trusted Platform for Threat Detection and Incident Response Management</h3>
        <p>NexDefend is a cutting-edge cybersecurity platform designed to provide real-time monitoring, 
          AI-powered threat detection, and automated incident response. With a focus on protecting 
          systems from emerging cyber threats, NexDefend offers robust security features and 
          comprehensive insights for proactive defense.</p>
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
