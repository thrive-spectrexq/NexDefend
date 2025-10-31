import React from 'react';
import { Search, ListFilter } from 'lucide-react';

const Vulnerabilities: React.FC = () => {
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Vulnerabilities</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search vulnerabilities..."
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <ListFilter size={20} className="mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Vulnerabilities Table */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-3 px-6 text-left font-semibold">Severity</th>
              <th className="py-3 px-6 text-left font-semibold">Vulnerability</th>
              <th className="py-3 px-6 text-left font-semibold">Asset</th>
              <th className="py-3 px-6 text-left font-semibold">First Seen</th>
              <th className="py-3 px-6 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            <VulnerabilityRow severity="Critical" vulnerability="Log4Shell (CVE-2021-44228)" asset="web-server-01" firstSeen="2024-10-28" status="Open" />
            <VulnerabilityRow severity="High" vulnerability="ProxyLogon (CVE-2021-26855)" asset="exchange-server" firstSeen="2024-10-25" status="Patched" />
            <VulnerabilityRow severity="Medium" vulnerability="Outdated Apache Struts" asset="app-server-03" firstSeen="2024-10-20" status="Open" />
            <VulnerabilityRow severity="Low" vulnerability="Weak SSL/TLS Cipher Suites" asset="load-balancer" firstSeen="2024-10-15" status="Acknowledged" />
            <VulnerabilityRow severity="High" vulnerability="SMBv1 Enabled" asset="file-server-02" firstSeen="2024-10-12" status="Open" />
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface VulnerabilityRowProps {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  vulnerability: string;
  asset: string;
  firstSeen: string;
  status: 'Open' | 'Patched' | 'Acknowledged';
}

const VulnerabilityRow: React.FC<VulnerabilityRowProps> = ({ severity, vulnerability, asset, firstSeen, status }) => {
  const severityClasses = {
    Critical: 'bg-purple-900/20 text-purple-400 border-purple-500/30',
    High: 'bg-red-900/20 text-red-400 border-red-500/30',
    Medium: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-blue-900/20 text-blue-400 border-blue-500/30',
  };

  const severityPillClasses = {
    Critical: 'bg-purple-500',
    High: 'bg-red-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-blue-500',
  };

  const statusClasses = {
    Open: 'text-red-400',
    Patched: 'text-green-400',
    Acknowledged: 'text-gray-400',
  };

  return (
    <tr className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200 ${severityClasses[severity]}`}>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${severityPillClasses[severity]}`}>
          {severity}
        </span>
      </td>
      <td className="py-4 px-6">{vulnerability}</td>
      <td className="py-4 px-6 font-mono text-gray-300">{asset}</td>
      <td className="py-4 px-6 text-gray-400">{firstSeen}</td>
      <td className={`py-4 px-6 font-semibold ${statusClasses[status]}`}>{status}</td>
    </tr>
  );
};

export default Vulnerabilities;
