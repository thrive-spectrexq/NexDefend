import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft,
    Monitor,
    Shield,
    Activity,
    Terminal,
    X,
    Maximize2,
    Minimize2,
    Network,
    Cpu,
    HardDrive,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [terminalLines, setTerminalLines] = useState<string[]>(['NexDefend Remote Shell v2.4.1', 'Connected to FIN-WS-004 (10.20.1.45)', 'Type "help" for commands.']);
    const [cmdInput, setCmdInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const [hostData, setHostData] = useState<any>(null);

    // Fetch real host metrics
    useEffect(() => {
        const fetchHostDetails = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/v1/host/details');
                if (res.ok) {
                    const json = await res.json();
                    setHostData(json);
                }
            } catch (e) {
                console.error("Failed to fetch host details", e);
            }
        };

        fetchHostDetails();
        const interval = setInterval(fetchHostDetails, 2000); // Fast poll for live chart
        return () => clearInterval(interval);
    }, []);

    // Fallback/Mock host data if API fails or for static fields not yet in API
    const host = {
        id,
        hostname: hostData?.hostname || 'FIN-WS-004',
        ip: hostData?.ip || '10.20.1.45',
        os: hostData?.os || 'Windows 11 Enterprise',
        kernel: hostData?.kernel || '10.0.22621', // Added kernel
        status: hostData?.status || 'Online',
        policy: 'Strict Audit',
        lastSeen: 'Just now',
        uptime: '4d 12h 32m',
        mac: '00:1B:44:11:3A:B7',
        agentVersion: 'v2.4.1'
    };

    useEffect(() => {
        if (isTerminalOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [terminalLines, isTerminalOpen]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = cmdInput.trim();
        if (!cmd) return;

        setTerminalLines(prev => [...prev, `C:\\Users\\Admin> ${cmd}`]);
        setCmdInput('');

        // Mock responses
        setTimeout(() => {
            let response = '';
            switch (cmd.toLowerCase()) {
                case 'help':
                    response = 'Available commands: ipconfig, ps, netstat, whoami, exit';
                    break;
                case 'whoami':
                    response = 'nt authority\\system';
                    break;
                case 'ipconfig':
                    response = 'Ethernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : 10.20.1.45\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0';
                    break;
                case 'ps':
                    response = 'PID   User     CPU    Command\n991   SYSTEM   0.5    nexdefend_agent.exe\n4521  j.doe    12.0   chrome.exe';
                    break;
                case 'exit':
                    setIsTerminalOpen(false);
                    return;
                default:
                    response = `'${cmd}' is not recognized as an internal or external command.`;
            }
            setTerminalLines(prev => [...prev, response]);
        }, 300);
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
                    <button
                        onClick={() => setIsTerminalOpen(true)}
                        className="px-4 py-2 bg-brand-blue text-background hover:bg-brand-blue/90 rounded transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                        <Terminal size={16} />
                        Remote Shell
                    </button>
                    <button className="px-4 py-2 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded hover:bg-brand-red/20 transition-colors text-sm font-semibold">
                        Isolate Host
                    </button>
                </div>
            </div>

            {/* Remote Shell Modal */}
            <AnimatePresence>
                {isTerminalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <div className={cn(
                            "bg-[#0D1117] border border-surface-highlight rounded-lg shadow-2xl flex flex-col overflow-hidden font-mono",
                            isMaximized ? "w-full h-full" : "w-[800px] h-[600px]"
                        )}>
                            <div className="flex items-center justify-between px-4 py-2 bg-surface-highlight/20 border-b border-surface-highlight select-none">
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <Terminal size={14} className="text-brand-green" />
                                    <span>root@FIN-WS-004:~</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:text-white text-text-muted transition-colors">
                                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                    </button>
                                    <button onClick={() => setIsTerminalOpen(false)} className="p-1 hover:text-brand-red text-text-muted transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                            <div
                                className="flex-1 p-4 overflow-y-auto text-sm"
                                onClick={() => document.getElementById('terminal-input')?.focus()}
                            >
                                {terminalLines.map((line, i) => (
                                    <div key={i} className="whitespace-pre-wrap text-[#c9d1d9] mb-1">{line}</div>
                                ))}
                                <form onSubmit={handleCommand} className="flex gap-2 text-[#c9d1d9]">
                                    <span className="text-brand-green">➜</span>
                                    <span className="text-brand-blue">~</span>
                                    <input
                                        id="terminal-input"
                                        type="text"
                                        value={cmdInput}
                                        onChange={(e) => setCmdInput(e.target.value)}
                                        className="bg-transparent border-none outline-none flex-1 font-inherit text-[#c9d1d9]"
                                        autoFocus
                                        autoComplete="off"
                                    />
                                </form>
                                <div ref={bottomRef} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Info Card */}
                <div className="bg-surface border border-surface-highlight rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                        <Info size={18} className="text-brand-blue" />
                        Device Details
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                            <Monitor className="text-text-muted" size={16} />
                            <div>
                                <div className="text-text-muted text-xs">Operating System</div>
                                <div className="text-text font-medium">{host.os}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Cpu className="text-text-muted" size={16} />
                            <div>
                                <div className="text-text-muted text-xs">Kernel / Build</div>
                                <div className="text-text font-medium">{host.kernel}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="text-text-muted" size={16} />
                            <div>
                                <div className="text-text-muted text-xs">Agent Version</div>
                                <div className="text-text font-medium">{host.agentVersion}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Network className="text-text-muted" size={16} />
                            <div>
                                <div className="text-text-muted text-xs">MAC Address</div>
                                <div className="text-text font-mono">{host.mac}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <HardDrive className="text-text-muted" size={16} />
                            <div>
                                <div className="text-text-muted text-xs">Disk Encryption</div>
                                <div className="text-brand-green font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                                    BitLocker Enabled
                                </div>
                            </div>
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
                            <AreaChart data={hostData?.history || mockPerformanceData}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#162032', borderColor: '#1E293B' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="cpu" stroke="#38BDF8" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                                <Area type="monotone" dataKey="memory" stroke="#818CF8" fillOpacity={1} fill="url(#colorMem)" name="Memory %" />
                                {/* Normalize net_recv roughly for visualization or just show it */}
                                <Area type="monotone" dataKey="net_recv" stroke="#34D399" fillOpacity={0.5} fill="url(#colorNet)" name="Net Recv (KB/s)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Processes & Network */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Real Processes Table */}
                <div className="bg-surface border border-surface-highlight rounded-lg p-6">
                     <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                        <Terminal size={18} className="text-text-muted" />
                        Running Processes (Top CPU)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-text-muted font-mono bg-surface-highlight/20">
                                <tr>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">PID</th>
                                    <th className="p-2">User</th>
                                    <th className="p-2 text-right">CPU %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-highlight font-mono">
                                {(hostData?.processes || []).slice(0, 5).map((proc: any) => (
                                    <tr key={proc.pid} className="hover:bg-surface-highlight/10">
                                        <td className="p-2 text-text truncate max-w-[120px]" title={proc.name}>{proc.name}</td>
                                        <td className="p-2 text-text-muted">{proc.pid}</td>
                                        <td className="p-2 text-text-muted truncate max-w-[80px]" title={proc.user}>{proc.user}</td>
                                        <td className="p-2 text-text-muted text-right">{proc.cpu.toFixed(1)}%</td>
                                    </tr>
                                ))}
                                {(!hostData?.processes || hostData.processes.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-text-muted">Loading processes...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Real Network Connections Table */}
                <div className="bg-surface border border-surface-highlight rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                        <Network size={18} className="text-brand-blue" />
                        Active Network Connections
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-text-muted font-mono bg-surface-highlight/20">
                                <tr>
                                    <th className="p-2">Proto</th>
                                    <th className="p-2">Local</th>
                                    <th className="p-2">Remote</th>
                                    <th className="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-highlight font-mono">
                                {(hostData?.connections || []).slice(0, 5).map((conn: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-surface-highlight/10">
                                        <td className="p-2 text-text-muted">
                                            {conn.type === 1 ? 'TCP' : conn.type === 2 ? 'UDP' : 'UNK'}
                                        </td>
                                        <td className="p-2 text-text truncate max-w-[120px]" title={`${conn.local_ip}:${conn.local_port}`}>
                                            {conn.local_ip}:{conn.local_port}
                                        </td>
                                        <td className="p-2 text-text-muted truncate max-w-[120px]" title={`${conn.remote_ip}:${conn.remote_port}`}>
                                            {conn.remote_ip}:{conn.remote_port}
                                        </td>
                                        <td className="p-2 text-xs text-brand-green">
                                            {conn.status}
                                        </td>
                                    </tr>
                                ))}
                                {(!hostData?.connections || hostData.connections.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-text-muted">No active connections (or loading)...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
