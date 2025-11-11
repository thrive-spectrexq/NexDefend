import React, { useState } from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password });
    // In a real application, you would call an API here
    onClose(); // Close sidebar on submission
    setEmail('');
    setPassword('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register:', { name, email, password });
    // In a real application, you would call an API here
    onClose(); // Close sidebar on submission
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>
      <div className="sidebar-content">
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="register-name">Name</label>
              <input
                type="text"
                id="register-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input
                type="email"
                id="register-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                type="password"
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Register</button>
          </form>
        )}
        <p>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              // Clear form fields when toggling
              setName('');
              setEmail('');
              setPassword('');
            }}
            className="toggle-btn"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
