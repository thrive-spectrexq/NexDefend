import React from 'react';
import './Hero.css';

interface HeroProps {
  onOpenSidebar: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenSidebar }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Cybersecurity for the AI-Driven Future</h1>
        <p>NexDefend provides a unified AI-powered XDR platform to protect your organization from evolving threats.</p>
        <div className="hero-buttons">
          <button className="primary" onClick={onOpenSidebar}>Get started free</button>
          <button className="secondary" onClick={onOpenSidebar}>Request a demo</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
