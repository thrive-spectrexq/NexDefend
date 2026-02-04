import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Activity, FileText, Cpu, Network, Search, Filter, ShieldAlert } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const events = [
    { id: 1, time: '10:45:02', type: 'PROCESS_CREATE', process: 'powershell.exe', user: 'SYSTEM', status: 'Warning' },
    { id: 2, time: '10:45:01', type: 'FILE_ACCESS', path: '/etc/passwd', user: 'www-data', status: 'Blocked' },
    { id: 3, time: '10:44:55', type: 'NET_CONN', dest: '192.168.1.55:443', user: 'admin', status: 'Allowed' },
    { id: 4, time: '10:44:42', type: 'REG_MOD', key: 'HKLM\\...\\Run', user: 'updater', status: 'Allowed' },
    { id: 5, time: '10:44:30', type: 'PROCESS_TERM', process: 'chrome.exe', user: 'alice', status: 'Allowed' },
    { id: 6, time: '10:44:15', type: 'FILE_DELETE', path: '/tmp/scan_res.tmp', user: 'root', status: 'Allowed' },
    { id: 7, time: '10:44:05', type: 'NET_LISTEN', port: '8080', user: 'java', status: 'Allowed' },
    { id: 8, time: '10:43:50', type: 'AUTH_LOGIN', user: 'bob', source: 'ssh', status: 'Success' },
];

const topProcesses = [
    { name: 'chrome.exe', events: 450, color: '#3b82f6' },
    { name: 'node', events: 320, color: '#10b981' },
    { name: 'python3', events: 210, color: '#f59e0b' },
    { name: 'powershell', events: 180, color: '#ef4444' },
    { name: 'svchost', events: 150, color: '#8b5cf6' },
];

const ActivityMonitoringPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Activity Stream</h1>
                    <p className="text-gray-400">Granular endpoint telemetry and event tracing.</p>
                </div>
                <div className="flex gap-2">
                    <GlassCard className="px-3 py-1.5 flex items-center gap-2 text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Live
                    </GlassCard>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-4 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <p className="text-gray-500 text-xs uppercase font-bold">Process Events</p>
                        <Cpu size={16} className="text-blue-400"/>
                    </div>
                    <p className="text-2xl font-mono text-white">2,405<span className="text-xs text-gray-500 ml-1">/hr</span></p>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <p className="text-gray-500 text-xs uppercase font-bold">File Integrity</p>
                        <FileText size={16} className="text-yellow-400"/>
                    </div>
                    <p className="text-2xl font-mono text-white">856<span className="text-xs text-gray-500 ml-1">/hr</span></p>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <p className="text-gray-500 text-xs uppercase font-bold">Network Socket</p>
                        <Network size={16} className="text-purple-400"/>
                    </div>
                    <p className="text-2xl font-mono text-white">12.5K<span className="text-xs text-gray-500 ml-1">/hr</span></p>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col justify-between h-32 bg-red-500/5 border-red-500/20">
                    <div className="flex justify-between items-start">
                        <p className="text-red-400 text-xs uppercase font-bold">Blocked Ops</p>
                        <ShieldAlert size={16} className="text-red-500"/>
                    </div>
                    <p className="text-2xl font-mono text-red-400">42</p>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Processes Chart */}
                <div>
                    <GlassCard title="Top Noisiest Processes" icon={<Activity size={18} className="text-cyan-400"/>} className="h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProcesses} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={70} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                                <Bar dataKey="events" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topProcesses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>

                {/* Event Stream Table */}
                <div className="lg:col-span-2">
                    <GlassCard title="Live Endpoint Events" icon={<Activity size={18} />} className="h-[500px] flex flex-col">
                        <div className="flex gap-2 mb-4 px-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="text" placeholder="Search event data..." className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/50" />
                            </div>
                            <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white"><Filter size={16}/></button>
                        </div>

                        <div className="overflow-auto flex-1 px-4 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-xs text-gray-500 uppercase font-mono sticky top-0 bg-[#09090b]">
                                    <tr className="border-b border-white/10">
                                        <th className="py-2 w-24">Time</th>
                                        <th className="py-2 w-32">Type</th>
                                        <th className="py-2">Details</th>
                                        <th className="py-2 w-24">User</th>
                                        <th className="py-2 w-20 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-mono text-gray-300">
                                    {events.map((evt) => (
                                        <tr key={evt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-2.5 text-gray-500">{evt.time}</td>
                                            <td className="py-2.5">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                                    evt.type.includes('PROCESS') ? 'bg-blue-500/10 text-blue-400' :
                                                    evt.type.includes('FILE') ? 'bg-yellow-500/10 text-yellow-400' :
                                                    evt.type.includes('NET') ? 'bg-purple-500/10 text-purple-400' :
                                                    'bg-gray-500/10 text-gray-400'
                                                }`}>
                                                    {evt.type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-white truncate max-w-[200px]" title={evt.process || evt.path || evt.dest || evt.key}>
                                                {evt.process || evt.path || evt.dest || evt.key}
                                            </td>
                                            <td className="py-2.5 text-gray-400">{evt.user}</td>
                                            <td className="py-2.5 text-right">
                                                <span className={
                                                    evt.status === 'Blocked' ? 'text-red-400 font-bold' :
                                                    evt.status === 'Warning' ? 'text-orange-400' :
                                                    'text-green-400'
                                                }>{evt.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default ActivityMonitoringPage;
