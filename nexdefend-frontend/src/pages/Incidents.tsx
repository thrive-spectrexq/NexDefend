import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Incident } from '../api/apiClient';
import IncidentModal from '../components/dashboard/IncidentModal';
import { Loader2 } from 'lucide-react';
import './Incidents.css';

const severityClasses: { [key: string]: string } = {
  critical: 'text-red-400 font-bold uppercase',
  high: 'text-red-500 font-semibold',
  medium: 'text-yellow-500 font-semibold',
  low: 'text-green-500 font-semibold',
};

const statusClasses: { [key: string]: string } = {
  open: 'text-red-400',
  'in progress': 'text-yellow-400',
  escalated: 'text-orange-400 font-bold',
  resolved: 'text-green-500',
};

const Incidents = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['incidents'],
    queryFn: (): Promise<Incident[]> =>
      apiClient.get('/incidents').then((res) => res.data),
  });

  return (
    <div className="incidents-page">
      <h1 className="text-3xl font-bold mb-6">Security Incidents</h1>

      {isLoading && (
        <div className="flex justify-center items-center p-12">
          <Loader2 size={40} className="animate-spin">
            <title>Loading...</title>
          </Loader2>
        </div>
      )}

      {error && (
        <p className="text-red-500">Failed to load incidents. Please try again later.</p>
      )}

      {data && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                {/* --- THIS LINE IS FIXED --- */}
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Severity</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Created</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((incident) => (
                <tr key={incident.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                  <td className="px-6 py-4 font-bold">#{incident.id}</td>
                  <td className="px-6 py-4">{incident.description}</td>
                  <td className={`px-6 py-4 ${severityClasses[incident.severity.toLowerCase()] || ''}`}>
                    {incident.severity}
                  </td>
                  <td className={`px-6 py-4 uppercase font-semibold ${statusClasses[incident.status.toLowerCase()] || ''}`}>
                    {incident.status}
                  </td>
                  <td className="px-6 py-4">{new Date(incident.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedIncident(incident)}
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedIncident && (
        <IncidentModal 
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
};

export default Incidents;
