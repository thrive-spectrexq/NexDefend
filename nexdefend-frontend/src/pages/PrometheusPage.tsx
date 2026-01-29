import React from 'react';
import MockDashboard from '../components/MockDashboard';

const PrometheusPage: React.FC = () => {
  const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL;

  // Use iframe if URL is explicitly set in env, otherwise mock
  if (prometheusUrl) {
      return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
          <h2 className="text-xl font-mono font-bold text-white mb-4">Prometheus</h2>
          <iframe
            src={prometheusUrl}
            className="w-full h-full border-none rounded-xl bg-[#222]"
            title="Prometheus"
          />
        </div>
      );
  }

  return <MockDashboard title="Metrics Stream (Prometheus View)" color="#ef4444" />;
};

export default PrometheusPage;
