import React from 'react';
import './Header.css';

interface HeaderProps {
  onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  return (
    <header className="header">
      <div className="logo">NexDefend</div>
      <nav>
        <ul>
          <li><a href="#">Products</a></li>
          <li><a href="#">Solutions</a></li>
          <li><a href="#">Resources</a></li>
          <li><a href="#">Company</a></li>
          <li><a href="#">Contact Us</a></li>
        </ul>
      </nav>
      <div className="header-buttons">
        <button className="secondary" onClick={onOpenSidebar}>Login</button>
        <button className="primary" onClick={onOpenSidebar}>Get started free</button>
      </div>
    </header>
  );
};

export default Header;
