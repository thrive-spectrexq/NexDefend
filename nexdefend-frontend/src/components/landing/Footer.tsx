import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-surface-highlight pt-16 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-brand-blue/20 flex items-center justify-center">
                  <Shield size={18} className="text-brand-blue" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">NexDefend</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              The AI-Powered System Monitoring and Threat Intelligence Platform.
            </p>
            <div className="flex gap-4">
              <a href="#twitter" aria-label="Twitter" className="p-2 rounded-full bg-surface hover:bg-surface-highlight text-text-muted hover:text-brand-blue transition-colors">
                  <Twitter size={18} />
              </a>
              <a href="#github" aria-label="GitHub" className="p-2 rounded-full bg-surface hover:bg-surface-highlight text-text-muted hover:text-brand-blue transition-colors">
                  <Github size={18} />
              </a>
              <a href="#linkedin" aria-label="LinkedIn" className="p-2 rounded-full bg-surface hover:bg-surface-highlight text-text-muted hover:text-brand-blue transition-colors">
                  <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="#platform" className="hover:text-brand-blue transition-colors">Endpoint Security</a></li>
              <li><a href="#platform" className="hover:text-brand-blue transition-colors">Cloud Workload Protection</a></li>
              <li><a href="#platform" className="hover:text-brand-blue transition-colors">Identity Protection</a></li>
              <li><a href="#platform" className="hover:text-brand-blue transition-colors">Threat Intelligence</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="#about" className="hover:text-brand-blue transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-brand-blue transition-colors flex items-center gap-1">Careers <span className="text-xs bg-brand-green/20 text-brand-green px-1.5 py-0.5 rounded">Hiring</span></a></li>
              <li><a href="#partners" className="hover:text-brand-blue transition-colors">Partners</a></li>
              <li><a href="#contact" className="hover:text-brand-blue transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Developers</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="/docs" className="hover:text-brand-blue transition-colors flex items-center gap-1">Documentation <ArrowUpRight size={12} /></a></li>
              <li><a href="#api" className="hover:text-brand-blue transition-colors">API Reference</a></li>
              <li><a href="#status" className="hover:text-brand-blue transition-colors">System Status</a></li>
              <li><a href="#community" className="hover:text-brand-blue transition-colors">Community Forum</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-highlight flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
          <span>© {new Date().getFullYear()} NexDefend Inc. All rights reserved.</span>
          <div className="flex gap-8">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#cookies" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
