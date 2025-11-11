import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="mt-8 border-t border-slate-800 pt-6 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <div>© {new Date().getFullYear()} NexDefend. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
