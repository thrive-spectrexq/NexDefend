import { useState } from 'react';
import { Activity, Server, Shield, Globe, X, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { ResourceGauge } from '../components/dashboard/ResourceGauge';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const sparkData = [
    { v: 10 }, { v: 15 }, { v: 8 }, { v: 12 }, { v: 20 }, { v: 16 }, { v: 22 }, { v: 18 }, { v: 25 }, { v: 20 }
];

const StatCard = ({ label, value, color, icon: Icon, showSpark = false, to }: any) => (
  <Link to={to} className="block group">
      <GlassCard className="flex items-center justify-between p-4 relative overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-all">
         <div className="z-10">
           <p className="text-gray-400 text-xs uppercase tracking-wider mb-1 group-hover:text-cyan-400 transition-colors">{label}</p>
           <h2 className={`text-2xl font-bold font-mono ${color} drop-shadow-sm`}>{value}</h2>
         </div>
         <div className="flex flex-col items-end gap-2 z-10">
           <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
             <Icon size={20} />
           </div>
           {showSpark && (
             <div className="h-8 w-20 opacity-70 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={sparkData}>
                      <Line type="monotone" dataKey="v" stroke={color === 'text-green-400' ? '#4ade80' : '#3b82f6'} strokeWidth={2} dot={false} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
           )}
         </div>
         {/* Decorative subtle background icon */}
         <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-white/[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      </GlassCard>
  </Link>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const events = [
      { id: 1, time: '10:42:05', event: 'SSH Login Attempt', source: '192.168.1.105', status: 'BLOCKED', color: 'text-red-500 border-red-500/30 bg-red-500/10', details: 'Repeated failed login attempts (5) from unknown IP. Geolocation: CN.' },
      { id: 2, time: '10:41:55', event: 'Outbound Connection', source: 'process: curl', status: 'ALLOWED', color: 'text-green-400 border-green-500/30 bg-green-500/10', details: 'Standard health check to update server.' },
      { id: 3, time: '10:40:12', event: 'File Integrity Check', source: '/etc/passwd', status: 'VERIFIED', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10', details: 'Checksum match confirmed. No unauthorized modifications.' },
      { id: 4, time: '10:38:45', event: 'Port Scan Detected', source: '10.0.0.55', status: 'FLAGGED', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', details: 'Sequential port scan detected on range 3000-4000. Source is internal workstation.' },
      { id: 5, time: '10:35:20', event: 'Agent Heartbeat', source: 'web-server-01', status: 'ACTIVE', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', details: 'Routine heartbeat received. System load normal.' },
      { id: 6, time: '10:30:00', event: 'System Update', source: 'apt-get', status: 'COMPLETED', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', details: 'Security patches applied successfully.' },
  ];

  return (
    <>
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard label="Threat Score" value="LOW" color="text-green-400" icon={Shield} showSpark={true} to="/alerts" />
        <StatCard label="Active Agents" value="42/42" color="text-cyan-400" icon={Server} showSpark={true} to="/agents" />
        <StatCard label="Network Load" value="1.2 GB/s" color="text-blue-400" icon={Activity} showSpark={true} to="/network" />
        <StatCard label="Global Status" value="SECURE" color="text-purple-400" icon={Globe} to="/topology" />
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
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer" onClick={() => navigate('/incidents')}>
                       <div>
                          <p className="text-red-400 font-bold text-sm font-mono">{inc.type}</p>
                          <p className="text-xs text-gray-500">{inc.id}</p>
                       </div>
                       <span className="text-xs font-mono px-2 py-1 rounded bg-red-500/10 text-red-400">{inc.time}</span>
                    </div>
                 ))}
              </div>
              <div className="mt-4 text-center">
                 <NeonButton variant="danger" className="w-full justify-center text-sm cursor-pointer" onClick={() => navigate('/incidents')}>
                    View All Incidents
                 </NeonButton>
              </div>
           </GlassCard>
        </div>

        {/* Center Column: Live Security Events (Interactive) */}
        <div className="lg:col-span-2 relative">
           <GlassCard title="Live Security Events" icon={<Activity size={18} />} className="h-full min-h-[400px]">
              <div className="space-y-1 font-mono text-sm">
                {events.map((row, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSelectedEvent(row)}
                        className={`flex items-center gap-4 p-2.5 border-b border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group ${selectedEvent?.id === row.id ? 'bg-white/[0.08] border-l-2 border-l-cyan-400' : ''}`}
                    >
                        <span className="text-gray-500 w-20 shrink-0">{row.time}</span>
                        <div className={`w-2 h-2 rounded-full opacity-50 group-hover:opacity-100 ${row.status === 'BLOCKED' ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-gray-300 flex-1 truncate">{row.event}</span>
                        <span className="text-gray-500 hidden sm:block w-32 truncate text-right">{row.source}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.color} shadow-[0_0_10px_inset_rgba(0,0,0,0.2)]`}>
                            {row.status}
                        </span>
                    </div>
                ))}
              </div>
           </GlassCard>

           {/* Event Details Slide-over Panel */}
           {selectedEvent && (
              <div className="absolute inset-y-0 right-0 w-80 bg-[#09090b]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="font-mono font-bold text-white">Event Details</h3>
                      <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-white"><X size={18}/></button>
                  </div>
                  <div className="p-6 space-y-6 overflow-y-auto flex-1">
                      <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Event Type</p>
                          <div className="flex items-center gap-2 text-cyan-400 font-bold">
                              <ShieldCheck size={16} />
                              {selectedEvent.event}
                          </div>
                      </div>
                      <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Source Origin</p>
                          <div className="flex items-center gap-2 text-white font-mono text-sm">
                              <Globe size={16} className="text-gray-400" />
                              {selectedEvent.source}
                          </div>
                      </div>
                      <div className="p-3 rounded bg-white/5 border border-white/5">
                          <p className="text-xs text-gray-400 mb-2 font-mono">Log Analysis:</p>
                          <p className="text-sm text-gray-200 leading-relaxed">{selectedEvent.details}</p>
                      </div>

                      {selectedEvent.status === 'BLOCKED' && (
                          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 flex gap-3">
                              <AlertTriangle className="text-red-500 shrink-0" size={20} />
                              <div>
                                  <p className="text-red-400 font-bold text-xs">THREAT BLOCKED</p>
                                  <p className="text-red-300/70 text-xs mt-1">Firewall rules automatically engaged.</p>
                              </div>
                          </div>
                      )}

                      <NeonButton className="w-full justify-center text-xs gap-2">
                          <ExternalLink size={14} /> Analyze Log
                      </NeonButton>
                  </div>
              </div>
           )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
