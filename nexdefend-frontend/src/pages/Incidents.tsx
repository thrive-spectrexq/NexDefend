import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Incident } from '../api/apiClient';
import IncidentModal from '../components/dashboard/IncidentModal';
import { Loader2, Siren, AlertCircle } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { cn } from '../lib/utils';

// import './Incidents.css'; // Removed legacy CSS

const severityClasses: { [key: string]: string } = {
  critical: 'text-brand-red bg-brand-red/10 border-brand-red/20',
  high: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
  medium: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20',
  low: 'text-brand-green bg-brand-green/10 border-brand-green/20',
};

const statusClasses: { [key: string]: string } = {
  open: 'text-brand-red',
  'in progress': 'text-brand-orange',
  escalated: 'text-brand-orange font-bold',
  resolved: 'text-brand-green',
};

const Incidents = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['incidents'],
    queryFn: (): Promise<Incident[]> =>
      apiClient.get('/incidents').then((res) => res.data),
  });

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            <Siren className="text-brand-red" />
            Security Incidents
        </h1>
        <button className="px-4 py-2 bg-brand-red text-background rounded hover:bg-brand-red/90 text-sm font-semibold shadow-[0_0_10px_rgba(248,113,113,0.3)]">
            Create Incident
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-12 text-text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded text-center flex items-center justify-center gap-2">
            <AlertCircle size={20} />
            Failed to load incidents. Please try again later.
        </div>
      )}

      {data && (
        <div className="bg-surface border border-surface-highlight rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="text-text-muted font-mono bg-surface-highlight/20 border-b border-surface-highlight">
              <tr>
                <th scope="col" className="px-6 py-4">ID</th>
                <th scope="col" className="px-6 py-4">Description</th>
                <th scope="col" className="px-6 py-4">Severity</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Created</th>
                <th scope="col" className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-highlight font-mono">
              {data.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-text-muted">No active incidents.</td></tr>
              ) : (
                data.map((incident) => (
                    <tr key={incident.id} className="hover:bg-surface-highlight/10 transition-colors">
                    <td className="px-6 py-4 text-text-muted">#{incident.id}</td>
                    <td className="px-6 py-4 text-text">{incident.description}</td>
                    <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded text-xs font-bold uppercase border", severityClasses[incident.severity.toLowerCase()] || '')}>
                            {incident.severity}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={cn("uppercase font-semibold text-xs", statusClasses[incident.status.toLowerCase()] || '')}>
                            {incident.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{new Date(incident.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                        <button
                        onClick={() => setSelectedIncident(incident)}
                        className="text-brand-blue hover:text-brand-blue/80 font-semibold hover:underline"
                        >
                        Manage
                        </button>
                    </td>
                    </tr>
                ))
              )}
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
    </PageTransition>
  );
};

export default Incidents;
