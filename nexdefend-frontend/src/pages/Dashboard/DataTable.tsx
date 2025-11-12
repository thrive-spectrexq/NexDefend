import type { Threat } from '../../api/apiClient';
import { Loader2 } from 'lucide-react';

const severityClasses: { [key: string]: string } = {
  critical: 'bg-red-900/50 text-red-300',
  high: 'bg-red-700/50 text-red-400',
  medium: 'bg-yellow-700/50 text-yellow-300',
  low: 'bg-green-700/50 text-green-400',
};

interface DataTableProps {
  threats: Threat[];
  isLoading: boolean;
}

const DataTable = ({ threats, isLoading }: DataTableProps) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold text-white mb-4">Recent Events</h3>
      <div className="overflow-y-auto flex-1 max-h-[30rem]">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
            <tr>
              <th scope="col" className="px-4 py-3">Timestamp</th>
              <th scope="col" className="px-4 py-3">Source IP</th>
              <th scope="col" className="px-4 py-3">Event</th>
              <th scope="col" className="px-4 py-3">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-center p-8">
                  <Loader2 size={32} className="animate-spin inline text-gray-400" />
                </td>
              </tr>
            )}
            {!isLoading && threats.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-500">
                  No recent events found.
                </td>
              </tr>
            )}
            {!isLoading &&
              threats.slice(0, 10).map((event) => ( // Show top 10
                <tr key={event.id} className="hover:bg-gray-700">
                  <td className="px-4 py-3 text-gray-400">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{event.source_ip}</td>
                  <td className="px-4 py-3">{event.description}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityClasses[event.severity.toLowerCase()] || 'bg-gray-600'}`}>
                      {event.severity}
                    </span>
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
