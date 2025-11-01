import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>The Open Source Security Platform</h1>
        <p>Unified XDR and SIEM protection for endpoints and cloud workloads.</p>
        <div className="hero-buttons">
          <Link to="/getting-started" className="btn btn-primary">Install NexDefend</Link>
          <Link to="/cloud-trial" className="btn btn-secondary">Free Cloud Trial</Link>
        </div>
      </div>
      <div className="hero-image">
        <img src="https://via.placeholder.com/600x400.png/1a1a1a/ffffff?text=NexDefend+Dashboard" alt="NexDefend Dashboard" />
      </div>
    </section>
  );
};

export default Hero;
