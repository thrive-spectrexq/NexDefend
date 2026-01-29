import React from 'react';
import MockDashboard from '../components/MockDashboard';

const GrafanaPage: React.FC = () => {
  const grafanaUrl = import.meta.env.VITE_GRAFANA_URL;

  // Use iframe if URL is explicitly set in env, otherwise mock
  if (grafanaUrl) {
      return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
          <h2 className="text-xl font-mono font-bold text-white mb-4">Grafana Dashboard</h2>
          <iframe
            src={grafanaUrl}
            className="w-full h-full border-none rounded-xl bg-[#181b1f]"
            title="Grafana"
          />
        </div>
      );
  }

  return <MockDashboard title="System Performance (Grafana View)" color="#F59E0B" />;
};

export default GrafanaPage;
