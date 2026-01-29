import { Activity, Server, Shield, Globe } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { SentinelChat } from '../components/dashboard/SentinelChat';
import { ResourceGauge } from '../components/dashboard/ResourceGauge';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const sparkData = [
    { v: 10 }, { v: 15 }, { v: 8 }, { v: 12 }, { v: 20 }, { v: 16 }, { v: 22 }, { v: 18 }, { v: 25 }, { v: 20 }
];

const StatCard = ({ label, value, color, icon: Icon, showSpark = false }: any) => (
  <GlassCard className="flex items-center justify-between p-4 relative overflow-hidden">
     <div className="z-10">
       <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
       <h2 className={`text-2xl font-bold font-mono ${color} drop-shadow-sm`}>{value}</h2>
     </div>
     <div className="flex flex-col items-end gap-2 z-10">
       <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
         <Icon size={20} />
       </div>
       {showSpark && (
         <div className="h-8 w-20">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="v" stroke={color === 'text-green-400' ? '#4ade80' : '#3b82f6'} strokeWidth={2} dot={false} />
               </LineChart>
            </ResponsiveContainer>
         </div>
       )}
     </div>
     {/* Decorative subtle background icon */}
     <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-white/[0.03] pointer-events-none" />
  </GlassCard>
);

const DashboardPage = () => {
  return (
    <>
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard label="Threat Score" value="LOW" color="text-green-400" icon={Shield} showSpark={true} />
        <StatCard label="Active Agents" value="42/42" color="text-cyan-400" icon={Server} showSpark={true} />
        <StatCard label="Network Load" value="1.2 GB/s" color="text-blue-400" icon={Activity} showSpark={true} />
        <StatCard label="Global Status" value="SECURE" color="text-purple-400" icon={Globe} />
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
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
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

        {/* Center Column: Live Security Events (Monospaced Stream Style) */}
        <div className="lg:col-span-2">
           <GlassCard title="Live Security Events" icon={<Activity size={18} />} className="h-full min-h-[400px]">
              <div className="space-y-1 font-mono text-sm">
                {[
                    { time: '10:42:05', event: 'SSH Login Attempt', source: '192.168.1.105', status: 'BLOCKED', color: 'text-red-500 border-red-500/30 bg-red-500/10' },
                    { time: '10:41:55', event: 'Outbound Connection', source: 'process: curl', status: 'ALLOWED', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
                    { time: '10:40:12', event: 'File Integrity Check', source: '/etc/passwd', status: 'VERIFIED', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
                    { time: '10:38:45', event: 'Port Scan Detected', source: '10.0.0.55', status: 'FLAGGED', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
                    { time: '10:35:20', event: 'Agent Heartbeat', source: 'web-server-01', status: 'ACTIVE', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
                    { time: '10:30:00', event: 'System Update', source: 'apt-get', status: 'COMPLETED', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
                ].map((row, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-2.5 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <span className="text-gray-500 w-20 shrink-0">{row.time}</span>
                        <div className="w-2 h-2 rounded-full bg-current opacity-50 group-hover:opacity-100" />
                        <span className="text-gray-300 flex-1 truncate">{row.event}</span>
                        <span className="text-gray-500 hidden sm:block w-32 truncate text-right">{row.source}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.color} shadow-[0_0_10px_inset_rgba(0,0,0,0.2)]`}>
                            {row.status}
                        </span>
                    </div>
                ))}
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
