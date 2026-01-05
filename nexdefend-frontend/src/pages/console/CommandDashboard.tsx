import { Activity, ShieldAlert, Server, Wifi, Cpu, Lock, Globe, Zap } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AnomalyList from '../../components/dashboard/AnomalyList';
import { cn } from '../../lib/utils';

// Mock Data for Visuals
const trafficData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  inbound: Math.floor(Math.random() * 500) + 100,
  outbound: Math.floor(Math.random() * 300) + 50,
  alerts: Math.floor(Math.random() * 50),
}));

const complianceData = [
    { name: 'PCI-DSS', score: 85 },
    { name: 'GDPR', score: 92 },
    { name: 'HIPAA', score: 78 },
];

const wazuhModules = [
    { name: 'Security Events', count: 1240, status: 'critical', icon: ShieldAlert },
    { name: 'Integrity Monitoring', count: 3, status: 'warning', icon: Lock },
    { name: 'Vulnerability Detector', count: 12, status: 'warning', icon: Zap },
    { name: 'System Auditing', count: 100, status: 'healthy', icon: Activity },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-darker border border-white/10 p-3 rounded shadow-xl backdrop-blur-md">
          <p className="text-text font-mono text-xs mb-2">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-xs font-medium" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
};

export default function CommandDashboard() {
  return (
    <div className="p-6 space-y-6 bg-surface-darker min-h-full">

      {/* 1. Top HUD - KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="relative overflow-hidden">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-text-muted text-xs font-mono uppercase tracking-wider">Security Posture</p>
                    <h2 className="text-2xl font-bold text-white mt-1">82%</h2>
                    <p className="text-xs text-brand-green mt-2 flex items-center">
                        <Activity size={12} className="mr-1" /> +2.4% vs last week
                    </p>
                </div>
                <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                    <ShieldAlert size={20} />
                </div>
            </div>
            {/* Sparkline background */}
            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData}>
                        <Area type="monotone" dataKey="inbound" stroke="#00a3e0" fill="#00a3e0" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>

        <GlassCard>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-text-muted text-xs font-mono uppercase tracking-wider">Active Agents</p>
                    <h2 className="text-2xl font-bold text-white mt-1">42<span className="text-text-dim text-lg">/45</span></h2>
                    <p className="text-xs text-brand-red mt-2 flex items-center">
                        <Server size={12} className="mr-1" /> 3 Offline
                    </p>
                </div>
                <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
                    <Wifi size={20} />
                </div>
            </div>
        </GlassCard>

        <GlassCard>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-text-muted text-xs font-mono uppercase tracking-wider">Total Events (24h)</p>
                    <h2 className="text-2xl font-bold text-white mt-1">1.2M</h2>
                    <p className="text-xs text-text-muted mt-2">14.5k events/sec</p>
                </div>
                <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
                    <Zap size={20} />
                </div>
            </div>
        </GlassCard>

        <GlassCard>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-text-muted text-xs font-mono uppercase tracking-wider">CPU Utilization</p>
                    <h2 className="text-2xl font-bold text-white mt-1">34%</h2>
                    <p className="text-xs text-brand-green mt-2">Healthy</p>
                </div>
                <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow">
                    <Cpu size={20} />
                </div>
            </div>
        </GlassCard>
      </div>

      {/* 2. Main Visualization Section (Wazuh Capabilities) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Security Events Over Time (Splunk Style Area Chart) */}
        <div className="lg:col-span-2">
            <GlassCard title="Security Events & Traffic" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00a3e0" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00a3e0" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d93f3c" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#d93f3c" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2b3036" vertical={false} />
                        <XAxis dataKey="time" stroke="#5c6773" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5c6773" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="inbound" stroke="#00a3e0" strokeWidth={2} fillOpacity={1} fill="url(#colorInbound)" name="Traffic (MB)" />
                        <Area type="monotone" dataKey="alerts" stroke="#d93f3c" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" name="Threats" />
                    </AreaChart>
                </ResponsiveContainer>
            </GlassCard>
        </div>

        {/* Right: Wazuh Modules Status (Honeycomb/List Hybrid) */}
        <GlassCard title="Wazuh Module Status" className="h-[400px]">
            <div className="space-y-4">
                {wazuhModules.map((mod) => (
                    <div key={mod.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-md",
                                mod.status === 'critical' ? "bg-brand-red/20 text-brand-red" :
                                mod.status === 'warning' ? "bg-brand-yellow/20 text-brand-yellow" :
                                "bg-brand-green/20 text-brand-green"
                            )}>
                                <mod.icon size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-text group-hover:text-white">{mod.name}</h4>
                                <p className="text-xs text-text-muted">Active Monitoring</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-white">{mod.count}</div>
                            <div className="text-[10px] text-text-dim uppercase">Alerts</div>
                        </div>
                    </div>
                ))}

                {/* Compliance Mini-Viz */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-xs font-mono uppercase text-text-muted mb-3">Compliance Scores</h4>
                    <div className="flex gap-2">
                        {complianceData.map((comp) => (
                            <div key={comp.name} className="flex-1 bg-surface-dark p-2 rounded text-center border border-white/5">
                                <div className={cn("text-lg font-bold", comp.score > 90 ? "text-brand-green" : comp.score > 80 ? "text-brand-yellow" : "text-brand-red")}>
                                    {comp.score}%
                                </div>
                                <div className="text-[10px] text-text-dim">{comp.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </GlassCard>
      </div>

      {/* 3. Bottom: Geo/Threat Map Placeholder & Recent Anomaly List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard title="Global Threat Source" className="min-h-[300px] flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-30">
                  {/* Abstract Map Background using simple dots or SVG */}
                  <div className="w-full h-full bg-[radial-gradient(#2b3036_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>
              <div className="text-center z-10">
                <Globe size={48} className="mx-auto text-brand-blue opacity-50 mb-2" />
                <p className="text-text-muted text-sm">Interactive Geo-Map Loading...</p>
                <div className="mt-4 flex gap-4 text-xs">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-brand-red"></div> CN (402)</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-brand-yellow"></div> RU (150)</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-brand-blue"></div> US (89)</div>
                </div>
              </div>
          </GlassCard>

          <GlassCard title="Recent Anomalies (AI Detected)" className="lg:col-span-2">
               <AnomalyList anomalies={[]} />
          </GlassCard>
      </div>
    </div>
  );
}
