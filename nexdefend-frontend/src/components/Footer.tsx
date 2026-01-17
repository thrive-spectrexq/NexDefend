import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Bolt, Circle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Bolt className="text-cyan-500 w-6 h-6" fill="currentColor" />
              <span className="text-xl font-bold text-white">NexDefend</span>
            </Link>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Next-generation infrastructure monitoring and threat detection for modern enterprises.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <Circle className="w-2 h-2 text-green-500 fill-current animate-pulse" />
              <span className="text-xs font-medium text-green-400">All Systems Operational</span>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/features" className="text-slate-500 hover:text-cyan-400 transition-colors">Features</Link></li>
              <li><Link to="/integrations" className="text-slate-500 hover:text-cyan-400 transition-colors">Integrations</Link></li>
              <li><Link to="/pricing" className="text-slate-500 hover:text-cyan-400 transition-colors">Pricing</Link></li>
              <li><Link to="/changelog" className="text-slate-500 hover:text-cyan-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/docs" className="text-slate-500 hover:text-cyan-400 transition-colors">Documentation</Link></li>
              <li><Link to="/api" className="text-slate-500 hover:text-cyan-400 transition-colors">API Reference</Link></li>
              <li><Link to="/blog" className="text-slate-500 hover:text-cyan-400 transition-colors">Security Blog</Link></li>
              <li><Link to="/community" className="text-slate-500 hover:text-cyan-400 transition-colors">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-500 hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-slate-500 hover:text-cyan-400 transition-colors">Careers</Link></li>
              <li><Link to="/legal" className="text-slate-500 hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-cyan-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} NexDefend Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github size={20} /></a>
            <a href="#" className="text-slate-500 hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
