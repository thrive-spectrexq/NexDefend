import React from 'react';
import { Shield, AlertTriangle, Bug, Target, FileDown } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
          <FileDown size={20} className="mr-2" />
          Create Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Shield size={32} />} title="Total Alerts" value="1,234" />
        <StatCard icon={<AlertTriangle size={32} />} title="Critical Alerts" value="56" />
        <StatCard icon={<Bug size={32} />} title="Vulnerabilities" value="78" />
        <StatCard icon={<Target size={32} />} title="High-Risk Assets" value="12" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Threats Over Time</h2>
          <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
            <p>Chart will be displayed here</p>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Recent Alerts</h2>
          <ul>
            <AlertItem severity="High" description="SQL Injection attempt on web-server-01" time="2m ago" />
            <AlertItem severity="Medium" description="Unusual login activity from 192.168.1.100" time="15m ago" />
            <AlertItem severity="Low" description="Port scan detected on firewall" time="1h ago" />
            <AlertItem severity="High" description="Malware detected on db-server-03" time="3h ago" />
          </ul>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg flex items-center">
      <div className="mr-4 text-blue-500">{icon}</div>
      <div>
        <p className="text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

interface AlertItemProps {
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  time: string;
}

const AlertItem: React.FC<AlertItemProps> = ({ severity, description, time }) => {
  const severityColor = {
    High: 'text-red-500',
    Medium: 'text-yellow-500',
    Low: 'text-green-500',
  };

  return (
    <li className="flex justify-between items-center border-b border-gray-700 py-3">
      <div>
        <p className={`font-bold ${severityColor[severity]}`}>{severity}</p>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
      <p className="text-sm text-gray-500">{time}</p>
    </li>
  );
};

export default Dashboard;
