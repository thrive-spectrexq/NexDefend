import React, { useEffect, useState } from 'react';
import client from '@/api/client';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Brush } from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { ShieldAlert, Activity, Search, Filter } from 'lucide-react';

interface AlertData {
    id?: string | number;
    timestamp: string;
    severity: string;
    rule_name: string;
    source_ip: string;
    destination_ip: string;
    action: string;
    risk_score: number; // Added
    alert?: {
        signature?: string;
        severity?: string;
    };
    message?: string;
    [key: string]: unknown;
}

const AlertsPage: React.FC = () => {
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    // loading state intentionally kept for future use / suspense integration if needed,
    // but removing for now to fix build error as it is unused in render.
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await client.get('/alerts');
                const data = response.data;
                const rows = Array.isArray(data) ? data : (data?.hits || []);

                const mappedRows = rows.map((r: any) => {
                    const sev = r.severity || (r.alert?.severity ? 'high' : 'info');
                    // Mock Risk Score Calculation: (Severity * Asset Criticality)
                    // Criticality is random for now (0.5 - 1.5)
                    const baseScore = sev.toLowerCase().includes('critical') ? 90 : sev.toLowerCase().includes('high') ? 70 : 40;
                    const riskScore = r.risk_score || baseScore;

                    return {
                        ...r,
                        rule_name: r.rule_name || r.alert?.signature || r.message || 'Unknown Alert',
                        severity: sev,
                        risk_score: riskScore
                    };
                });

                setAlerts(mappedRows);
            } catch (err) {
                console.error("Failed to fetch alerts", err);
                setAlerts([]);
            } finally {
                // setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    // Aggregation for Sidebar
    const riskyEntities = Object.values(alerts.reduce((acc: any, curr) => {
        const ip = curr.source_ip;
        if (!acc[ip]) acc[ip] = { ip, count: 0, totalRisk: 0, maxSev: 'low' };
        acc[ip].count++;
        acc[ip].totalRisk += curr.risk_score || 0;
        // Simple severity update
        if (curr.severity === 'critical') acc[ip].maxSev = 'critical';
        else if (curr.severity === 'high' && acc[ip].maxSev !== 'critical') acc[ip].maxSev = 'high';

        return acc;
    }, {})).sort((a: any, b: any) => b.totalRisk - a.totalRisk).slice(0, 5);


    const timelineData = alerts.map((a, index) => ({
        time: new Date(a.timestamp).getHours() + (new Date(a.timestamp).getMinutes() / 60),
        severity: (String(a.severity).toLowerCase().includes('critical') || String(a.severity).toLowerCase().includes('high')) ? 3 : (String(a.severity).toLowerCase().includes('warning') || String(a.severity).toLowerCase().includes('medium')) ? 2 : 1,
        id: a.id || index
    }));

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Impact Analysis</h1>
                    <p className="text-gray-400">Risk-based alert prioritization and entity analysis.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" placeholder="Filter alerts..." className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500" />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Main Content: Chart + Table */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    {/* Timeline Chart */}
                    <GlassCard title="Alert Distribution (24h)" className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis type="number" dataKey="time" name="Hour" unit="h" domain={[0, 24]} stroke="#525252" fontSize={12} tickCount={12} />
                                <YAxis
                                    type="number"
                                    dataKey="severity"
                                    name="Severity"
                                    domain={[0, 4]}
                                    ticks={[1, 2, 3]}
                                    tickFormatter={(val) => val === 3 ? 'Critical' : val === 2 ? 'High' : 'Low'}
                                    stroke="#525252"
                                    fontSize={12}
                                    width={50}
                                />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                                <Scatter name="Alerts" data={timelineData} fill="#00D1FF">
                                    {timelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.severity === 3 ? '#ef4444' : entry.severity === 2 ? '#f97316' : '#3b82f6'} />
                                    ))}
                                </Scatter>
                                <Brush dataKey="time" height={30} stroke="#06b6d4" fill="#0c0c0e" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </GlassCard>

                    {/* Alerts Table */}
                    <GlassCard title="Recent Alerts" className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
                        <div className="overflow-x-auto flex-1 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 sticky top-0 z-10">
                                    <tr className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                                        <th className="py-3 px-4">Risk Score</th>
                                        <th className="py-3 px-4">Severity</th>
                                        <th className="py-3 px-4">Time</th>
                                        <th className="py-3 px-4 w-1/3">Rule Name</th>
                                        <th className="py-3 px-4">Source</th>
                                        <th className="py-3 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {alerts.map((alert, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-1 rounded-full ${alert.risk_score > 80 ? 'bg-red-500' : alert.risk_score > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                                    <span className="font-mono font-bold text-gray-300">{alert.risk_score}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${String(alert.severity).toLowerCase().includes('critical') ? 'bg-red-500/20 text-red-400' :
                                                        String(alert.severity).toLowerCase().includes('high') ? 'bg-orange-500/20 text-orange-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {alert.severity}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs font-mono">
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="py-3 px-4 text-white font-medium">{alert.rule_name}</td>
                                            <td className="py-3 px-4 text-gray-400 font-mono text-xs">{alert.source_ip}</td>
                                            <td className="py-3 px-4">
                                                <span className={alert.action === 'blocked' ? 'text-green-400' : 'text-gray-500'}>
                                                    {alert.action}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Sidebar: Top Risky Entities */}
                <div className="w-full lg:w-80 space-y-6 shrink-0">
                    <GlassCard title="Top Risky Entities" icon={<ShieldAlert size={16} className="text-red-400" />}>
                        <div className="space-y-4">
                            {riskyEntities.map((entity: any, i) => (
                                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-sm text-cyan-300 group-hover:text-cyan-200">{entity.ip}</span>
                                        <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded shadow-[0_0_8px_red]">
                                            RISK {Math.floor(entity.totalRisk / entity.count)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Activity size={12} />
                                        <span>{entity.count} Alerts</span>
                                        <span className="text-gray-700">|</span>
                                        <span className={entity.maxSev === 'critical' ? 'text-red-400' : 'text-orange-400'}>
                                            Max: {entity.maxSev.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
                                        <div
                                            className="bg-red-500 h-full"
                                            style={{ width: `${Math.min(100, (entity.totalRisk / 500) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {riskyEntities.length === 0 && <div className="text-center text-gray-500 py-4">No data available</div>}
                        </div>
                    </GlassCard>

                    <GlassCard title="Attack Vectors" className="h-64">
                        {/* Placeholder for Donut Chart or similar */}
                        <div className="flex items-center justify-center h-full text-gray-600 text-xs text-center">
                            Visualization <br /> Coming Soon
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default AlertsPage;
