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
          <h1 className={styles.heroTitle}>The Open Source Security Platform</h1>
          <p className={styles.heroSubtitle}>
            Unified XDR and SIEM protection for endpoints and cloud workloads.
          </p>
          <div className={styles.heroButtons}>
            <button onClick={() => navigate('/login')} className={`${styles.btn} ${styles.btnPrimary}`}>Install NexDefend</button>
            <button onClick={() => navigate('/login')} className={`${styles.btn} ${styles.btnSecondary}`}>Free Cloud Trial</button>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src="https://wazuh.com/wp-content/themes/wazuh-v3/assets/images/home/wazuh-dashboard-wide.png?ver=1756220110980" alt="NexDefend Dashboard" />
        </div>
      </section>

      {/* Trusted By Section */}
      <section className={styles.trustedBySection}>
        <h2>Trusted by Leading Companies</h2>
        <div className={styles.logos}>
          <img src="https://wazuh.com/uploads/2024/11/Link-143x75-1.png?v=1732895037" alt="Linkurious" />
          <img src="https://wazuh.com/uploads/2024/11/Telefonica-143x75-1.png?v=1732895377" alt="Telefonica" />
          <img src="https://wazuh.com/uploads/2024/11/Globant-143x75-1.png?v=1732895471" alt="Globant" />
          <img src="https://wazuh.com/uploads/2024/01/nasa-gray.png?v=1705340438" alt="NASA" />
          <img src="https://wazuh.com/uploads/2024/01/Rappi-gray.png?v=1705340476" alt="Rappi" />
          <img src="https://wazuh.com/uploads/2024/01/143x75-mondelez.png?v=1705433179" alt="Mondelez" />
          <img src="https://wazuh.com/uploads/2024/01/Intuit.png?v=1705340341" alt="Intuit" />
          <img src="https://wazuh.com/uploads/2024/01/Ebay-gray.png?v=1705340201" alt="Ebay" />
          <img src="https://wazuh.com/uploads/2024/01/Cisco-gray.png?v=1705339557" alt="Cisco" />
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2>Endpoint and Cloud Workload Protection</h2>
        <p>NexDefend unifies historically separate functions into a single agent and platform architecture.</p>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>Endpoint Security</h3>
            <ul>
              <li>Configuration Assessment</li>
              <li>Malware Detection</li>
              <li>File Integrity Monitoring</li>
            </ul>
          </div>
          <div className={styles.featureCard}>
            <h3>Threat Intelligence</h3>
            <ul>
              <li>Threat Hunting</li>
              <li>Log Data Analysis</li>
              <li>Vulnerability Detection</li>
            </ul>
          </div>
          <div className={styles.featureCard}>
            <h3>Security Operations</h3>
            <ul>
              <li>Incident Response</li>
              <li>Regulatory Compliance</li>
              <li>IT Hygiene</li>
            </ul>
          </div>
          <div className={styles.featureCard}>
            <h3>Cloud Security</h3>
            <ul>
              <li>Container Security</li>
              <li>Posture Management</li>
              <li>Workload Protection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={styles.statsSection}>
        <div className={styles.statItem}>
          <div className={styles.statIcon}><i className="fas fa-server"></i></div>
          <h3>15+ Million</h3>
          <p>Protected Endpoints</p>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statIcon}><i className="fas fa-users"></i></div>
          <h3>100+ Thousand</h3>
          <p>Enterprise Users</p>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statIcon}><i className="fas fa-download"></i></div>
          <h3>30+ Million</h3>
          <p>Downloads per Year</p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <h2>What Our Customers Say</h2>
        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonial}>
            <p>"We found in NexDefend the most complete security platform. We were seeking an open source SIEM solution that allowed scalability and integration with other tools, which made NexDefend the perfect fit."</p>
            <cite>- Martin Petracca, IT Security Manager</cite>
          </div>
          <div className={styles.testimonial}>
            <p>"In addition to the great advantage of being an open source platform, NexDefend is also easy to deploy, and its multiple capabilities have allowed us to achieve our goal with security at Woop. NexDefend is a unique tool and it’s perfect for startups like Woop that are looking for top security at a competitive cost.”</p>
            <cite>- Haithem Souala, Site Reliability Engineer</cite>
          </div>
          <div className={styles.testimonial}>
            <p>“Thanks to the excellent support, even if a person doesn't know much about NexDefend, they will be able to achieve their objectives because the support team will back them up whenever needed.”</p>
            <cite>- Jorge Temoche, Chief Information Security Officer</cite>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
