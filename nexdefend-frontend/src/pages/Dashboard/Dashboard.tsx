import useAuthStore from '../../stores/authStore';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import DataTable from './DataTable';
import { ShieldCheck, AlertTriangle, Server } from 'lucide-react';

const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to Nexdefend</h1>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Logout
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <StatCard title="Total Alerts" value="1,428" icon={<AlertTriangle size={32} />} />
        <StatCard title="Incidents" value="32" icon={<ShieldCheck size={32} />} />
        <StatCard title="Systems Monitored" value="8" icon={<Server size={32} />} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartCard title="Alerts Over Time" />
        </div>
        <div>
          <DataTable />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;