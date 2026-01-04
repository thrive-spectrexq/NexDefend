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
    Info,
    List,
    BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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

    // Tab State
    const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'network'>('overview');

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

            {/* Tabs */}
            <div className="flex border-b border-surface-highlight mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2",
                        activeTab === 'overview' ? "border-brand-blue text-brand-blue" : "border-transparent text-text-muted hover:text-text"
                    )}
                >
                    <Activity size={16} />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('processes')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2",
                        activeTab === 'processes' ? "border-brand-blue text-brand-blue" : "border-transparent text-text-muted hover:text-text"
                    )}
                >
                    <List size={16} />
                    Processes
                </button>
                <button
                    onClick={() => setActiveTab('network')}
                    className={cn(
                        "px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2",
                        activeTab === 'network' ? "border-brand-blue text-brand-blue" : "border-transparent text-text-muted hover:text-text"
                    )}
                >
                    <Network size={16} />
                    Network
                </button>
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                        <BarChart3 size={18} className="text-brand-green" />
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
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
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
            )}

            {/* Processes Tab Content */}
            {activeTab === 'processes' && (
                <div className="bg-surface border border-surface-highlight rounded-lg p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                            <List size={18} className="text-text-muted" />
                            Running Processes ({hostData?.processes?.length || 0})
                        </h3>
                        <input
                            type="text"
                            placeholder="Filter processes..."
                            className="bg-background border border-surface-highlight rounded px-3 py-1 text-sm text-text outline-none focus:border-brand-blue"
                        />
                    </div>
                    <div className="overflow-auto border border-surface-highlight rounded-lg max-h-[600px]">
                        <table className="w-full text-left text-sm relative">
                            <thead className="text-text-muted font-mono bg-surface-highlight/20 sticky top-0 backdrop-blur z-10">
                                <tr>
                                    <th className="p-3 border-b border-surface-highlight">Name</th>
                                    <th className="p-3 border-b border-surface-highlight w-24">PID</th>
                                    <th className="p-3 border-b border-surface-highlight w-32">Status</th>
                                    <th className="p-3 border-b border-surface-highlight w-32">User</th>
                                    <th className="p-3 border-b border-surface-highlight w-24 text-right">CPU</th>
                                    <th className="p-3 border-b border-surface-highlight w-32 text-right">Memory</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-highlight font-mono">
                                {(hostData?.processes || []).map((proc: any) => (
                                    <tr key={proc.pid} className="hover:bg-surface-highlight/10">
                                        <td className="p-3 text-text font-medium">{proc.name}</td>
                                        <td className="p-3 text-text-muted">{proc.pid}</td>
                                        <td className="p-3 text-text-muted">{proc.status || 'Running'}</td>
                                        <td className="p-3 text-text-muted">{proc.user}</td>
                                        <td className={cn("p-3 text-right font-bold", proc.cpu > 10 ? "text-brand-orange" : "text-text-muted")}>
                                            {proc.cpu.toFixed(1)}%
                                        </td>
                                        <td className="p-3 text-right text-text-muted">
                                            {(proc.memory / 1024 / 1024).toFixed(1)} MB
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Network Tab Content */}
            {activeTab === 'network' && (
                <div className="bg-surface border border-surface-highlight rounded-lg p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                        <Network size={18} className="text-brand-blue" />
                        Active Network Connections
                    </h3>
                    <div className="overflow-auto border border-surface-highlight rounded-lg max-h-[600px]">
                        <table className="w-full text-left text-sm relative">
                            <thead className="text-text-muted font-mono bg-surface-highlight/20 sticky top-0 backdrop-blur z-10">
                                <tr>
                                    <th className="p-3 border-b border-surface-highlight">Protocol</th>
                                    <th className="p-3 border-b border-surface-highlight">Local Address</th>
                                    <th className="p-3 border-b border-surface-highlight">Remote Address</th>
                                    <th className="p-3 border-b border-surface-highlight">Status</th>
                                    <th className="p-3 border-b border-surface-highlight">PID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-highlight font-mono">
                                {(hostData?.connections || []).map((conn: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-surface-highlight/10">
                                        <td className="p-3 text-text-muted uppercase">
                                            {conn.type === 1 ? 'TCP' : conn.type === 2 ? 'UDP' : 'UNK'}
                                        </td>
                                        <td className="p-3 text-text">{conn.local_ip}:{conn.local_port}</td>
                                        <td className="p-3 text-text-muted">{conn.remote_ip}:{conn.remote_port}</td>
                                        <td className="p-3 text-brand-green font-medium">{conn.status}</td>
                                        <td className="p-3 text-text-muted">{conn.fd}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
