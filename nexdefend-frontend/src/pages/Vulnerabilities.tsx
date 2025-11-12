import { useState } from 'react'; // Import useState
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Vulnerability } from '../api/apiClient';
import { Loader2, Search } from 'lucide-react'; // Import Search icon
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
  const [targetIp, setTargetIp] = useState(''); // State for the scan input
  const [scanError, setScanError] = useState<string | null>(null);

  // Query for listing vulnerabilities
  const { data, isLoading, error } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: (): Promise<Vulnerability[]> =>
      apiClient.get('/vulnerabilities').then((res) => res.data),
  });

  // Mutation for updating a vulnerability status
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Vulnerability['status'] }) =>
      apiClient.put(`/vulnerabilities/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
    },
  });

  // --- NEW SCAN MUTATION ---
  const scanMutation = useMutation({
    mutationFn: (target: string) => apiClient.post('/scan', { target }),
    onSuccess: () => {
      // Scan is complete, refresh the list of vulnerabilities
      setScanError(null);
      setTargetIp('');
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
    },
    onError: (err: any) => {
      setScanError(err.response?.data?.error || "An unknown error occurred during the scan.");
    },
  });

  const handleStatusChange = (id: number, status: Vulnerability['status']) => {
    updateMutation.mutate({ id, status });
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIp) return;
    setScanError(null);
    scanMutation.mutate(targetIp);
  };

  return (
    <div className="vulnerabilities-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vulnerabilities</h1>
        
        {/* --- NEW SCAN FORM --- */}
        <form onSubmit={handleScanSubmit} className="flex gap-2">
          <input
            type="text"
            value={targetIp}
            onChange={(e) => setTargetIp(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded p-2 text-white"
            placeholder="Enter IP to scan (e.g., 127.0.0.1)"
            disabled={scanMutation.isPending}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            disabled={scanMutation.isPending}
          >
            {scanMutation.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
            {scanMutation.isPending ? 'Scanning...' : 'Start Scan'}
          </button>
        </form>
      </div>
      
      {scanError && <p className="text-red-500 mb-4">{scanError}</p>}
      
      {/* --- END SCAN FORM --- */}


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
                <tr key={vuln.ID} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                  <td className="px-6 py-4 font-bold">#{vuln.ID}</td>
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
                      onChange={(e) => handleStatusChange(vuln.ID, e.target.value as Vulnerability['status'])}
                      className={`bg-gray-700 border border-gray-600 rounded p-1 text-xs ${statusClasses[vuln.status.toLowerCase()] || ''}`}
                      disabled={updateMutation.isPending}
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
