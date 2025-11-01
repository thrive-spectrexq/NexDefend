import './FeaturesGrid.css';

const FeaturesGrid = () => {
  return (
    <section className="features-grid">
      <div className="feature-item">
        <h3>Endpoint Security</h3>
        <ul>
          <li>Configuration Assessment</li>
          <li>Malware Detection</li>
          <li>File Integrity Monitoring</li>
        </ul>
      </div>
      <div className="feature-item">
        <h3>Threat Intelligence</h3>
        <ul>
          <li>Threat Hunting</li>
          <li>Log Data Analysis</li>
          <li>Vulnerability Detection</li>
        </ul>
      </div>
      <div className="feature-item">
        <h3>Security Operations</h3>
        <ul>
          <li>Incident Response</li>
          <li>Regulatory Compliance</li>
          <li>IT Hygiene</li>
        </ul>
      </div>
      <div className="feature-item">
        <h3>Cloud Security</h3>
        <ul>
          <li>Container Security</li>
          <li>Posture Management</li>
          <li>Workload Protection</li>
        </ul>
      </div>
    </section>
  );
};

export default FeaturesGrid;
