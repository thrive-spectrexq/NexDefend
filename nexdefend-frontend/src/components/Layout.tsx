import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};

export default Layout;
