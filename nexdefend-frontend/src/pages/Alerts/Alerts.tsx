import React from 'react';
import { Search, ListFilter } from 'lucide-react';

const Alerts: React.FC = () => {
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search alerts..."
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
            <ListFilter size={20} className="mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-3 px-6 text-left">Severity</th>
              <th className="py-3 px-6 text-left">Description</th>
              <th className="py-3 px-6 text-left">Source IP</th>
              <th className="py-3 px-6 text-left">Destination IP</th>
              <th className="py-3 px-6 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <AlertRow severity="High" description="SQL Injection attempt" srcIp="192.168.1.101" destIp="10.0.0.5" timestamp="2024-10-30 14:30:15" />
            <AlertRow severity="Medium" description="Unusual login activity" srcIp="203.0.113.25" destIp="10.0.0.8" timestamp="2024-10-30 14:25:40" />
            <AlertRow severity="Low" description="Port scan detected" srcIp="198.51.100.12" destIp="10.0.0.0/24" timestamp="2024-10-30 14:10:02" />
            <AlertRow severity="High" description="Malware C2 communication" srcIp="10.0.0.15" destIp="172.16.31.4" timestamp="2024-10-30 13:55:18" />
             <AlertRow severity="Medium" description="Anomalous network traffic" srcIp="10.0.0.22" destIp="8.8.8.8" timestamp="2024-10-30 13:40:55" />
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface AlertRowProps {
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  srcIp: string;
  destIp: string;
  timestamp: string;
}

const AlertRow: React.FC<AlertRowProps> = ({ severity, description, srcIp, destIp, timestamp }) => {
    const severityClasses = {
        High: 'bg-red-900/20 text-red-400 border-red-500/30',
        Medium: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30',
        Low: 'bg-green-900/20 text-green-400 border-green-500/30',
    };

  const severityPillClasses = {
        High: 'bg-red-500',
        Medium: 'bg-yellow-500',
        Low: 'bg-green-500',
    };


  return (
    <tr className={`border-b border-gray-700 ${severityClasses[severity]}`}>
      <td className="py-4 px-6">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${severityPillClasses[severity]}`}>
          {severity}
        </span>
      </td>
      <td className="py-4 px-6">{description}</td>
      <td className="py-4 px-6 font-mono">{srcIp}</td>
      <td className="py-4 px-6 font-mono">{destIp}</td>
      <td className="py-4 px-6 text-gray-400">{timestamp}</td>
    </tr>
  );
};

export default Alerts;
