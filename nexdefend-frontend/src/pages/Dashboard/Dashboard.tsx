import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/apiClient';
import type { Threat, Incident } from '../../api/apiClient';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import DataTable from './DataTable';
import { ShieldCheck, AlertTriangle, Server, ShieldAlert, Loader2 } from 'lucide-react';

// Fetch functions
const fetchThreats = async (): Promise<Threat[]> => {
  const { data } = await apiClient.get('/threats');
  return data;
};

const fetchIncidents = async (): Promise<Incident[]> => {
  const { data } = await apiClient.get('/incidents?status=Open');
  return data;
};

const Dashboard = () => {
  const threatsQuery = useQuery({
    queryKey: ['threats'],
    queryFn: fetchThreats,
  });

  const incidentsQuery = useQuery({
    queryKey: ['incidents', 'open'],
    queryFn: fetchIncidents,
  });

  const isLoading = threatsQuery.isLoading || incidentsQuery.isLoading;
  const isError = threatsQuery.isError || incidentsQuery.isError;

  // We can now safely access .data by checking success state
  const threatCount = threatsQuery.isSuccess ? threatsQuery.data.length : 0;
  const incidentCount = incidentsQuery.isSuccess ? incidentsQuery.data.length : 0;
  const threatsData = threatsQuery.isSuccess ? threatsQuery.data : [];

  return (
    // Removed wrapper div and header, as AppLayout handles it.
    <>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {isError ? (
        <div className="bg-gray-800 p-6 rounded-lg border border-red-500">
          <h2 className="text-2xl font-bold text-red-500">Error Loading Dashboard</h2>
          <p className="mt-2">Could not fetch critical data. The API may be down.</p>
          <pre className="text-red-300 mt-4 bg-gray-900 p-4 rounded">
            {threatsQuery.error?.message || incidentsQuery.error?.message}
          </pre>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard 
              title="Total Threats (24h)" 
              value={threatCount} 
              icon={<AlertTriangle size={28} />} 
              isLoading={threatsQuery.isLoading}
            />
            <StatCard 
              title="Open Incidents" 
              value={incidentCount} 
              icon={<ShieldAlert size={28} />}
              isLoading={incidentsQuery.isLoading} 
            />
            <StatCard 
              title="Vulnerabilities" 
              value={0} // Placeholder
              icon={<ShieldCheck size={28} />} 
              isLoading={false}
            />
            <StatCard 
              title="Systems Monitored" 
              value={8} // Static for now
              icon={<Server size={28} />} 
              isLoading={false}
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard 
                title="Alerts Over Time" 
                data={threatsData} 
                isLoading={threatsQuery.isLoading} 
              />
            </div>
            <div className="h-full">
              <DataTable 
                threats={threatsData} 
                isLoading={threatsQuery.isLoading} 
              />
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Dashboard;
