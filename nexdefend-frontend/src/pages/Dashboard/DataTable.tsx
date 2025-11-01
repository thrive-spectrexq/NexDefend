const mockEvents = [
  {
    timestamp: '2025-11-01 14:15:12',
    sourceIp: '198.51.100.24',
    eventType: 'Potential SQL Injection',
    severity: 'High',
  },
  {
    timestamp: '2025-11-01 14:14:55',
    sourceIp: '203.0.113.88',
    eventType: 'Anomalous Process Detected',
    severity: 'Critical',
  },
  {
    timestamp: '2025-11-01 14:12:30',
    sourceIp: '192.168.1.105',
    eventType: 'User Login from new IP',
    severity: 'Low',
  },
  {
    timestamp: '2025-11-01 14:10:02',
    sourceIp: '10.0.0.52',
    eventType: 'Firewall Rule Modified',
    severity: 'Medium',
  },
  {
    timestamp: '2025-11-01 14:08:45',
    sourceIp: '192.168.1.101',
    eventType: 'Multiple Login Failures',
    severity: 'High',
  },
  {
    timestamp: '2025-11-01 14:05:19',
    sourceIp: '172.16.31.10',
    eventType: 'Malware Signature Detected',
    severity: 'Critical',
  },
  {
    timestamp: '2025-11-01 14:02:44',
    sourceIp: '203.0.113.12',
    eventType: 'Network Scan Detected',
    severity: 'Medium',
  },
];

const severityClasses: { [key: string]: string } = {
  critical: 'text-red-400 font-bold uppercase',
  high: 'text-red-500 font-semibold',
  medium: 'text-yellow-500 font-semibold',
  low: 'text-green-500 font-semibold',
};

const DataTable = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Recent Events</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">Timestamp</th>
              <th scope="col" className="px-6 py-3">Source IP</th>
              <th scope="col" className="px-6 py-3">Event Type</th>
              <th scope="col" className="px-6 py-3">Severity</th>
            </tr>
          </thead>
          <tbody>
            {mockEvents.map((event, index) => (
              <tr key={index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                <td className="px-6 py-4">{event.timestamp}</td>
                <td className="px-6 py-4">{event.sourceIp}</td>
                <td className="px-6 py-4">{event.eventType}</td>
                <td className={`px-6 py-4 ${severityClasses[event.severity.toLowerCase()] || ''}`}>
                  {event.severity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
