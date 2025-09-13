import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const NavLinks: React.FC<{ isMobile?: boolean; onLinkClick?: () => void }> = ({ isMobile, onLinkClick }) => {
  const [isDropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (!isMobile) {
      setDropdownOpen(menu);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setDropdownOpen(null);
    }
  };

  const handleDropdownClick = (menu: string) => {
    if (isMobile) {
      setDropdownOpen(isDropdownOpen === menu ? null : menu);
    }
  }

  const token = localStorage.getItem('token');

  if (token) {
    return (
      <div className={styles.navLinks}>
        <Link to="/dashboard" className={styles.link} onClick={onLinkClick}>Dashboard</Link>
        <Link to="/threat-detection" className={styles.link} onClick={onLinkClick}>Threat Detection</Link>
        <Link to="/alerts" className={styles.link} onClick={onLinkClick}>Alerts</Link>
        <Link to="/upload" className={styles.link} onClick={onLinkClick}>Upload</Link>
        <Link to="/incident-report" className={styles.link} onClick={onLinkClick}>Incident Report</Link>
        <Link to="/compliance" className={styles.link} onClick={onLinkClick}>Compliance</Link>
        <Link to="/metrics" className={styles.link} onClick={onLinkClick}>System Metrics</Link>
      </div>
    );
  }

  return (
    <div className={styles.navLinks}>
      <div className={styles.dropdown} onMouseEnter={() => handleMouseEnter('platform')} onMouseLeave={handleMouseLeave} onClick={() => handleDropdownClick('platform')}>
        <button className={styles.link}>Platform</button>
        {isDropdownOpen === 'platform' && (
          <div className={styles.dropdownContent}>
            <Link to="#" onClick={onLinkClick}>Overview</Link>
            <Link to="#" onClick={onLinkClick}>XDR</Link>
            <Link to="#" onClick={onLinkClick}>SIEM</Link>
          </div>
        )}
      </div>
      <Link to="#" className={styles.link} onClick={onLinkClick}>Cloud</Link>
      <Link to="#" className={styles.link} onClick={onLinkClick}>CTI</Link>
      <Link to="#" className={styles.link} onClick={onLinkClick}>Documentation</Link>
      <div className={styles.dropdown} onMouseEnter={() => handleMouseEnter('services')} onMouseLeave={handleMouseLeave} onClick={() => handleDropdownClick('services')}>
        <button className={styles.link}>Services</button>
        {isDropdownOpen === 'services' && (
          <div className={styles.dropdownContent}>
            <Link to="#" onClick={onLinkClick}>Professional support</Link>
            <Link to="#" onClick={onLinkClick}>Consulting services</Link>
            <Link to="#" onClick={onLinkClick}>Training courses</Link>
          </div>
        )}
      </div>
      <div className={styles.dropdown} onMouseEnter={() => handleMouseEnter('partners')} onMouseLeave={handleMouseLeave} onClick={() => handleDropdownClick('partners')}>
        <button className={styles.link}>Partners</button>
        {isDropdownOpen === 'partners' && (
          <div className={styles.dropdownContent}>
            <Link to="#" onClick={onLinkClick}>Become a partner</Link>
            <Link to="#" onClick={onLinkClick}>Find a partner</Link>
          </div>
        )}
      </div>
      <Link to="#" className={styles.link} onClick={onLinkClick}>Blog</Link>
      <Link to="#" className={styles.link} onClick={onLinkClick}>Community</Link>
      <Link to="#" className={styles.link} onClick={onLinkClick}>Contact us</Link>
    </div>
  );
}


const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  }

  return (
    <nav className={styles.navbar} aria-label="Main Navigation">
      <div className={styles.navLeft}>
        <Link to="/" className={styles.logo} onClick={() => setMobileMenuOpen(false)}>NexDefend</Link>
        <div className={styles.desktopNavLinks}>
          <NavLinks />
        </div>
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
      <div className={styles.hamburger} onClick={toggleMobileMenu}>
        <i className={isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
      </div>
      {isMobileMenuOpen && (
        <div className={styles.mobileNavLinks}>
          <NavLinks isMobile onLinkClick={() => setMobileMenuOpen(false)}/>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
