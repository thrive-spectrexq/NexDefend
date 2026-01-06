import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { authApiClient } from '../api/apiClient';
import { Shield, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

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
      // In embedded mode, this might fail if the API is not running.
      // We will wrap this in try/catch and fallback for demo purposes if needed.

      try {
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
            navigate('/dashboard');
          }
      } catch (apiErr) {
          // If in Wails mode, simulate success
          if (window.runtime) {
              console.warn("API Register failed (expected in embedded mode). proceeding with demo login.");
              login("demo-token-embedded-mode");
              navigate('/dashboard');
              return;
          }
          throw apiErr;
      }

    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Registration failed. Please try again.');
      } else {
        setError('An unknown error occurred. Is the backend server running?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield size={40} className="text-white" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Join the Unified Security Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-md py-8 px-4 shadow-2xl border border-slate-800 rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 transition-colors"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 transition-colors"
                  placeholder="Choose a strong password"
                />
              </div>
            </div>

            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 bg-slate-900 rounded" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-slate-400">I agree to the <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a> and <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a></label>
                </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Creating Account...' : (
                    <span className="flex items-center gap-2">
                        Get Started <ArrowRight size={16} />
                    </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
               <Link to="/login" className="w-full flex justify-center py-2.5 px-4 border border-slate-700 rounded-lg shadow-sm text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">
                 Log In
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
