import type { Threat } from '../../api/apiClient'; // <-- FIX
import { Loader2 } from 'lucide-react';

const severityClasses: { [key: string]: string } = {
  critical: 'text-red-400 font-bold uppercase',
  high: 'text-red-500 font-semibold',
  medium: 'text-yellow-500 font-semibold',
  low: 'text-green-500 font-semibold',
};

interface DataTableProps {
  threats: Threat[];
  isLoading: boolean;
}

const DataTable = ({ threats, isLoading }: DataTableProps) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-full">
      <h3 className="text-xl font-bold text-white mb-4">Recent Events</h3>
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Timestamp</th>
              <th scope="col" className="px-6 py-3">Source IP</th>
              <th scope="col" className="px-6 py-3">Event Type</th>
              <th scope="col" className="px-6 py-3">Severity</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-center p-8">
                  <Loader2 size={32} className="animate-spin inline" />
                </td>
              </tr>
            )}
            {!isLoading && threats.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-8">
                  No recent events found.
                </td>
              </tr>
            )}
            {!isLoading &&
              threats.map((event) => (
                <tr key={event.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                  <td className="px-6 py-4">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4">{event.source_ip}</td>
                  <td className="px-6 py-4">{event.event_type}</td>
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
