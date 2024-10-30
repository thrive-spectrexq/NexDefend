import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}'); // Fetch user from local storage
  const token = localStorage.getItem('token'); // Check if the token is present

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
      <Link to="/incidentreport" className={styles.link}>Incident Report</Link>
      <span className={styles.userInfo}>{user?.name ? `${user.name} (${user.role})` : "Guest"}</span>
      {token ? (
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      ) : (
        <button onClick={handleLogin} className={styles.loginButton}>Login</button>
      )}
    </nav>
  );
};

export default Navbar;
