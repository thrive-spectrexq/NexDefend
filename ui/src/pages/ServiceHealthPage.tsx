import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Activity, Database, Server, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const ServiceHealthPage: React.FC = () => {
    const [latencyData, setLatencyData] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);

    useEffect(() => {
        // Future: fetch from API
        setLatencyData([]);
        setServices([]);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Application Services</h1>
                    <p className="text-gray-400">Microservices health, latency, and error tracking.</p>
                </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-green-500">
                    <div className="p-3 rounded-full bg-green-500/10 text-green-400"><CheckCircle size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-400">Healthy Services</p>
                        <p className="text-2xl font-bold text-white">0/0</p>
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-yellow-500">
                    <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-400"><AlertTriangle size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-400">Degraded Performance</p>
                        <p className="text-2xl font-bold text-white">0</p>
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-red-500">
                    <div className="p-3 rounded-full bg-red-500/10 text-red-400"><XCircle size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-400">Critical Failures</p>
                        <p className="text-2xl font-bold text-white">0</p>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latency Chart */}
                <div className="lg:col-span-2">
                    <GlassCard title="Service Latency (Real-time)" icon={<Activity size={18} className="text-blue-400" />} className="h-[350px]">
                        {latencyData.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-500">No Latency Data</div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#525252" fontSize={10} />
                                <YAxis stroke="#525252" fontSize={10} unit="ms" />
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                                <Area type="monotone" dataKey="api" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApi)" name="API Gateway" />
                                <Area type="monotone" dataKey="db" stroke="#10b981" fillOpacity={1} fill="url(#colorDb)" name="Database" />
                            </AreaChart>
                        </ResponsiveContainer>
                        )}
                    </GlassCard>
                </div>

                {/* Dependency Health */}
                <div>
                    <GlassCard title="Core Dependencies" icon={<Database size={18} className="text-purple-400" />} className="h-[350px]">
                        <div className="space-y-4 pt-2">
                            {/* Static placeholders removed or replaced with empty state if desired, but these are informative UI structure. I will leave them or comment them out. The user asked to remove mock data. I will remove the hardcoded status and replace with "Checking..." or remove them. I'll remove them. */}
                            <div className="flex justify-center items-center h-full text-gray-500 pt-10">No Dependencies Monitored</div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Services Grid */}
            <GlassCard title="Microservices Status" icon={<Server size={18} />}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-xs text-gray-500 uppercase font-mono">
                            <tr>
                                <th className="p-3">Service</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Latency</th>
                                <th className="p-3">Error Rate</th>
                                <th className="p-3">Uptime</th>
                                <th className="p-3 text-right">Health</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-mono text-gray-300">
                            {services.length === 0 ? (
                                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No Services Found</td></tr>
                            ) : services.map((svc, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-3 text-white font-bold">{svc.name}</td>
                                    <td className="p-3 text-xs text-gray-500 uppercase">{svc.type}</td>
                                    <td className="p-3 text-cyan-300">{svc.latency}</td>
                                    <td className={`p-3 ${parseFloat(svc.errorRate) > 1 ? 'text-red-400' : 'text-green-400'}`}>{svc.errorRate}</td>
                                    <td className="p-3 text-gray-400">{svc.uptime}</td>
                                    <td className="p-3 text-right">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${svc.status === 'Healthy' ? 'bg-green-500/10 text-green-400' :
                                                svc.status === 'Degraded' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-red-500/10 text-red-400'
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

export default ServiceHealthPage;
