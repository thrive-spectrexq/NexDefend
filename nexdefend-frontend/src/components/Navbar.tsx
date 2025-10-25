import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    <nav aria-label="Main Navigation">
      <div>
        <Link to="/">NexDefend</Link>
      </div>
      <div>
        {user?.name && (
          <span>
            {user.name} ({user.role})
          </span>
        )}
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} aria-label="Logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleRegister}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
