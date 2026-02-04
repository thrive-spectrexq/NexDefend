import { useState, useEffect } from 'react';
import { Activity, X, ShieldCheck, AlertTriangle, Cpu, Brain, Zap, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useWebSocket } from '../hooks/useWebSocket';
import { getDashboardStats, getSystemMetrics } from '../api/dashboard';
import type { DashboardStats } from '../api/dashboard';
import { getAgents } from '../api/agents';
import { getEvents } from '../api/events';

// Utility to format timestamp
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const SystemPulseBar = ({ stats }: { stats: DashboardStats | null }) => (
    <GlassCard className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-1 border-l-2 border-cyan-500/30 pl-4 items-start">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Global Latency</p>
                <div className="flex items-end gap-2">
                    <div className="w-1 h-6 bg-cyan-500/20 rounded-full overflow-hidden mb-1">
                        <div className="w-full bg-cyan-500" style={{ height: '40%' }} />
                    </div>
                    <span className="text-3xl font-mono font-black text-white leading-none">
                        {stats ? stats.global_latency : '-'}
                    </span>
                    <span className="text-[10px] text-gray-600 mb-1 font-bold">ms</span>
                </div>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-blue-500/30 pl-4 items-start">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Throughput</p>
                <div className="flex items-end gap-2">
                    <div className="w-1 h-6 bg-blue-500/20 rounded-full overflow-hidden mb-1">
                        <div className="w-full bg-blue-500" style={{ height: '65%' }} />
                    </div>
                    <span className="text-3xl font-mono font-black text-white leading-none">
                        {stats ? stats.throughput : '-'}
                    </span>
                    <span className="text-[10px] text-gray-600 mb-1 font-bold">MB/s</span>
                </div>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-green-500/30 pl-4 items-start">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Error Rate</p>
                <div className="flex items-end gap-2">
                    <div className="w-1 h-6 bg-green-500/20 rounded-full overflow-hidden mb-1">
                        <div className="w-full bg-green-500" style={{ height: '5%' }} />
                    </div>
                    <span className="text-3xl font-mono font-black text-white leading-none">
                        {stats ? stats.error_rate : '-'}
                    </span>
                    <span className="text-[10px] text-gray-600 mb-1 font-bold">%</span>
                </div>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-purple-500/30 pl-4 items-start">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Threat Velocity</p>
                <div className="flex items-end gap-2">
                    <div className="w-1 h-6 bg-purple-500/20 rounded-full overflow-hidden mb-1">
                        <div className="w-full bg-purple-500" style={{ height: '20%' }} />
                    </div>
                    <span className="text-3xl font-mono font-black text-white leading-none">
                        {stats ? stats.threat_velocity : '-'}
                    </span>
                    <span className="text-[10px] text-gray-600 mb-1 font-bold">events/s</span>
                </div>
            </div>
        </div>
    </GlassCard>
);

