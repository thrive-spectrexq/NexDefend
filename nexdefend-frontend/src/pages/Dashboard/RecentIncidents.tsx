import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Incident } from '../../api/apiClient';

interface RecentIncidentsProps {
  incidents: Incident[];
}

const RecentIncidents: React.FC<RecentIncidentsProps> = ({ incidents }) => {
  // Sort incidents by created_at descending and take top 5
  const sortedIncidents = [...incidents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'open':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'in progress':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <ShieldAlert size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-full">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ShieldAlert className="text-red-400" size={24} />
        Recent Incidents
      </h3>

      {sortedIncidents.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No active incidents found.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-gray-700/50 p-3 rounded-lg border border-gray-700 flex justify-between items-start transition hover:bg-gray-700"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <h4 className="font-semibold text-sm truncate" title={incident.description}>
                    {incident.description}
                  </h4>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(incident.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  {getStatusIcon(incident.status)}
                  {incident.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {incidents.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition">
            View All Incidents
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentIncidents;
