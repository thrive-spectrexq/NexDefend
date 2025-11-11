import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Vulnerability } from '../api/apiClient'; // <-- FIX
import { Loader2 } from 'lucide-react';
import './Vulnerabilities.css';

const severityClasses: { [key: string]: string } = {
  critical: 'text-red-400 font-bold uppercase',
  high: 'text-red-500 font-semibold',
  medium: 'text-yellow-500 font-semibold',
  low: 'text-green-500 font-semibold',
};

const statusClasses: { [key: string]: string } = {
  detected: 'text-red-400',
  assessed: 'text-yellow-400',
  resolved: 'text-green-500',
};

const Vulnerabilities = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: (): Promise<Vulnerability[]> =>
      apiClient.get('/vulnerabilities').then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Vulnerability['status'] }) =>
      apiClient.put(`/vulnerabilities/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
    },
  });

  const handleStatusChange = (id: number, status: Vulnerability['status']) => {
    mutation.mutate({ id, status });
  };

  return (
    <div className="vulnerabilities-page">
      <h1 className="text-3xl font-bold mb-6">Vulnerabilities</h1>

      {isLoading && (
        <div className="flex justify-center items-center p-12">
          <Loader2 size={40} className="animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-red-500">Failed to load vulnerabilities. Please try again later.</p>
      )}

      {data && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Severity</th>
                <th scope="col" className="px-6 py-3">Host</th>
                <th scope="col" className="px-6 py-3">Port</th>
                <th scope="col" className="px-6 py-3">Discovered</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((vuln) => (
                <tr key={vuln.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                  <td className="px-6 py-4 font-bold">#{vuln.id}</td>
                  <td className="px-6 py-4">{vuln.description}</td>
                  <td className={`px-6 py-4 ${severityClasses[vuln.severity.toLowerCase()] || ''}`}>
                    {vuln.severity}
                  </td>
                  <td className="px-6 py-4">{vuln.host_ip.Valid ? vuln.host_ip.String : 'N/A'}</td>
                  <td className="px-6 py-4">{vuln.port.Valid ? vuln.port.Int32 : 'N/A'}</td>
                  <td className="px-6 py-4">{new Date(vuln.discovered_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={vuln.status}
                      onChange={(e) => handleStatusChange(vuln.id, e.target.value as Vulnerability['status'])}
                      className={`bg-gray-700 border border-gray-600 rounded p-1 text-xs ${statusClasses[vuln.status.toLowerCase()] || ''}`}
                    >
                      <option value="Detected">Detected</option>
                      <option value="Assessed">Assessed</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Vulnerabilities;
