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
  // Setup the queries
  const threatsQuery = useQuery({
    queryKey: ['threats'],
    queryFn: fetchThreats,
  });

  const incidentsQuery = useQuery({
    queryKey: ['incidents', 'open'],
    queryFn: fetchIncidents,
  });

  // --- FIX: Add loading and error states ---
  const isLoading = threatsQuery.isLoading || incidentsQuery.isLoading;
  const isError = threatsQuery.isError || incidentsQuery.isError;

  // 1. RENDER LOADING STATE
  // If data is still loading, show a spinner and stop.
  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-8 flex justify-center items-center">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  // 2. RENDER ERROR STATE
  // If either query failed, show an error and stop.
  if (isError) {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-8">
        <h1 className="text-3xl font-bold text-red-500">Error Loading Dashboard</h1>
        <p className="mt-2">Could not fetch critical data. The API may be down.</p>
        <pre className="text-red-300 mt-4 bg-gray-900 p-4 rounded">
          {threatsQuery.error?.message || incidentsQuery.error?.message}
        </pre>
      </div>
    );
  }
  // --- END FIX ---

  // 3. RENDER SUCCESS STATE
  // If we get here, it means isLoading=false, isError=false,
  // and .data is guaranteed to be available (or an empty array).
  const threatCount = threatsQuery.data?.length || 0;
  const incidentCount = incidentsQuery.data?.length || 0;
  const threatsData = threatsQuery.data || [];

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Threats (24h)" 
          value={threatCount} 
          icon={<AlertTriangle size={28} />} 
          isLoading={false} // We already handled loading
        />
        <StatCard 
          title="Open Incidents" 
          value={incidentCount} 
          icon={<ShieldAlert size={28} />}
          isLoading={false} 
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
            isLoading={false} 
          />
        </div>
        <div className="h-full">
          <DataTable 
            threats={threatsData} 
            isLoading={false} 
          />
        </div>
      </section>
    </>
  );
};

export default Dashboard;
