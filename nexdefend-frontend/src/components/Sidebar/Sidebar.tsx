import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, AlertTriangle, Bug, Settings as SettingsIcon } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <div className="flex items-center mb-8">
        <Shield size={32} className="mr-2" />
        <h1 className="text-2xl font-bold">NexDefend</h1>
      </div>
      <nav>
        <ul>
          <li className="mb-4">
            <Link to="/dashboard" className="flex items-center p-2 text-lg hover:bg-gray-700 rounded">
              <Home size={24} className="mr-3" />
              Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/alerts" className="flex items-center p-2 text-lg hover:bg-gray-700 rounded">
              <AlertTriangle size={24} className="mr-3" />
              Alerts
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/vulnerabilities" className="flex items-center p-2 text-lg hover:bg-gray-700 rounded">
              <Bug size={24} className="mr-3" />
              Vulnerabilities
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/settings" className="flex items-center p-2 text-lg hover:bg-gray-700 rounded">
              <SettingsIcon size={24} className="mr-3" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
