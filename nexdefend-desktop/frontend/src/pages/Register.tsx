import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { authApiClient } from '../api/apiClient';
import './Register.css'; // We will update this file next

const Register = () => {
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Create the user account
      await authApiClient.post('/register', {
        username,
        email,
        password,
      });

      // Step 2: Automatically log the user in
      const loginResponse = await authApiClient.post('/login', {
        username,
        password,
      });

      if (loginResponse.data && loginResponse.data.token) {
        login(loginResponse.data.token);
        navigate('/dashboard'); // Redirect to dashboard on success
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Registration failed. Please try again.');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleRegister}>
        <h1>Create Account</h1>
        <p>Start your unified security journey.</p>

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
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Get Started'}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
