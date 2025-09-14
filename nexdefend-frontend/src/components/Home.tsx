import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

// Sentinel-style hero image (illustrative, not included in code)
// If you want an image, add it to the public folder and use <img src="/hero-image.png" ... />

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>NexDefend</h1>
          <p className={styles.heroSubtitle}>
            Unified Security Operations Platform: Real-time monitoring, AI-powered threat detection, automated incident response, and advanced analytics for modern enterprises.<br />
            Inspired by industry leaders like Microsoft Sentinel, NexDefend delivers comprehensive SIEM and XDR capabilities for cloud, hybrid, and on-prem environments.
          </p>
          <div className={styles.heroButtons}>
            <button onClick={() => navigate('/register')} className={`${styles.btn} ${styles.btnPrimary}`}>Get Started</button>
            <button onClick={() => navigate('/login')} className={`${styles.btn} ${styles.btnSecondary}`}>Login</button>
          </div>
        </div>
        {/* Optionally add a hero image here */}
        {/* <div className={styles.heroImage}><img src="/hero-image.png" alt="NexDefend Dashboard" /></div> */}
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2>Modern Security Operations</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>Cloud-Native SIEM & XDR</h3>
            <p>
              Scalable, cloud-first security architecture. Monitor and defend cloud, hybrid, and on-prem resources seamlessly.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>Real-Time Threat Intelligence</h3>
            <p>
              Ingest and analyze Suricata logs and other telemetry in real-time. Automated detection of suspicious activity and emerging threats.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>AI-Powered Analysis</h3>
            <p>
              Machine learning models powered by advanced analytics to surface anomalies, prioritize alerts, and reduce false positives.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>Automated Incident Response</h3>
            <p>
              Respond to threats faster with playbooks, automated investigation, and integrated remediation workflows.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>Rich Dashboards & Visualization</h3>
            <p>
              Interactive dashboards powered by Grafana for visualizing security events, metrics, and investigation timelines.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>Vulnerability Management</h3>
            <p>
              Integrated scanning and asset management for proactive identification and mitigation of vulnerabilities.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>Compliance Reporting</h3>
            <p>
              Generate audit-ready reports for regulatory compliance, including detailed activity logs and security posture summaries.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>Open Integration Ecosystem</h3>
            <p>
              Connect with third-party security tools, APIs, and data sources for extensibility and custom automation.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3>Collaborative Investigation</h3>
            <p>
              Empower SOC teams with case management, evidence collection, and sharing for streamlined investigations.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section>
        <h2>Why NexDefend?</h2>
        <p style={{ maxWidth: 700, margin: '0 auto', fontSize: '1.1rem', color: '#555' }}>
          NexDefend brings together advanced SIEM and XDR capabilities in a single platform, designed for scale, speed, and simplicity.<br />
          Whether protecting cloud workloads, hybrid infrastructures, or on-prem assets, NexDefend helps your security team detect, investigate, and respond to threats with confidence.
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} NexDefend. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
