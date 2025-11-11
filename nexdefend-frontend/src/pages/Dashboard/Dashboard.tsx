import useAuthStore from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient, Threat, Incident } from '../../api/apiClient';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import DataTable from './DataTable';
import { ShieldCheck, AlertTriangle, Server, ShieldAlert } from 'lucide-react';

// Fetch functions
const fetchThreats = async (): Promise<Threat[]> => {
  const { data } = await apiClient.get('/threats');
  return data;
};

const fetchIncidents = async (): Promise<Incident[]> => {
  const { data } = await apiClient.get('/incidents?status=Open'); // Only show open incidents
  return data;
};

const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout);

  const threatsQuery = useQuery({
    queryKey: ['threats'],
    queryFn: fetchThreats,
  });

  const incidentsQuery = useQuery({
    queryKey: ['incidents', 'open'],
    queryFn: fetchIncidents,
  });

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to NexDefend</h1>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Logout
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <StatCard 
          title="Total Threats (24h)" 
          value={threatsQuery.isSuccess ? threatsQuery.data.length : 0} 
          icon={<AlertTriangle size={32} />} 
          isLoading={threatsQuery.isLoading}
        />
        <StatCard 
          title="Open Incidents" 
          value={incidentsQuery.isSuccess ? incidentsQuery.data.length : 0} 
          icon={<ShieldAlert size={32} />}
          isLoading={incidentsQuery.isLoading} 
        />
        <StatCard 
          title="Vulnerabilities" 
          value={0} // We'll wire this up later
          icon={<ShieldCheck size={32} />} 
          isLoading={false}
        />
        <StatCard 
          title="Systems Monitored" 
          value={8} // This remains static for now
          icon={<Server size={32} />} 
          isLoading={false}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartCard 
            title="Alerts Over Time" 
            data={threatsQuery.data || []} 
            isLoading={threatsQuery.isLoading} 
          />
        </div>
        <div>
          <DataTable 
            threats={threatsQuery.data || []} 
            isLoading={threatsQuery.isLoading} 
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
