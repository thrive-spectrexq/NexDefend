import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Anomaly } from '../api/apiClient';
import { Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';

// import './Alerts.css'; // Removed legacy CSS

const AlertTriage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['anomalies'],
    queryFn: (): Promise<Anomaly[]> =>
      apiClient.get('/anomalies').then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (anomaly: Anomaly) =>
      apiClient.post('/incidents', {
        description: `Anomaly detected on ${anomaly.host} from ${anomaly.source}`,
        severity: 'Medium',
        status: 'Open',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
    },
  });

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            <AlertTriangle className="text-brand-orange" />
            Alert Triage
        </h1>
        <div className="text-sm text-text-muted">
            {data?.length || 0} Pending Anomalies
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-12 text-text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded text-center">
            Failed to load alerts. Please try again later.
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length === 0 ? (
              <div className="col-span-full p-8 text-center text-text-muted bg-surface border border-surface-highlight rounded-lg">
                  No alerts pending triage. Good job!
              </div>
          ) : (
            data.map((anomaly) => (
                <div key={anomaly.id} className="bg-surface border border-surface-highlight rounded-lg p-6 hover:border-brand-orange/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-text">{anomaly.type}</h2>
                            <span className="text-xs text-text-muted font-mono">{anomaly.host}</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-brand-orange bg-brand-orange/10 px-2 py-1 rounded">
                        {/* Mock Score for display */}
                        Score: 0.85
                    </span>
                </div>

                <div className="space-y-2 mb-6 text-sm text-text-muted">
                    <div className="flex justify-between">
                        <span>Source:</span>
                        <span className="text-text">{anomaly.source}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Detected:</span>
                        <span className="text-text">Just now</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 px-3 py-2 bg-surface-highlight hover:bg-surface-highlight/80 rounded text-sm font-medium transition-colors text-text-muted hover:text-text">
                        <XCircle size={16} />
                        Dismiss
                    </button>
                    <button
                        onClick={() => mutation.mutate(anomaly)}
                        disabled={mutation.isPending}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-brand-blue text-background hover:bg-brand-blue/90 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {mutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <CheckCircle size={16} />
                        )}
                        Escalate
                    </button>
                </div>
                </div>
            ))
          )}
        </div>
      )}
    </PageTransition>
  );
};

export default AlertTriage;
