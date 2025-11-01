import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-top">
        <a href="#">Blog</a>
        <a href="#">Community</a>
        <a href="#">Contact us</a>
        <div className="social-links">
          {/* Add social links here */}
        </div>
        <input type="search" placeholder="Search" />
      </div>
      <div className="header-main">
        <Link to="/" className="header-logo">NexDefend</Link>
        <nav className="header-nav">
          <a href="#">Platform</a>
          <a href="#">Cloud</a>
          <a href="#">CTI</a>
          <a href="#">Documentation</a>
          <a href="#">Services</a>
          <a href="#">Partners</a>
          <a href="#">Company</a>
        </nav>
        <div className="header-actions">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
