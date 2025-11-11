import React, { useState } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
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
          <Link to="/" className="nd-brand">
            <div className="title">NexDefend</div>
          </Link>
        </div>

        <nav className="nd-nav">
          <a href="#features" className="text-sm hover:text-white/90 transition">Features</a>
          <a href="#pricing" className="text-sm hover:text-white/90 transition">Pricing</a>
          <a href="/docs" className="text-sm hover:text-white/90 transition">Docs</a>
        </nav>

        <div className="nd-ctas">
          <Link
            to="/login"
            className="nd-signin"
          >
            <LogIn size={16} />
            Sign in
          </Link>
          <Link
            to="/register"
            className="nd-getstarted"
          >
            Get Started
          </Link>
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
            <a href="/docs" className="block text-sm py-2 px-2 rounded hover:bg-slate-700">Docs</a>
            <div className="pt-2 border-t border-slate-700">
              <Link to="/login" className="block py-2 px-2 rounded hover:bg-slate-700 flex items-center gap-2">
                <LogIn size={16} /> Sign in
              </Link>
              <Link to="/register" className="mt-2 block text-center nd-getstarted">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
