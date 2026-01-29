import { Activity, Server, Shield, Globe, Lock } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { SentinelChat } from '../components/dashboard/SentinelChat';
import { ResourceGauge } from '../components/dashboard/ResourceGauge';

const DashboardPage = () => {
  return (
    <>
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Threat Score', value: 'LOW', color: 'text-green-400', icon: Shield },
          { label: 'Active Agents', value: '42/42', color: 'text-cyan-400', icon: Server },
          { label: 'Network Load', value: '1.2 GB/s', color: 'text-blue-400', icon: Activity },
          { label: 'Global Status', value: 'SECURE', color: 'text-purple-400', icon: Globe },
        ].map((stat, idx) => (
          <GlassCard key={idx} className="flex items-center justify-between p-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
              <h2 className={`text-2xl font-bold font-mono ${stat.color} drop-shadow-sm`}>{stat.value}</h2>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: System Health */}
        <div className="space-y-6">
           <GlassCard title="Resource Monitor" icon={<Activity size={18} />}>
              <div className="grid grid-cols-2 gap-4 h-40">
                <ResourceGauge value={45} label="CPU Load" />
                <ResourceGauge value={72} label="Memory" color="#8b5cf6" />
              </div>
              <div className="mt-4 space-y-2">
                 <div className="flex justify-between text-sm text-gray-400 font-mono">
                    <span>/dev/sda1</span>
                    <span className="text-green-400">HEALTHY</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full w-3/4 shadow-[0_0_10px_lime]" />
                 </div>
              </div>
           </GlassCard>

           <GlassCard title="Active Incidents">
              <div className="space-y-3">
                 {[
                    { id: 'INC-2091', type: 'Port Scan', sev: 'High', time: '2m ago' },
                    { id: 'INC-2092', type: 'Auth Fail', sev: 'Low', time: '15m ago' },
                 ].map((inc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                       <div>
                          <p className="text-red-400 font-bold text-sm font-mono">{inc.type}</p>
                          <p className="text-xs text-gray-500">{inc.id}</p>
                       </div>
                       <span className="text-xs font-mono px-2 py-1 rounded bg-red-500/10 text-red-400">{inc.time}</span>
                    </div>
                 ))}
              </div>
              <div className="mt-4 text-center">
                 <NeonButton variant="danger" className="w-full justify-center text-sm cursor-pointer">View All Incidents</NeonButton>
              </div>
           </GlassCard>
        </div>

        {/* Center Column: Threat Map (Placeholder Visual) */}
        <div className="lg:col-span-2">
           <GlassCard title="Global Threat Vector" icon={<Globe size={18} />} className="h-full min-h-[400px]">
              <div className="relative h-full w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center group">
                 {/* Decorative Map Background */}
                 <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center invert filter brightness-50" />

                 {/* Animated Pings */}
                 <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                 <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-500 rounded-full animate-ping delay-75" />
                 <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-yellow-500 rounded-full animate-ping delay-150" />

                 <div className="z-10 text-center">
                    <Lock className="h-12 w-12 text-cyan-500 mx-auto mb-4 opacity-80" />
                    <p className="text-gray-400 font-mono text-sm">Real-time Visualization Active</p>
                 </div>
              </div>
           </GlassCard>
        </div>

        {/* Bottom Wide: Sentinel */}
        <div className="lg:col-span-3">
           <SentinelChat />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
