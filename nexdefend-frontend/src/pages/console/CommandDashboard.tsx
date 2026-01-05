import { useEffect, useState } from 'react';
import { ShieldAlert, Lock, Zap, Server } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { EmbeddedGrafanaPanel } from '../../components/dashboard/EmbeddedGrafanaPanel';
import AnomalyList from '../../components/dashboard/AnomalyList';
import { getDashboardStats, type DashboardSummary } from '../../api/apiClient'; // Import API
import { cn } from '../../lib/utils';
import { Globe, Cpu, Wifi } from 'lucide-react';

// Helper to map string names to Icons
const getIconForModule = (name: string) => {
    if (name.includes('Security')) return ShieldAlert;
    if (name.includes('Integrity')) return Lock;
    if (name.includes('Vulnerability')) return Zap;
    return Server;
};

// Reuse previous chart data mock for now (or fetch separate timeseries API if built)
const trafficData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  inbound: Math.floor(Math.random() * 500) + 100,
  outbound: Math.floor(Math.random() * 300) + 50,
  alerts: Math.floor(Math.random() * 50),
}));

export default function CommandDashboard() {
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds for "Live" feel
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-text">Loading Security Console...</div>;

  return (
    <div className="p-6 space-y-6 bg-surface-darker min-h-full">

      {/* 1. Top HUD - KPI Cards (Using Live Data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="relative overflow-hidden">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-text-muted text-xs font-mono uppercase tracking-wider">Security Posture</p>
                    {/* Calculate a simple posture score based on compliance */}
                    <h2 className="text-2xl font-bold text-white mt-1">
                        {stats && stats.compliance.length > 0 ? Math.round(stats.compliance.reduce((acc, curr) => acc + curr.score, 0) / stats.compliance.length) : 0}%
                    </h2>
                    <p className="text-xs text-brand-green mt-2 flex items-center">
                        Live Monitor
                    </p>
                </div>
                <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                    <ShieldAlert size={20} />
                </div>
            </div>
             {/* Sparkline background... */}
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
                    {(() => {
                        const agentMod = stats?.modules.find(m => m.name === 'Active Agents');
                        return (
                            <>
                                <h2 className="text-2xl font-bold text-white mt-1">{agentMod?.count || 0}<span className="text-text-dim text-lg"></span></h2>
                                <p className="text-xs text-brand-green mt-2 flex items-center">
                                    <Server size={12} className="mr-1" /> {agentMod?.status || 'Unknown'}
                                </p>
                            </>
                        );
                    })()}
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
                    <h2 className="text-2xl font-bold text-white mt-1">
                        {stats ? (stats.total_events_24h / 1000).toFixed(1) + 'k' : '0'}
                    </h2>
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

      {/* 2. Main Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Security Events Over Time */}
        <div className="lg:col-span-2">
            <GlassCard title="Live Network Traffic (Suricata/Netflow)" className="h-[400px]" noPadding>
                {/* Replace 'panelId=10' with the actual ID from your Grafana 'nexdefend.json' dashboard
                   that shows 'Suricata Alerts Over Time' or 'Network Throughput'
                */}
                <EmbeddedGrafanaPanel
                    src="/d-solo/nexdefend-overview/nexdefend?orgId=1&panelId=10&refresh=5s"
                    className="w-full h-full"
                />
            </GlassCard>
        </div>

        {/* Right: Security Modules Status (Live Data) */}
        <GlassCard title="Security Module Status" className="h-[400px]">
            <div className="space-y-4">
                {stats?.modules.map((mod) => {
                    const Icon = getIconForModule(mod.name);
                    return (
                        <div key={mod.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-md",
                                    mod.status === 'critical' ? "bg-brand-red/20 text-brand-red" :
                                    mod.status === 'warning' ? "bg-brand-yellow/20 text-brand-yellow" :
                                    "bg-brand-green/20 text-brand-green"
                                )}>
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-text group-hover:text-white">{mod.name}</h4>
                                    <p className="text-xs text-text-muted">Active Monitoring</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-white">{mod.count}</div>
                                <div className="text-[10px] text-text-dim uppercase">{mod.status}</div>
                            </div>
                        </div>
                    );
                })}

                {/* Compliance Mini-Viz (Live Data) */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-xs font-mono uppercase text-text-muted mb-3">Compliance Scores</h4>
                    <div className="flex gap-2">
                        {stats?.compliance.map((comp) => (
                            <div key={comp.standard} className="flex-1 bg-surface-dark p-2 rounded text-center border border-white/5">
                                <div className={cn("text-lg font-bold", comp.status === 'pass' ? "text-brand-green" : "text-brand-red")}>
                                    {comp.score}%
                                </div>
                                <div className="text-[10px] text-text-dim">{comp.standard}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </GlassCard>
      </div>

      {/* ... Bottom Section ... */}
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
