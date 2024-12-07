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
      <div role="navigation" aria-label="Main Links" className={styles.navLinks}>
        {token ? (
          <>
            <Link to="/dashboard" className={styles.link}>Dashboard</Link>
            <Link to="/threat-detection" className={styles.link}>Threat Detection</Link>
            <Link to="/alerts" className={styles.link}>Alerts</Link>
            <Link to="/upload" className={styles.link}>Upload</Link>
            <Link to="/incident-report" className={styles.link}>Incident Report</Link>
          </>
        ) : (
          <Link to="/" className={styles.link}>NexDefend</Link>
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
            <button onClick={handleLogin} className={styles.loginButton} aria-label="Login">
              Login
            </button>
            <Link to="/register" className={styles.registerLink} aria-label="Register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
