import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Monitor,
    Shield,
    Activity,
    Terminal,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const mockPerformanceData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    cpu: Math.floor(Math.random() * 40) + 10,
    memory: Math.floor(Math.random() * 30) + 40,
}));

export default function HostDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock host data based on ID (normally fetched from API)
    const host = {
        id,
        hostname: 'FIN-WS-004',
        ip: '10.20.1.45',
        os: 'Windows 11 Enterprise',
        status: 'Online',
        policy: 'Strict Audit',
        lastSeen: 'Just now',
        uptime: '4d 12h 32m',
        mac: '00:1B:44:11:3A:B7',
        agentVersion: 'v2.4.1'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-7xl mx-auto"
        >
            {/* Header / Back */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-surface-highlight rounded-lg transition-colors text-text-muted hover:text-text"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-text flex items-center gap-3">
                        <Monitor className="text-brand-blue" />
                        {host.hostname}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-text-muted mt-1 font-mono">
                        <span>{host.ip}</span>
                        <span className="w-1 h-1 bg-surface-highlight rounded-full" />
                        <span>{host.os}</span>
                        <span className="w-1 h-1 bg-surface-highlight rounded-full" />
                        <span className="text-brand-green flex items-center gap-1">
                            <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
                            {host.status}
                        </span>
                    </div>
                </div>
                <div className="ml-auto flex gap-3">
                    <button className="px-4 py-2 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded hover:bg-brand-red/20 transition-colors text-sm font-semibold">
                        Isolate Host
                    </button>
                    <button className="px-4 py-2 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded hover:bg-brand-blue/20 transition-colors text-sm font-semibold">
                        Request Scan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Info Card */}
                <div className="bg-surface border border-surface-highlight rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-brand-blue" />
                        System Information
                    </h3>
                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex justify-between border-b border-surface-highlight pb-2">
                            <span className="text-text-muted">Agent ID</span>
                            <span className="text-text">{id}</span>
                        </div>
                        <div className="flex justify-between border-b border-surface-highlight pb-2">
                            <span className="text-text-muted">Policy Group</span>
                            <span className="text-text">{host.policy}</span>
                        </div>
                        <div className="flex justify-between border-b border-surface-highlight pb-2">
                            <span className="text-text-muted">Agent Version</span>
                            <span className="text-text">{host.agentVersion}</span>
                        </div>
                        <div className="flex justify-between border-b border-surface-highlight pb-2">
                            <span className="text-text-muted">Uptime</span>
                            <span className="text-text">{host.uptime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">MAC Address</span>
                            <span className="text-text">{host.mac}</span>
                        </div>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-surface border border-surface-highlight rounded-lg p-6 lg:col-span-2 flex flex-col">
                    <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-brand-green" />
                        Resource Usage (Live)
                    </h3>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockPerformanceData}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#162032', borderColor: '#1E293B' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="cpu" stroke="#38BDF8" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                                <Area type="monotone" dataKey="memory" stroke="#818CF8" fillOpacity={1} fill="url(#colorMem)" name="Memory %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Processes & Network */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface border border-surface-highlight rounded-lg p-6">
                     <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                        <Terminal size={18} className="text-text-muted" />
                        Running Processes (Top 5)
                    </h3>
                    <table className="w-full text-left text-sm">
                        <thead className="text-text-muted font-mono bg-surface-highlight/20">
                            <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">PID</th>
                                <th className="p-2">User</th>
                                <th className="p-2 text-right">CPU</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-highlight font-mono">
                            {[
                                { name: 'chrome.exe', pid: 4521, user: 'j.doe', cpu: '12%' },
                                { name: 'slack.exe', pid: 1102, user: 'j.doe', cpu: '4%' },
                                { name: 'nexdefend_agent.exe', pid: 991, user: 'SYSTEM', cpu: '2%' },
                                { name: 'explorer.exe', pid: 3442, user: 'j.doe', cpu: '1%' },
                                { name: 'svchost.exe', pid: 882, user: 'SYSTEM', cpu: '0.5%' },
                            ].map((proc) => (
                                <tr key={proc.pid} className="hover:bg-surface-highlight/10">
                                    <td className="p-2 text-text">{proc.name}</td>
                                    <td className="p-2 text-text-muted">{proc.pid}</td>
                                    <td className="p-2 text-text-muted">{proc.user}</td>
                                    <td className="p-2 text-text-muted text-right">{proc.cpu}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-surface border border-surface-highlight rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-brand-orange" />
                        Recent Alerts
                    </h3>
                    <div className="space-y-3">
                         {[
                            { id: 'DET-1024', title: 'Ransomware Attempt Blocked', time: '2 mins ago', severity: 'Critical' },
                            { id: 'DET-1001', title: 'Unusual PowerShell Argument', time: '4 hours ago', severity: 'Medium' },
                            { id: 'DET-0992', title: 'Port Scanning Detected', time: '1 day ago', severity: 'Low' },
                        ].map((alert) => (
                            <div key={alert.id} className="flex items-center gap-3 p-3 rounded bg-surface-highlight/10 border border-surface-highlight/50 hover:border-brand-blue/30 transition-colors cursor-pointer">
                                <div className={cn("w-2 h-2 rounded-full",
                                    alert.severity === 'Critical' ? 'bg-brand-red' :
                                    alert.severity === 'Medium' ? 'bg-brand-blue' : 'bg-brand-green'
                                )} />
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-text">{alert.title}</div>
                                    <div className="text-xs text-text-muted font-mono">{alert.id} • {alert.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