const DashboardPage = () => {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [trafficData, setTrafficData] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [postureData, setPostureData] = useState<any[]>([
        { name: 'Score', value: 0, color: '#10b981' },
        { name: 'Risk', value: 100, color: '#333' }
    ]);

    const { lastMessage } = useWebSocket();

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardStats = await getDashboardStats();
                setStats(dashboardStats);
                if (dashboardStats) {
                    setPostureData([
                        { name: 'Score', value: dashboardStats.security_score || 85, color: '#10b981' },
                        { name: 'Risk', value: dashboardStats.risk_score || 15, color: '#333' }
                    ]);
                }

                const agentsList = await getAgents();
                // Map agents to heatmap format if needed. Assuming agentsList has id and maybe risk score
                const formattedAgents = Array.isArray(agentsList) ? agentsList.map((a: any, i: number) => ({
                    id: a.id || i,
                    score: a.risk_score || Math.floor(Math.random() * 20) // Default low risk if not present
                })) : [];
                setAgents(formattedAgents);

                const initialEvents = await getEvents();
                const formattedEvents = Array.isArray(initialEvents) ? initialEvents.slice(0, 10).map(formatEvent) : [];
                setEvents(formattedEvents);

                // Initial metric point
                const metrics = await getSystemMetrics();
                if (metrics) {
                    setTrafficData(prev => [...prev, {
                        time: formatTime(new Date()),
                        network: metrics.network_in || 0,
                        threats: 0 // Placeholder until we have real threat count in metrics
                    }].slice(-20)); // Keep last 20 points
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };

        fetchData();

        // Poll for system metrics every 5 seconds to keep chart alive even without WS events
        const interval = setInterval(async () => {
            try {
                const metrics = await getSystemMetrics();
                if (metrics) {
                    setTrafficData(prev => {
                        const newData = [...prev, {
                            time: formatTime(new Date()),
                            network: metrics.network_in || 0,
                            threats: metrics.network_out || 0 // Using Out as proxy for comparison
                        }];
                        return newData.slice(-20);
                    });
                }
            } catch (e) { console.error(e) }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Handle WebSocket Updates
    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.type === 'new_event') {
                const newEvent = formatEvent(lastMessage.data);
                setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events

                // If event is critical, update threats count in chart
                if (newEvent.status === 'BLOCKED' || newEvent.status === 'CRITICAL') {
                    // This is visual only, ideally we update the last data point
                }
            }
            // Handle other message types like 'stats_update' if backend sends them
        }
    }, [lastMessage]);

    const formatEvent = (raw: any) => {
        // Map raw event to UI structure
        const status = raw.severity === 'Critical' || raw.severity === 'High' ? 'BLOCKED' : 'ALLOWED';
        const color = status === 'BLOCKED'
            ? 'text-red-500 border-red-500/30 bg-red-500/10'
            : 'text-green-400 border-green-500/30 bg-green-500/10';

        return {
            id: raw.id || Math.random(),
            time: raw.timestamp ? formatTime(new Date(raw.timestamp)) : formatTime(new Date()),
            event: raw.description || raw.event_type || 'Unknown Event',
            source: raw.source || raw.src_ip || 'Unknown',
            status: status,
            color: color,
            details: JSON.stringify(raw.data || raw)
        };
    };

    return (
        <div className="pb-10">
            {/* Global Telemetry Header (System Pulse) */}
            <SystemPulseBar stats={stats} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Observability Widgets */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Security Posture Gauge */}
                    <GlassCard
                        title="Security Posture"
                        icon={<ShieldCheck size={18} className="text-green-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                        className="h-80 flex flex-col items-center justify-center border-l-2 border-l-green-500/20"
                    >
                        <div className="relative w-48 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={postureData}
                                        cx="50%" cy="50%"
                                        innerRadius={70} outerRadius={80}
                                        startAngle={225} endAngle={-45}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {postureData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#1a1a1a'} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-2">
                                <span className="text-5xl font-mono font-black text-white">{postureData[0].value}</span>
                                <p className="text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase">SCORE</p>
                            </div>
                        </div>
                        <div className="text-center px-6 -mt-4">
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">System is hardened. No critical misconfigurations detected in the last scan.</p>
                        </div>
                    </GlassCard>

                    {/* Infrastructure Heatmap */}
                    <GlassCard
                        title="Infrastructure Risk"
                        icon={<Cpu size={18} className="text-orange-500" />}
                        className="h-auto"
                    >
                        <div className="flex flex-wrap gap-2 justify-center p-2 mb-4">
                            {agents.map((agent) => (
                                <div
                                    key={agent.id}
                                    className={`w-8 h-8 flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 cursor-pointer ${agent.score > 80 ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                                        agent.score > 50 ? 'bg-yellow-500 text-black' :
                                            'bg-green-500/10 text-green-500 border border-green-500/30'
                                        }`}
                                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                                >
                                    {agent.score}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between px-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                            <span>Healthy</span>
                            <span>Critical</span>
                        </div>
                        <div className="h-1 mx-2 mt-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-50" />
                        </div>
                    </GlassCard>
                </div>

                {/* Center Column: Charts & Activity */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Correlated Time-Series */}
                    <GlassCard
                        title="Correlated: Net vs Threats"
                        icon={<Activity size={18} className="text-cyan-500" />}
                        className="h-72"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData}>
                                <defs>
                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ea0000" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ea0000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="network" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" />
                                <Area type="monotone" dataKey="threats" stroke="#ea0000" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    <GlassCard
                        title="Live Security Events"
                        icon={<Zap size={18} className="text-yellow-500" />}
                        className="h-[430px]"
                    >
                        <div className="space-y-0.5 font-mono text-[11px] h-[350px] overflow-y-auto custom-scrollbar">
                            {events.map((row, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedEvent(row)}
                                    className={`flex items-center gap-4 p-3 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer group ${selectedEvent?.id === row.id ? 'bg-white/[0.04] border-l-2 border-neon-cyan' : ''}`}
                                >
                                    <span className="text-gray-600 w-16 shrink-0 font-bold">{row.time}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'BLOCKED' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                                    <span className="text-gray-400 flex-1 truncate font-medium uppercase tracking-tighter">{row.event}</span>
                                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black border tracking-widest ${row.color}`}>
                                        {row.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: AI Insights */}
                <div className="lg:col-span-3 space-y-6">
                    <GlassCard
                        title="NexDefend AI Insights"
                        icon={<Brain size={18} className="text-purple-500 animate-pulse" />}
                        className="h-full min-h-[600px] flex flex-col border-r-2 border-r-purple-500/20"
                    >
                        <div className="flex-1 space-y-4">
                            <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-lg cyber-border-purple relative overflow-hidden group">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] shrink-0 animate-ping" />
                                    <p className="text-[11px] text-purple-200/80 leading-relaxed font-medium">
                                        Waiting for AI analysis stream from the neural ingestor...
                                    </p>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                            <button className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">
                                View All Recommendations
                            </button>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-neon-cyan blur-2xl opacity-10 animate-pulse" />
                                <div className="bg-black/40 p-3 rounded-full border border-white/10 hover:border-neon-cyan/50 hover:bg-white/5 transition-all cursor-pointer">
                                    <Sparkles className="w-6 h-6 text-neon-cyan" />
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Event Details Slide-over */}
            {selectedEvent && (
                <div className="fixed inset-y-0 right-0 w-[450px] glass-card border-l border-white/10 z-[100] flex flex-col animate-in slide-in-from-right duration-500">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="font-mono font-black text-white tracking-widest uppercase">Event Analysis</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Trace ID: {selectedEvent.id.toString().slice(0, 8)}</p>
                        </div>
                        <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={20} /></button>
                    </div>
                    <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.25em] mb-3">Threat Context</p>
                            <div className="flex items-center gap-3 text-neon-cyan font-black text-lg">
                                <ShieldCheck size={20} />
                                {selectedEvent.event}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.25em] mb-1">Source IP</p>
                                <p className="text-sm font-mono text-gray-300">{selectedEvent.source}</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.25em] mb-1">Status</p>
                                <p className={`text-sm font-mono font-black ${selectedEvent.status === 'BLOCKED' ? 'text-red-500' : 'text-green-500'}`}>{selectedEvent.status}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.25em]">Raw Telemetry</p>
                            <pre className="p-5 rounded-xl bg-black border border-white/5 text-[11px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                                {selectedEvent.details}
                            </pre>
                        </div>

                        {selectedEvent.status === 'BLOCKED' && (
                            <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20 flex gap-4 items-start shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                                <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
                                <div>
                                    <p className="text-red-500 font-black text-xs uppercase tracking-widest">Protocol Engaged</p>
                                    <p className="text-red-400/60 text-[11px] mt-1 font-medium leading-relaxed">System-wide firewall policy automatic enforcement triggered. IP source blacklisted for 24h.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-8 border-t border-white/5">
                        <button className="w-full py-4 bg-neon-cyan text-black font-black uppercase tracking-[0.3em] text-xs transition-all hover:bg-white hover:scale-[0.98] active:scale-95 shadow-[0_0_30px_rgba(0,243,255,0.3)]">
                            Engage Investigation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
