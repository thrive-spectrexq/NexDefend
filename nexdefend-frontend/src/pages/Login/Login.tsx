import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you'd have actual authentication logic here
    login();
    navigate('/dashboard');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <Shield size={48} className="mx-auto text-blue-500" />
          <h1 className="text-3xl font-bold mt-4">NexDefend</h1>
          <p className="text-gray-400">Welcome back! Please log in to your account.</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-300" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-300" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-6 text-gray-400">
          Don't have an account? <Link to="/register" className="text-blue-500 hover:underline font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
