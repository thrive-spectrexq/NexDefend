import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg">NexDefend</h3>
            <p className="mt-2 text-sm text-slate-400">Real-time system monitoring and threat detection for modern infrastructure.</p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <div className="mt-3 md:mt-0">Built with care • Privacy-first</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
