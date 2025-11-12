import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/apiClient';
import type { Threat, Incident } from '../../api/apiClient';
import Header from '../../components/organisms/Header';
import SideNav from '../../components/organisms/SideNav';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import AlertsBarChart from './AlertsBarChart';
import ProtocolsPieChart from './ProtocolsPieChart';
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

  const isLoading = threatsQuery.isLoading || incidentsQuery.isLoading;
  const isError = threatsQuery.isError || incidentsQuery.isError;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6 md:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 size={48} className="animate-spin" />
            </div>
          ) : isError ? (
            <div>
              <h1 className="text-3xl font-bold text-red-500">Error Loading Dashboard</h1>
              <p className="mt-2">Could not fetch critical data. The API may be down.</p>
              <pre className="text-red-300 mt-4 bg-gray-800 p-4 rounded">
                {threatsQuery.error?.message || incidentsQuery.error?.message}
              </pre>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <AlertsBarChart data={threatsQuery.data || []} />
                <ProtocolsPieChart data={threatsQuery.data || []} />
              </section>
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  title="Total Threats (24h)"
                  value={threatsQuery.data?.length || 0}
                  icon={<AlertTriangle size={28} />}
                  isLoading={false}
                />
                <StatCard
                  title="Open Incidents"
                  value={incidentsQuery.data?.length || 0}
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
                  <ChartCard title="Alerts Over Time" data={threatsQuery.data || []} isLoading={false} />
                </div>
                <div className="h-full">
                  <DataTable threats={threatsQuery.data || []} isLoading={false} />
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
