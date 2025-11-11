import React, { useState } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import './Header.css';

type HeaderProps = {
  onOpenSidebar?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const [open, setOpen] = useState(false);
  const isControlled = typeof onOpenSidebar === 'function';

  const handleMobileToggle = () => {
    if (isControlled) {
      onOpenSidebar && onOpenSidebar();
    } else {
      setOpen((s) => !s);
    }
  };

  return (
    <header className="w-full nd-header">
      <div className="nd-container">
        <div className="flex items-center space-x-4">
          <a href="/" className="nd-brand">
            <div className="logo" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M12 3v18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="title">NexDefend</div>
              <div className="subtitle">Real-Time Monitoring</div>
            </div>
          </a>
        </div>

        <nav className="nd-nav">
          <a href="#features" className="text-sm hover:text-white/90 transition">Features</a>
          <a href="#pricing" className="text-sm hover:text-white/90 transition">Pricing</a>
          <a href="#faq" className="text-sm hover:text-white/90 transition">FAQ</a>
          <a href="/docs" className="text-sm hover:text-white/90 transition">Docs</a>
        </nav>

        <div className="nd-ctas">
          <a
            href="/auth/signin"
            className="nd-signin"
          >
            <LogIn size={16} />
            Sign in
          </a>
          <a
            href="/signup"
            className="nd-getstarted"
          >
            Get Started
          </a>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={handleMobileToggle}
          className="nd-mobile-toggle"
        >
          {/* If using controlled behavior, keep icon consistent for mobile */}
          {isControlled ? <Menu size={20} /> : (open ? <X size={20} /> : <Menu size={20} />)}
        </button>
      </div>

      {/* Only show the internal mobile panel when Header is uncontrolled */}
      {!isControlled && open && (
        <div className="nd-mobile-panel">
          <div className="nd-mobile-inner">
            <a href="#features" className="block text-sm py-2 px-2 rounded hover:bg-slate-700">Features</a>
            <a href="#pricing" className="block text-sm py-2 px-2 rounded hover:bg-slate-700">Pricing</a>
            <a href="#faq" className="block text-sm py-2 px-2 rounded hover:bg-slate-700">FAQ</a>
            <a href="/docs" className="block text-sm py-2 px-2 rounded hover:bg-slate-700">Docs</a>
            <div className="pt-2 border-t border-slate-700">
              <a href="/auth/signin" className="block py-2 px-2 rounded hover:bg-slate-700 flex items-center gap-2">
                <LogIn size={16} /> Sign in
              </a>
              <a href="/signup" className="mt-2 block text-center nd-getstarted">
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
