import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Check if the token is present

  // Check if `user` exists in `localStorage` and parse only if it does
  let user = null;
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      // Optionally clear the invalid data
      localStorage.removeItem('user');
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
    <nav className={styles.navbar}>
      <Link to="/dashboard" className={styles.link}>Dashboard</Link>
      <Link to="/threat-detection" className={styles.link}>Threat Detection</Link>
      <Link to="/alerts" className={styles.link}>Alerts</Link>
      <Link to="/upload" className={styles.link}>Upload</Link>
      <Link to="/incident-report" className={styles.link}>Incident Report</Link>
      <span className={styles.userInfo}>
        {user?.name ? `${user.name} (${user.role})` : "Guest"}
      </span>
      {token ? (
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      ) : (
        <button onClick={handleLogin} className={styles.loginButton}>Login</button>
      )}
    </nav>
  );
};

export default Navbar;