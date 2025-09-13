import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4>Explore</h4>
          <ul>
            <li><a href="#">Overview</a></li>
            <li><a href="#">XDR</a></li>
            <li><a href="#">SIEM</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4>Services</h4>
          <ul>
            <li><a href="#">NexDefend Cloud</a></li>
            <li><a href="#">Professional support</a></li>
            <li><a href="#">Consulting services</a></li>
            <li><a href="#">Training courses</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4>Company</h4>
          <ul>
            <li><a href="#">About us</a></li>
            <li><a href="#">Customers</a></li>
            <li><a href="#">Partners</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4>Documentation</h4>
          <ul>
            <li><a href="#">Quickstart</a></li>
            <li><a href="#">Getting started</a></li>
            <li><a href="#">Installation guide</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Community</a></li>
            <li><a href="#">Legal</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4>Subscribe to our newsletter</h4>
          <form className={styles.newsletterForm}>
            <input type="email" placeholder="Email Address" />
            <button type="submit">Subscribe</button>
          </form>
          <p className={styles.privacyText}>
            NexDefend will not sell, trade, lease, or rent your personal data to third parties. By subscribing, I agree to the use of my personal data in accordance with our Privacy Policy.
          </p>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} NexDefend, Inc.</p>
        <div className={styles.socialLinks}>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-linkedin-in"></i></a>
          <a href="#"><i className="fab fa-reddit-alien"></i></a>
          <a href="#"><i className="fab fa-github"></i></a>
          <a href="#"><i className="fab fa-discord"></i></a>
          <a href="#"><i className="fab fa-slack"></i></a>
          <a href="#"><i className="fas fa-envelope"></i></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
