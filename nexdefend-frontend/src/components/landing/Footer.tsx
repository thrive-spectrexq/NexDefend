import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg">NexDefend</h3>
            <p className="mt-2 text-sm text-slate-400">Real-time system monitoring and threat detection for modern infrastructure.</p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://github.com/thrive-spectrexq/NexDefend" aria-label="GitHub" className="text-slate-400 hover:text-white">
                <Github />
              </a>
              <a href="https://twitter.com/" aria-label="Twitter" className="text-slate-400 hover:text-white">
                <Twitter />
              </a>
              <a href="mailto:hello@nexdefend.example" aria-label="Email" className="text-slate-400 hover:text-white">
                <Mail />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium">Product</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/features" className="hover:text-white transition">Features</a></li>
              <li><a href="/pricing" className="hover:text-white transition">Pricing</a></li>
              <li><a href="/docs" className="hover:text-white transition">Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium">Support</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/faq" className="hover:text-white transition">FAQ</a></li>
              <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
              <li><a href="/status" className="hover:text-white transition">System Status</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <div>© {new Date().getFullYear()} NexDefend. All rights reserved.</div>
          <div className="mt-3 md:mt-0">Built with care • Privacy-first</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
