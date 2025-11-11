import React, { useState } from 'react';
import { Menu, X, LogIn } from 'lucide-react';

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-md shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 12h18M12 3v18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">NexDefend</span>
              <div className="text-xs text-indigo-200 -mt-1">Real-Time Monitoring</div>
            </div>
          </a>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-sm hover:text-white/90 transition">Features</a>
          <a href="#pricing" className="text-sm hover:text-white/90 transition">Pricing</a>
          <a href="#faq" className="text-sm hover:text-white/90 transition">FAQ</a>
          <a href="/docs" className="text-sm hover:text-white/90 transition">Docs</a>
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          <a
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-sm text-white py-2 px-4 rounded-md transition"
          >
            <LogIn size={16} />
            Sign in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center bg-indigo-500 hover:bg-indigo-600 text-sm text-white font-semibold py-2 px-4 rounded-md shadow"
          >
            Get Started
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 transition"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-800/80 border-t border-slate-700">
          <div className="px-4 py-3 space-y-2">
            <a href="#features" className="block text-sm py-2 px-2 rounded hover:bg-slate-700">Features</a>
            <a href="#pricing" className="block text-sm py-2 px-2 rounded hover:bg-slate-700">Pricing</a>
            <a href="#faq" className="block text-sm py-2 px-2 rounded hover:bg-slate-700">FAQ</a>
            <a href="/docs" className="block text-sm py-2 px-2 rounded hover:bg-slate-700">Docs</a>
            <div className="pt-2 border-t border-slate-700">
              <a href="/auth/signin" className="block py-2 px-2 rounded hover:bg-slate-700 flex items-center gap-2">
                <LogIn size={16} /> Sign in
              </a>
              <a href="/signup" className="mt-2 block text-center bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 rounded-md">
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
