import React, { useEffect, useState } from 'react';
import { PageTransition } from '../components/common/PageTransition';
import { Brain, Activity, Database, AlertOctagon } from 'lucide-react';
import { cn } from '../lib/utils';

// Reusing StatCard style from CommandDashboard for consistency
function StatCard({ label, value, subtext, icon: Icon, colorClass }: any) {
    return (
        <div className="bg-surface border border-surface-highlight p-6 rounded-lg relative overflow-hidden group hover:border-brand-blue/50 transition-colors">
            <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity", colorClass)}>
                <Icon size={64} />
            </div>
            <div className="relative z-10">
                <div className="text-text-muted text-sm uppercase tracking-wider font-semibold mb-2">{label}</div>
                <div className="text-4xl font-mono font-bold text-text mb-1">{value}</div>
                {subtext && <div className={cn("text-xs font-mono", colorClass)}>{subtext}</div>}
            </div>
        </div>
    );
}

const AIDashboardPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ events_processed: 0, anomalies_detected: 0, average_inference_time: "0ms" });

  const fetchAnomalies = async () => {
    try {
      const response = await fetch('http://localhost:5000/anomalies');
      if (response.ok) {
        const data = await response.json();
        setAnomalies(data.anomalies || []);
      }
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api-metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleTrainModel = async () => {
    try {
      const res = await fetch('http://localhost:5000/train', { method: 'POST' });
      if (res.ok) {
        alert('Model training started successfully');
      }
    } catch (error) {
      console.error('Error training model:', error);
      alert('Failed to start model training');
    }
  };

  useEffect(() => {
    fetchAnomalies();
    fetchMetrics();
    const interval = setInterval(() => {
        fetchAnomalies();
        fetchMetrics();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text flex items-center gap-3">
              <Brain className="text-brand-blue" />
              AI Threat Intelligence
          </h1>
          <button
            onClick={handleTrainModel}
            className="px-4 py-2 bg-brand-blue text-background hover:bg-brand-blue/90 rounded transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <Database size={16} />
            Retrain Model
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
            label="Events Processed"
            value={metrics.events_processed.toLocaleString()}
            subtext="Total Analyzed"
            icon={Activity}
            colorClass="text-brand-blue"
        />
        <StatCard
            label="Anomalies Found"
            value={metrics.anomalies_detected}
            subtext="Deviation > 0.85"
            icon={AlertOctagon}
            colorClass="text-brand-red"
        />
         <StatCard
            label="Inference Time"
            value={metrics.average_inference_time}
            subtext="Per Event"
            icon={Brain}
            colorClass="text-brand-green"
        />
      </div>

      <div className="bg-surface border border-surface-highlight rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Detected Anomalies</h3>
        {anomalies.length === 0 ? (
             <div className="p-8 text-center text-text-muted">No anomalies detected recently. System is stable.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-text-muted font-mono bg-surface-highlight/20 border-b border-surface-highlight">
                        <tr>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Host</th>
                            <th className="p-3">Source</th>
                            <th className="p-3 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-highlight font-mono">
                        {anomalies.map((anomaly, idx) => (
                            <tr key={idx} className="hover:bg-surface-highlight/10">
                                <td className="p-3 text-text-muted">{new Date(anomaly.timestamp).toLocaleTimeString()}</td>
                                <td className="p-3 text-text font-bold text-brand-red">{anomaly.type}</td>
                                <td className="p-3 text-text">{anomaly.host}</td>
                                <td className="p-3 text-text-muted">{anomaly.source}</td>
                                <td className="p-3 text-right text-brand-orange">{anomaly.score.toFixed(3)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AIDashboardPage;
