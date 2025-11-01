import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>The Open Source Security Platform</h1>
        <p>Unified XDR and SIEM protection for endpoints and cloud workloads.</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">Install NexDefend</Link>
          <Link to="/pricing" className="btn btn-secondary">Free Cloud Trial</Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
