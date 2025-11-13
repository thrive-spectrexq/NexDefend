import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';
import type { Anomaly } from '../api/apiClient';
import { Loader2, AlertTriangle } from 'lucide-react';
import './Alerts.css';

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
    <div className="alerts-page">
      <h1 className="text-3xl font-bold mb-6">Alert Triage</h1>

      {isLoading && (
        <div className="flex justify-center items-center p-12">
          <Loader2 size={40} className="animate-spin">
            <title>Loading...</title>
          </Loader2>
        </div>
      )}

      {error && (
        <p className="text-red-500">Failed to load alerts. Please try again later.</p>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((anomaly) => (
            <div key={anomaly.id} className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-yellow-400 mr-4" size={24} />
                <h2 className="text-xl font-bold">{anomaly.type}</h2>
              </div>
              <p className="text-gray-400 mb-2">Host: {anomaly.host}</p>
              <p className="text-gray-400 mb-4">Source: {anomaly.source}</p>
              <button
                onClick={() => mutation.mutate(anomaly)}
                disabled={mutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {mutation.isPending ? 'Escalating...' : 'Escalate to Incident'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertTriage;
