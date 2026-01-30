import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Activity, Database, Server, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const latencyData = Array.from({ length: 20 }, (_, i) => ({
    time: `${i*5}s`,
    api: Math.random() * 50 + 20,
    db: Math.random() * 30 + 10,
}));

const services = [
    { name: 'Authentication Service', status: 'Healthy', latency: '45ms', errorRate: '0.01%', uptime: '99.99%', type: 'API' },
    { name: 'Data Ingestion Pipeline', status: 'Degraded', latency: '250ms', errorRate: '2.5%', uptime: '98.5%', type: 'Worker' },
    { name: 'AI Analysis Engine', status: 'Healthy', latency: '120ms', errorRate: '0.00%', uptime: '99.9%', type: 'ML Model' },
    { name: 'Notification Service', status: 'Healthy', latency: '30ms', errorRate: '0.05%', uptime: '99.95%', type: 'Worker' },
    { name: 'Report Generator', status: 'Down', latency: '-', errorRate: '100%', uptime: '95.0%', type: 'Worker' },
];

const ServiceHealthPage: React.FC = () => {
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
                    <div className="p-3 rounded-full bg-green-500/10 text-green-400"><CheckCircle size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-400">Healthy Services</p>
                        <p className="text-2xl font-bold text-white">18/22</p>
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-yellow-500">
                    <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-400"><AlertTriangle size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-400">Degraded Performance</p>
                        <p className="text-2xl font-bold text-white">3</p>
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-red-500">
                    <div className="p-3 rounded-full bg-red-500/10 text-red-400"><XCircle size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-400">Critical Failures</p>
                        <p className="text-2xl font-bold text-white">1</p>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latency Chart */}
                <div className="lg:col-span-2">
                    <GlassCard title="Service Latency (Real-time)" icon={<Activity size={18} className="text-blue-400"/>} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#525252" fontSize={10} />
                                <YAxis stroke="#525252" fontSize={10} unit="ms"/>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                                <Area type="monotone" dataKey="api" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApi)" name="API Gateway" />
                                <Area type="monotone" dataKey="db" stroke="#10b981" fillOpacity={1} fill="url(#colorDb)" name="Database" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>

                {/* Dependency Health */}
                <div>
                    <GlassCard title="Core Dependencies" icon={<Database size={18} className="text-purple-400"/>} className="h-[350px]">
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between p-3 rounded bg-white/5">
                                <div className="flex items-center gap-3">
                                    <Database size={16} className="text-blue-400"/>
                                    <span className="text-sm text-gray-300">PostgreSQL Primary</span>
                                </div>
                                <span className="text-xs font-bold text-green-400">ONLINE</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-white/5">
                                <div className="flex items-center gap-3">
                                    <Activity size={16} className="text-red-400"/>
                                    <span className="text-sm text-gray-300">Redis Cache</span>
                                </div>
                                <span className="text-xs font-bold text-red-400">OFFLINE</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-white/5">
                                <div className="flex items-center gap-3">
                                    <Server size={16} className="text-orange-400"/>
                                    <span className="text-sm text-gray-300">Kafka Broker</span>
                                </div>
                                <span className="text-xs font-bold text-yellow-400">HIGH LAG</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded bg-white/5">
                                <div className="flex items-center gap-3">
                                    <Globe size={16} className="text-cyan-400"/>
                                    <span className="text-sm text-gray-300">External Threat Feed</span>
                                </div>
                                <span className="text-xs font-bold text-green-400">CONNECTED</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Services Grid */}
            <GlassCard title="Microservices Status" icon={<Server size={18}/>}>
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
                            {services.map((svc, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-3 text-white font-bold">{svc.name}</td>
                                    <td className="p-3 text-xs text-gray-500 uppercase">{svc.type}</td>
                                    <td className="p-3 text-cyan-300">{svc.latency}</td>
                                    <td className={`p-3 ${parseFloat(svc.errorRate) > 1 ? 'text-red-400' : 'text-green-400'}`}>{svc.errorRate}</td>
                                    <td className="p-3 text-gray-400">{svc.uptime}</td>
                                    <td className="p-3 text-right">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            svc.status === 'Healthy' ? 'bg-green-500/10 text-green-400' :
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

// Missing Import Fix
import { Globe } from 'lucide-react';

export default ServiceHealthPage;
