import { useState } from 'react';
import { Activity, Globe, X, ExternalLink, ShieldCheck, AlertTriangle, Cpu, Brain, Zap } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SystemPulseBar = () => (
    <GlassCard className="mb-6 p-4 flex flex-col md:flex-row items-center justify-between divide-y md:divide-y-0 md:divide-x divide-white/10 gap-4 md:gap-0">
        <div className="px-4 flex-1 text-center w-full md:w-auto">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Global Latency</p>
            <div className="text-2xl font-mono text-cyan-400 font-bold">24ms <span className="text-xs text-green-500">▼ 12%</span></div>
        </div>
        <div className="px-4 flex-1 text-center w-full md:w-auto">
             <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Throughput</p>
             <div className="text-2xl font-mono text-blue-400 font-bold">1.2 GB/s <span className="text-xs text-green-500">▲ 5%</span></div>
        </div>
        <div className="px-4 flex-1 text-center w-full md:w-auto">
             <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Error Rate</p>
             <div className="text-2xl font-mono text-green-400 font-bold">0.02% <span className="text-xs text-gray-500">~</span></div>
        </div>
        <div className="px-4 flex-1 text-center w-full md:w-auto">
             <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Threat Velocity</p>
             <div className="text-2xl font-mono text-purple-400 font-bold">LOW <span className="text-xs text-gray-500">0 events/s</span></div>
        </div>
    </GlassCard>
);

