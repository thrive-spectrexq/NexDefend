import React from 'react';
import './Hero.css';

interface HeroProps {
  onOpenSidebar: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenSidebar }) => {
  return (
    <section className="hero" aria-label="Hero section">
      <div className="hero-container">
        <div className="hero-left">
          <div className="eyebrow">AI-Powered XDR</div>
          <h1 className="hero-title">Cybersecurity for the AI-Driven Future</h1>
          <p className="hero-subtitle">NexDefend provides a unified AI-powered XDR platform to protect your organization from evolving threats.</p>

          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={onOpenSidebar} aria-label="Get started free">Get started free</button>
            <button className="btn btn-ghost" onClick={onOpenSidebar} aria-label="Request a demo">Request a demo</button>
          </div>

          <ul className="hero-features" aria-hidden>
            <li>
              <span className="feature-dot" />
              Real-time threat detection
            </li>
            <li>
              <span className="feature-dot" />
              Automated incident response
            </li>
            <li>
              <span className="feature-dot" />
              Unified endpoint & cloud protection
            </li>
          </ul>
        </div>

        <div className="hero-right" aria-hidden>
          <div className="illustration" role="img" aria-label="abstract network illustration">
            {/* Lightweight inline SVG illustration to keep no external assets required */}
            <svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" className="network-svg">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feBlend in="SourceGraphic" in2="b" />
                </filter>
              </defs>

              <rect x="0" y="0" width="100%" height="100%" rx="16" fill="rgba(255,255,255,0.03)" />

              <g transform="translate(40,30) scale(0.9)">
                <circle cx="40" cy="40" r="10" fill="url(#g1)" className="node node-1" />
                <circle cx="160" cy="20" r="8" fill="#fff" opacity="0.9" className="node node-2" />
                <circle cx="220" cy="80" r="12" fill="#06b6d4" className="node node-3" />
                <circle cx="120" cy="120" r="9" fill="#7c3aed" className="node node-4" />

                <line x1="40" y1="40" x2="160" y2="20" stroke="url(#g1)" strokeWidth="2" strokeOpacity="0.9" className="link" />
                <line x1="160" y1="20" x2="220" y2="80" stroke="#88f0ff" strokeWidth="1.5" strokeOpacity="0.8" className="link" />
                <line x1="40" y1="40" x2="120" y2="120" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.75" className="link" />
                <line x1="120" y1="120" x2="220" y2="80" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.6" className="link" />

                <g className="glow" filter="url(#f1)">
                  <circle cx="40" cy="40" r="30" fill="url(#g1)" opacity="0.06" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
