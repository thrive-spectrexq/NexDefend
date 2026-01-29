import { Activity, Server, Shield, Globe } from 'lucide-react';
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

        {/* Center Column: Live Security Events */}
        <div className="lg:col-span-2">
           <GlassCard title="Live Security Events" icon={<Activity size={18} />} className="h-full min-h-[400px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-gray-500 text-xs border-b border-white/10">
                      <th className="p-3 font-medium uppercase tracking-wider">Time</th>
                      <th className="p-3 font-medium uppercase tracking-wider">Event</th>
                      <th className="p-3 font-medium uppercase tracking-wider">Source</th>
                      <th className="p-3 font-medium uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono text-gray-300">
                    {[
                      { time: '10:42:05', event: 'SSH Login Attempt', source: '192.168.1.105', status: 'BLOCKED', color: 'text-red-400' },
                      { time: '10:41:55', event: 'Outbound Connection', source: 'process: curl', status: 'ALLOWED', color: 'text-green-400' },
                      { time: '10:40:12', event: 'File Integrity Check', source: '/etc/passwd', status: 'VERIFIED', color: 'text-cyan-400' },
                      { time: '10:38:45', event: 'Port Scan Detected', source: '10.0.0.55', status: 'FLAGGED', color: 'text-yellow-400' },
                      { time: '10:35:20', event: 'Agent Heartbeat', source: 'web-server-01', status: 'ACTIVE', color: 'text-blue-400' },
                      { time: '10:30:00', event: 'System Update', source: 'apt-get', status: 'COMPLETED', color: 'text-purple-400' },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3 text-gray-500">{row.time}</td>
                        <td className="p-3 font-medium text-white">{row.event}</td>
                        <td className="p-3 text-gray-400">{row.source}</td>
                        <td className={`p-3 text-right font-bold ${row.color}`}>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
