// src/components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} NexDefend. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
