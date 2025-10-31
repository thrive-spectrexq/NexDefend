import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Home, AlertTriangle, Bug, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Shield size={32} className="text-blue-500" />
          <h1 className="text-2xl font-bold">NexDefend</h1>
        </div>
        <nav className="flex items-center space-x-6">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center p-2 rounded-md ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <Home size={20} className="mr-2" />
            Dashboard
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => `flex items-center p-2 rounded-md ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <AlertTriangle size={20} className="mr-2" />
            Alerts
          </NavLink>
          <NavLink to="/vulnerabilities" className={({ isActive }) => `flex items-center p-2 rounded-md ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <Bug size={20} className="mr-2" />
            Vulnerabilities
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `flex items-center p-2 rounded-md ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <SettingsIcon size={20} className="mr-2" />
            Settings
          </NavLink>
        </nav>
        <button onClick={handleLogout} className="flex items-center p-2 rounded-md hover:bg-red-700 bg-red-600 text-white font-semibold">
          <LogOut size={20} className="mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
