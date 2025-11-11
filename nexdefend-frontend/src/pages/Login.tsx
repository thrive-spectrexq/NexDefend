import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { authApiClient } from '../api/apiClient';
import './Login.css';

const Login = () => {
  const { login, isAuthenticated } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await authApiClient.post('/login', {
        username,
        password,
      });
      if (response.data && response.data.token) {
        login(response.data.token);
      }
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>NexDefend</h1>
        <p>Please log in to continue.</p>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;
