import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} NexDefend, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
