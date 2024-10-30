import React, { useEffect, useState } from "react";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    // Check if the user has scrolled to the bottom
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <footer className={`${styles.footer} ${isVisible ? styles.visible : ""}`}>
      <p>&copy; {new Date().getFullYear()} NexDefend. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
