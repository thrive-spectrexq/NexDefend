import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>NexDefend</h1>
          <p className={styles.heroSubtitle}>
            A security platform that provides real-time system monitoring, AI-powered threat detection, and automated incident response.
          </p>
          <div className={styles.heroButtons}>
            <button onClick={() => navigate('/register')} className={`${styles.btn} ${styles.btnPrimary}`}>Get Started</button>
            <button onClick={() => navigate('/login')} className={`${styles.btn} ${styles.btnSecondary}`}>Login</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2>Features</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>Real-time Threat Detection</h3>
            <p>Ingests and analyzes Suricata logs in real-time.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>AI-Powered Analysis</h3>
            <p>Utilizes machine learning models to detect anomalies and potential threats.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Incident Response</h3>
            <p>Automated incident reporting and management.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Dashboards & Visualization</h3>
            <p>Rich dashboards for visualizing security events and system metrics using Grafana.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Vulnerability Scanning</h3>
            <p>Integrated tools for scanning and managing vulnerabilities.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Compliance Reporting</h3>
            <p>Generates compliance reports based on system activity.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} NexDefend. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
