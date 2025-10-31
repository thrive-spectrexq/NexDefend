import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, FileText, Settings, BarChart } from 'lucide-react';

const SideNav = () => {
  return (
    <nav className="bg-gray-900 text-white w-64 p-4 flex flex-col border-r border-gray-700">
      <div className="mb-8">
        <Link to="/" className="flex items-center space-x-2">
          <Shield size={24} />
          <span className="text-2xl font-bold">NexDefend</span>
        </Link>
      </div>
      <ul className="space-y-2">
        <li>
          <Link to="/" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
            <BarChart size={20} />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/alerts" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
            <AlertTriangle size={20} />
            <span>Alerts</span>
          </Link>
        </li>
        <li>
          <Link to="/incidents" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
            <FileText size={20} />
            <span>Incidents</span>
          </Link>
        </li>
        <li>
          <Link to="/reports" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
            <FileText size={20} />
            <span>Reports</span>
          </Link>
        </li>
        <li>
          <Link to="/vulnerabilities" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
            <Shield size={20} />
            <span>Vulnerabilities</span>
          </Link>
        </li>
      </ul>
      <div className="mt-auto">
        <Link to="/settings" className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );
};

export default SideNav;
