// src/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}'); // Fetch user from local storage

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/threat-detection">Threat Detection</Link>
      <Link to="/alerts">Alerts</Link>
      <Link to="/upload">Upload</Link>
      <Link to="/incidentreport">IncidentReport</Link>
      <span>{user?.name} ({user?.role})</span>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
