import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
// Using lucide-react, which is already a dependency
import { Shield, Github, Twitter, Linkedin } from 'lucide-react'; 

const Footer: React.FC = () => {
  return (
    <footer className="nd-footer">
      <div className="nd-container">
        {/* Column 1: Brand & Social */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <Shield size={20} className="text-indigo-400" />
            <span className="text-lg font-bold text-white">NexDefend</span>
          </Link>
          <p className="text-sm max-w-xs pr-4">
            Unified AI-powered XDR platform to protect your organization from evolving threats.
          </p>
          <div className="social mt-4">
            <a href="#twitter" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#github" aria-label="GitHub"><Github size={18} /></a>
            <a href="#linkedin" aria-label="LinkedIn"><Linkedin size={18} /></a>
          </div>
        </div>

        {/* Column 2: Links */}
        <div>
          <h4>Platform</h4>
          <ul>
            <li><a href="#platform">Endpoint Security</a></li>
            <li><a href="#platform">Cloud Security</a></li>
            <li><a href="#platform">Threat Intelligence</a></li>
          </ul>
        </div>

        {/* Column 3: Links */}
        <div>
          <h4>Resources</h4>
          <ul>
            <li><a href="#solutions">Solutions</a></li>
            <li><a href="#resources">Resources</a></li>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="#company">About Us</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="nd-container bottom">
        <span>© {new Date().getFullYear()} NexDefend. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
