import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { Shield, Activity, Cpu, BarChart3, Zap, FileCheck, Network, Users } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { title: "Cloud-Native SIEM & XDR", desc: "Seamless monitoring across cloud, hybrid, and on-prem environments.", icon: <CloudIcon /> },
    { title: "Real-Time Threat Intelligence", desc: "Ingest & analyze Suricata logs, detect suspicious activity instantly.", icon: <Activity /> },
    { title: "AI-Powered Analysis", desc: "Advanced ML models prioritize alerts & reduce false positives.", icon: <Cpu /> },
    { title: "Automated Incident Response", desc: "Respond faster with playbooks & remediation workflows.", icon: <Zap /> },
    { title: "Dashboards & Visualization", desc: "Grafana-powered dashboards with deep investigation insights.", icon: <BarChart3 /> },
    { title: "Compliance Reporting", desc: "Generate audit-ready reports for regulatory requirements.", icon: <FileCheck /> },
    { title: "Open Integration Ecosystem", desc: "Connect with 3rd-party tools & APIs for extensibility.", icon: <Network /> },
    { title: "Collaborative Investigation", desc: "SOC teams streamline evidence collection & case management.", icon: <Users /> }
  ];

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>NexDefend</h1>
          <p className={styles.heroSubtitle}>
            Unified Security Operations Platform for the modern enterprise.  
            Real-time monitoring, AI-powered threat detection, automated incident response, and compliance-ready analytics.
          </p>
          <div className={styles.heroButtons}>
            <button onClick={() => navigate('/register')} className={`${styles.btn} ${styles.btnPrimary}`}>Get Started</button>
            <button onClick={() => navigate('/login')} className={`${styles.btn} ${styles.btnSecondary}`}>Login</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <h2>Modern Security Operations</h2>
        <div className={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.iconWrapper}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className={styles.aboutSection}>
        <h2>Why NexDefend?</h2>
        <p>
          Built to scale like Microsoft Sentinel, NexDefend unifies SIEM and XDR into a single, AI-driven security platform.  
          Protect cloud workloads, hybrid infrastructures, and on-prem assets — detect, investigate, and respond with confidence.
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} NexDefend. All rights reserved.</p>
      </footer>
    </div>
  );
};

const CloudIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="lucide lucide-cloud" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19a4.5 4.5 0 0 0 .5-9 7 7 0 0 0-13.9 1.5A4.5 4.5 0 0 0 6.5 19h11z"/></svg>
);

export default Home;
