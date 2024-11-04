import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
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

  return (
    <nav className={styles.navbar} aria-label="Main Navigation">
      <Link to="/" className={styles.brand}>NexDefend</Link>
      <div role="navigation" aria-label="Main Links" className={styles.navLinks}>
        {token ? (
          <>
            <Link to="/dashboard" className={styles.link}>Dashboard</Link>
            <Link to="/threat-detection" className={styles.link}>Threat Detection</Link>
            <Link to="/alerts" className={styles.link}>Alerts</Link>
            <Link to="/upload" className={styles.link}>Upload</Link>
            <Link to="/incident-report" className={styles.link}>Incident Report</Link>
            <Link to="/ioc-scan" className={styles.link}>IOC Scan</Link>
          </>
        ) : (
          <Link to="/" className={styles.link}>Home</Link>
        )}
      </div>
      <div className={styles.userActions}>
        <span className={styles.userInfo}>
          {user?.name ? `${user.name} (${user.role})` : "Guest"}
        </span>
        {token ? (
          <button onClick={handleLogout} className={styles.logoutButton} aria-label="Logout">
            Logout
          </button>
        ) : (
          <button onClick={handleLogin} className={styles.loginButton} aria-label="Login">
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
