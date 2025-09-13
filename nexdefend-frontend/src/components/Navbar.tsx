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

  const handleRegister = () => {
    navigate('/register');
  }

  return (
    <nav className={styles.navbar} aria-label="Main Navigation">
      <div className={styles.navLeft}>
        <Link to="/" className={styles.logo}>NexDefend</Link>
      </div>
      <div className={styles.userActions}>
        {user?.name && (
          <span className={styles.userInfo}>
            {user.name} ({user.role})
          </span>
        )}
        {token ? (
          <>
            <Link to="/dashboard" className={`${styles.btn} ${styles.btnSecondary}`}>Dashboard</Link>
            <button onClick={handleLogout} className={styles.logoutButton} aria-label="Logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={handleLogin} className={`${styles.btn} ${styles.btnSecondary}`}>Login</button>
            <button onClick={handleRegister} className={`${styles.btn} ${styles.btnPrimary}`}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
