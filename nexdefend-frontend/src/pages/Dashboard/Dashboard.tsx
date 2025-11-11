import useAuthStore from '../../stores/authStore';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import DataTable from './DataTable';
import { ShieldCheck, AlertTriangle, Server } from 'lucide-react';

const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">NexDefend Console</h1>
            <p className="text-slate-400 mt-1">Overview of alerts, incidents, and monitored systems</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300 mr-3 hidden sm:block">Signed in as <span className="font-medium text-white">Admin</span></div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Alerts"
            value="1,428"
            icon={<AlertTriangle size={28} className="text-amber-400" />}
            className="bg-gradient-to-br from-amber-900/30 to-amber-800/20"
          />
          <StatCard
            title="Incidents"
            value="32"
            icon={<ShieldCheck size={28} className="text-emerald-400" />}
            className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20"
          />
          <StatCard
            title="Systems Monitored"
            value="8"
            icon={<Server size={28} className="text-sky-400" />}
            className="bg-gradient-to-br from-sky-900/30 to-sky-800/20"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/60 rounded-md p-4 shadow">
            <ChartCard title="Alerts Over Time" />
          </div>

          <div className="bg-slate-800/60 rounded-md p-4 shadow">
            <div className="text-sm text-slate-400 mb-3">Recent Alerts</div>
            <DataTable />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
