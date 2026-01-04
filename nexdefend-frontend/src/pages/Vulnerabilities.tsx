import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Vulnerability } from '../api/apiClient';
import { Loader2, Search, Bug, AlertTriangle } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { cn } from '../lib/utils';

// import './Vulnerabilities.css'; // Removed legacy CSS

const severityClasses: { [key: string]: string } = {
  critical: 'text-brand-red bg-brand-red/10',
  high: 'text-brand-orange bg-brand-orange/10',
  medium: 'text-brand-blue bg-brand-blue/10',
  low: 'text-brand-green bg-brand-green/10',
};

const statusClasses: { [key: string]: string } = {
  detected: 'text-brand-red',
  assessed: 'text-brand-orange',
  resolved: 'text-brand-green',
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
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            <Bug className="text-brand-orange" />
            Vulnerabilities
        </h1>
        
        {/* --- NEW SCAN FORM --- */}
        <form onSubmit={handleScanSubmit} className="flex gap-2">
          <input
            type="text"
            value={targetIp}
            onChange={(e) => setTargetIp(e.target.value)}
            className="bg-surface border border-surface-highlight rounded px-3 py-2 text-text text-sm focus:border-brand-blue outline-none placeholder-text-muted"
            placeholder="Scan Target (e.g. 192.168.1.5)"
            disabled={scanMutation.isPending}
          />
          <button
            type="submit"
            className="bg-brand-blue text-background hover:bg-brand-blue/90 font-semibold py-2 px-4 rounded text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            disabled={scanMutation.isPending}
          >
            {scanMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {scanMutation.isPending ? 'Scanning...' : 'Start Scan'}
          </button>
        </form>
      </div>
      
      {scanError && (
          <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red p-3 rounded mb-4 flex items-center gap-2 text-sm">
              <AlertTriangle size={16} />
              {scanError}
          </div>
      )}
      
      {/* --- END SCAN FORM --- */}


      {isLoading && (
        <div className="flex justify-center items-center p-12 text-text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded text-center">
            Failed to load vulnerabilities. Please try again later.
        </div>
      )}

      {data && (
        <div className="bg-surface border border-surface-highlight rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="text-text-muted font-mono bg-surface-highlight/20 border-b border-surface-highlight">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Host</th>
                <th className="px-6 py-4">Port</th>
                <th className="px-6 py-4">Discovered</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-highlight font-mono">
              {data.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-text-muted">No vulnerabilities found. System is clean.</td></tr>
              ) : (
                data.map((vuln) => (
                    <tr key={vuln.id} className="hover:bg-surface-highlight/10 transition-colors">
                    <td className="px-6 py-4 text-text-muted">#{vuln.id}</td>
                    <td className="px-6 py-4 text-text">{vuln.description}</td>
                    <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded text-xs font-bold uppercase", severityClasses[vuln.severity.toLowerCase()] || '')}>
                            {vuln.severity}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-text">{vuln.host_ip.Valid ? vuln.host_ip.String : 'N/A'}</td>
                    <td className="px-6 py-4 text-text-muted">{vuln.port.Valid ? vuln.port.Int32 : 'N/A'}</td>
                    <td className="px-6 py-4 text-text-muted">{new Date(vuln.discovered_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                        <select
                        value={vuln.status}
                        onChange={(e) => handleStatusChange(vuln.id, e.target.value as Vulnerability['status'])}
                        className={cn("bg-surface border border-surface-highlight rounded p-1 text-xs outline-none focus:border-brand-blue", statusClasses[vuln.status.toLowerCase()] || '')}
                        disabled={updateMutation.isPending}
                        >
                        <option value="Detected">Detected</option>
                        <option value="Assessed">Assessed</option>
                        <option value="Resolved">Resolved</option>
                        </select>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageTransition>
  );
};

export default Vulnerabilities;
