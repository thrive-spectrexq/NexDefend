import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Server, HardDrive, Activity, Clock } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { ResourceGauge } from '../components/dashboard/ResourceGauge';

const loadHistory = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    load1: Math.random() * 2 + 0.5,
    load5: Math.random() * 2 + 0.4,
    load15: Math.random() * 2 + 0.3,
}));

const memoryHistory = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    used: Math.floor(Math.random() * 4000) + 2000,
    total: 8192
}));

const services = [
    { name: 'nexdefend-api.service', status: 'active', uptime: '12d 4h', pid: 1042 },
    { name: 'nexdefend-soar.service', status: 'active', uptime: '12d 4h', pid: 1045 },
    { name: 'postgresql.service', status: 'active', uptime: '45d 2h', pid: 890 },
    { name: 'kafka.service', status: 'active', uptime: '5d 1h', pid: 2021 },
    { name: 'nginx.service', status: 'active', uptime: '2d 8h', pid: 3044 },
    { name: 'fluent-bit.service', status: 'failed', uptime: '-', pid: '-' },
];

const SystemHealthPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Health</h1>
                    <p className="text-gray-400">Infrastructure performance and resource utilization.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs font-mono">
                    <Clock size={14} className="text-cyan-400"/> Uptime: 45 days, 12:04:32
                </div>
            </div>

            {/* Gauges Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <GlassCard className="flex flex-col items-center justify-center p-4 h-48">
                    <ResourceGauge value={42} label="CPU Usage" />
                    <div className="mt-2 text-xs text-gray-500">8 Cores Active</div>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center p-4 h-48">
                    <ResourceGauge value={68} label="Memory" color="#8b5cf6" />
                    <div className="mt-2 text-xs text-gray-500">12GB / 16GB</div>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center p-4 h-48">
                    <ResourceGauge value={25} label="Disk I/O" color="#f59e0b" />
                    <div className="mt-2 text-xs text-gray-500">Read: 45MB/s</div>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center p-4 h-48">
                    <ResourceGauge value={12} label="Network" color="#10b981" />
                    <div className="mt-2 text-xs text-gray-500">Eth0: 1Gbps</div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Load History */}
                <GlassCard title="System Load Average (24h)" icon={<Activity size={18} className="text-cyan-400"/>} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={loadHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="time" stroke="#525252" fontSize={10} />
                            <YAxis stroke="#525252" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            <Line type="monotone" dataKey="load1" stroke="#3b82f6" dot={false} strokeWidth={2} name="1 min" />
                            <Line type="monotone" dataKey="load5" stroke="#8b5cf6" dot={false} strokeWidth={2} name="5 min" />
                            <Line type="monotone" dataKey="load15" stroke="#10b981" dot={false} strokeWidth={2} name="15 min" />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Memory Usage Area */}
                <GlassCard title="Memory Utilization" icon={<HardDrive size={18} className="text-purple-400"/>} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={memoryHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="time" stroke="#525252" fontSize={10} />
                            <YAxis stroke="#525252" fontSize={10} tickFormatter={(v) => `${v/1024}GB`} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            <Area type="monotone" dataKey="used" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMem)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Service Status Table */}
            <GlassCard title="System Services Status" icon={<Server size={18}/>}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-xs text-gray-500 uppercase font-mono">
                            <tr>
                                <th className="p-3">Service Name</th>
                                <th className="p-3">PID</th>
                                <th className="p-3">Uptime</th>
                                <th className="p-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-mono text-gray-300">
                            {services.map((svc, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-3 text-white font-medium">{svc.name}</td>
                                    <td className="p-3 text-gray-500">{svc.pid}</td>
                                    <td className="p-3 text-gray-400">{svc.uptime}</td>
                                    <td className="p-3 text-right">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            svc.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {svc.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default SystemHealthPage;