const DashboardPage = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Mock Data for Area Chart
  const trafficData = Array.from({ length: 20 }, (_, i) => ({
      time: `${10 + Math.floor(i/2)}:${(i%2)*30}:00`,
      network: Math.floor(Math.random() * 800) + 200, // MB/s
      threats: Math.floor(Math.random() * 50) + 5, // Blocked count
  }));

  // Mock Agent Data for Heatmap
  const agents = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      score: Math.floor(Math.random() * 100),
  }));

  // Posture Score Data
  const postureData = [
      { name: 'Score', value: 85, color: '#10b981' },
      { name: 'Risk', value: 15, color: '#333' }
  ];

  const events = [
      { id: 1, time: '10:42:05', event: 'SSH Login Attempt', source: '192.168.1.105', status: 'BLOCKED', color: 'text-red-500 border-red-500/30 bg-red-500/10', details: 'Repeated failed login attempts (5) from unknown IP. Geolocation: CN.' },
      { id: 2, time: '10:41:55', event: 'Outbound Connection', source: 'process: curl', status: 'ALLOWED', color: 'text-green-400 border-green-500/30 bg-green-500/10', details: 'Standard health check to update server.' },
      { id: 3, time: '10:40:12', event: 'File Integrity Check', source: '/etc/passwd', status: 'VERIFIED', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10', details: 'Checksum match confirmed. No unauthorized modifications.' },
      { id: 4, time: '10:38:45', event: 'Port Scan Detected', source: '10.0.0.55', status: 'FLAGGED', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', details: 'Sequential port scan detected on range 3000-4000. Source is internal workstation.' },
      { id: 5, time: '10:35:20', event: 'Agent Heartbeat', source: 'web-server-01', status: 'ACTIVE', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', details: 'Routine heartbeat received. System load normal.' },
      { id: 6, time: '10:30:00', event: 'System Update', source: 'apt-get', status: 'COMPLETED', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', details: 'Security patches applied successfully.' },
  ];

  const aiInsights = [
      "Anomaly detection model identified a 15% deviation in outbound DNS traffic patterns.",
      "Recommended Action: Rotate API keys for 'service-account-beta' due to inactivity.",
      "New vulnerability CVE-2023-XXXX matches installed package 'openssl' on 3 hosts."
  ];

  return (
    <div className="pb-10">
      {/* Global Telemetry Header (System Pulse) */}
      <SystemPulseBar />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Column: Observability Widgets */}
        <div className="lg:col-span-1 space-y-6">
           {/* Security Posture Gauge */}
           <GlassCard title="Security Posture" icon={<ShieldCheck size={18} className="text-green-400"/>} className="h-64 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40">
                     <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                             <Pie
                                data={postureData}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={70}
                                startAngle={180} endAngle={0}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                             >
                                 {postureData.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                             </Pie>
                         </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-4">
                         <span className="text-4xl font-bold text-white">85</span>
                         <p className="text-xs text-gray-400">EXCELLENT</p>
                     </div>
                </div>
                <div className="text-center px-4">
                    <p className="text-xs text-gray-500">System is hardened. No critical misconfigurations detected.</p>
                </div>
           </GlassCard>

           {/* Infrastructure Heatmap (Honeycomb) */}
           <GlassCard title="Infrastructure Risk" icon={<Cpu size={18} className="text-orange-400"/>} className="h-auto">
                <div className="flex flex-wrap gap-1.5 justify-center p-2">
                    {agents.map((agent) => (
                        <div
                            key={agent.id}
                            className={`w-7 h-7 flex items-center justify-center text-[9px] font-bold transition-all hover:scale-125 hover:z-10 cursor-pointer ${
                                agent.score > 80 ? 'bg-red-500 text-white shadow-[0_0_10px_red]' :
                                agent.score > 50 ? 'bg-yellow-500 text-black' :
                                'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}
                            title={`Agent ${agent.id}: Risk ${agent.score}`}
                            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                        >
                            {agent.score}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between px-4 mt-4 text-[10px] text-gray-500 uppercase font-mono">
                    <span>Healthy</span>
                    <span>Critical</span>
                </div>
                <div className="h-1 mx-4 mt-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" />
           </GlassCard>
        </div>

        {/* Center Column: Charts & Activity */}
        <div className="lg:col-span-2 space-y-6">
            {/* Correlated Time-Series */}
           <GlassCard title="Correlated: Net vs Threats" icon={<Activity size={18} className="text-blue-400"/>} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData}>
                        <defs>
                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" fontSize={9} tickFormatter={(v) => `${v}M`} width={30} />
                        <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={9} width={20} />
                        <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', fontSize: '12px' }} />
                        <Area yAxisId="left" type="monotone" dataKey="network" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNet)" />
                        <Area yAxisId="right" type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreat)" />
                    </AreaChart>
                </ResponsiveContainer>
           </GlassCard>

           {/* Live Security Events (Interactive) */}
           <div className="relative h-[400px]">
               <GlassCard title="Live Security Events" icon={<Zap size={18} className="text-yellow-400"/>} className="h-full">
                  <div className="space-y-1 font-mono text-sm h-[320px] overflow-y-auto custom-scrollbar">
                    {events.map((row, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedEvent(row)}
                            className={`flex items-center gap-4 p-2.5 border-b border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group ${selectedEvent?.id === row.id ? 'bg-white/[0.08] border-l-2 border-l-cyan-400' : ''}`}
                        >
                            <span className="text-gray-500 w-16 shrink-0 text-xs">{row.time}</span>
                            <div className={`w-2 h-2 rounded-full opacity-50 group-hover:opacity-100 ${row.status === 'BLOCKED' ? 'bg-red-500' : 'bg-green-500'}`} />
                            <span className="text-gray-300 flex-1 truncate">{row.event}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.color}`}>
                                {row.status}
                            </span>
                        </div>
                    ))}
                  </div>
               </GlassCard>

               {/* Event Details Slide-over Panel */}
               {selectedEvent && (
                  <div className="absolute inset-y-0 right-0 w-80 bg-[#09090b]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300 rounded-r-2xl">
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
                                      <p className="text-red-300/70 text-xs mt-1">Firewall rules engaged.</p>
                                  </div>
                              </div>
                          )}

                          <NeonButton className="w-full justify-center text-xs gap-2">
                              <ExternalLink size={14} /> Investigate
                          </NeonButton>
                      </div>
                  </div>
               )}
            </div>
        </div>

        {/* Right Column: AI & Remediation */}
        <div className="lg:col-span-1 space-y-6">
            <GlassCard title="NexDefend AI Insights" icon={<Brain size={18} className="text-purple-400"/>} className="h-full max-h-[600px] flex flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {aiInsights.map((insight, i) => (
                        <div key={i} className="p-3 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex gap-2">
                                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 shrink-0 animate-pulse" />
                                <p className="text-xs text-gray-300 leading-relaxed">{insight}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                    <NeonButton variant="ghost" className="w-full justify-center text-xs">View All Recommendations</NeonButton>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
