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

  // New navigation links
  const navLinks = [
    { href: '#platform', text: 'Platform' },
    { href: '#solutions', text: 'Solutions' },
    { href: '#resources', text: 'Resources' },
    { href: '/docs', text: 'Documentation' },
  ];

  return (
    <header className="w-full nd-header">
      <div className="nd-container">
        <div className="flex items-center space-x-4">
          <Link to="/" className="nd-brand">
            <div className="title">NexDefend</div>
          </Link>
        </div>

        <nav className="nd-nav">
          {/* Updated Desktop Nav */}
          {navLinks.map((link) => (
            <a 
              key={link.text} 
              href={link.href} 
              className="text-sm hover:text-white/90 transition"
            >
              {link.text}
            </a>
          ))}
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
          {isControlled ? <Menu size={20} /> : (open ? <X size={20} /> : <Menu size={20} />)}
        </button>
      </div>

      {/* Updated Mobile Panel */}
      {!isControlled && open && (
        <div className="nd-mobile-panel">
          <div className="nd-mobile-inner">
            {navLinks.map((link) => (
              <a 
                key={link.text} 
                href={link.href} 
                className="block text-sm py-2 px-2 rounded hover:bg-slate-700"
              >
                {link.text}
              </a>
            ))}
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
