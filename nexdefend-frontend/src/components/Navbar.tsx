import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isDropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Parse user data if it exists and handle parsing errors
  let user = null;
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem('user'); // Optional: Clear invalid data from storage
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleMouseEnter = (menu: string) => {
    setDropdownOpen(menu);
  };

  const handleMouseLeave = () => {
    setDropdownOpen(null);
  };

  return (
    <nav className={styles.navbar} aria-label="Main Navigation">
      <div className={styles.navLeft}>
        <Link to="/" className={styles.logo}>NexDefend</Link>
        {token ? (
          <div role="navigation" aria-label="Main Links" className={styles.navLinks}>
            <Link to="/dashboard" className={styles.link}>Dashboard</Link>
            <Link to="/threat-detection" className={styles.link}>Threat Detection</Link>
            <Link to="/alerts" className={styles.link}>Alerts</Link>
            <Link to="/upload" className={styles.link}>Upload</Link>
            <Link to="/incident-report" className={styles.link}>Incident Report</Link>
            <Link to="/compliance" className={styles.link}>Compliance</Link>
            <Link to="/metrics" className={styles.link}>System Metrics</Link>
          </div>
        ) : (
          <div role="navigation" aria-label="Main Links" className={styles.navLinks}>
            <div className={styles.dropdown} onMouseEnter={() => handleMouseEnter('platform')} onMouseLeave={handleMouseLeave}>
              <button className={styles.link}>Platform</button>
              {isDropdownOpen === 'platform' && (
                <div className={styles.dropdownContent}>
                  <Link to="#">Overview</Link>
                  <Link to="#">XDR</Link>
                  <Link to="#">SIEM</Link>
                </div>
              )}
            </div>
            <Link to="#" className={styles.link}>Cloud</Link>
            <Link to="#" className={styles.link}>CTI</Link>
            <Link to="#" className={styles.link}>Documentation</Link>
            <div className={styles.dropdown} onMouseEnter={() => handleMouseEnter('services')} onMouseLeave={handleMouseLeave}>
              <button className={styles.link}>Services</button>
              {isDropdownOpen === 'services' && (
                <div className={styles.dropdownContent}>
                  <Link to="#">Professional support</Link>
                  <Link to="#">Consulting services</Link>
                  <Link to="#">Training courses</Link>
                </div>
              )}
            </div>
            <div className={styles.dropdown} onMouseEnter={() => handleMouseEnter('partners')} onMouseLeave={handleMouseLeave}>
              <button className={styles.link}>Partners</button>
              {isDropdownOpen === 'partners' && (
                <div className={styles.dropdownContent}>
                  <Link to="#">Become a partner</Link>
                  <Link to="#">Find a partner</Link>
                </div>
              )}
            </div>
            <Link to="#" className={styles.link}>Blog</Link>
            <Link to="#" className={styles.link}>Community</Link>
            <Link to="#" className={styles.link}>Contact us</Link>
          </div>
        )}
      </div>
      <div className={styles.userActions}>
        {user?.name && (
          <span className={styles.userInfo}>
            {user.name} ({user.role})
          </span>
        )}
        {token ? (
          <button onClick={handleLogout} className={styles.logoutButton} aria-label="Logout">
            Logout
          </button>
        ) : (
          <>
            <button onClick={() => navigate('/register')} className={`${styles.btn} ${styles.btnPrimary}`}>Install NexDefend</button>
            <button onClick={handleLogin} className={`${styles.btn} ${styles.btnSecondary}`}>Log in</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
