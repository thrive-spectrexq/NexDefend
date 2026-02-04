import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { ShieldAlert, Bug, Activity, Search, RefreshCw, Zap } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import client from '../api/client';

interface Vulnerability {
    id: string;
    cve: string;
    severity: string;
    status: string;
    discovered_at: string;
}

const exploitabilityData = [
    { name: 'Exploitable', value: 25, color: '#ef4444' },
    { name: 'No Known Exploit', value: 75, color: '#3b82f6' },
];

const vulnAgeData = [
    { range: '< 7 days', count: 45 },
    { range: '7-30 days', count: 30 },
    { range: '30-90 days', count: 15 },
    { range: '> 90 days', count: 5 },
];

const patchVelocityData = [
    { week: 'W1', new: 12, patched: 10 },
    { week: 'W2', new: 15, patched: 14 },
    { week: 'W3', new: 8, patched: 12 },
    { week: 'W4', new: 20, patched: 18 },
    { week: 'W5', new: 5, patched: 8 },
];

const VulnerabilitiesPage: React.FC = () => {
    const [vulns, setVulns] = useState<Vulnerability[]>([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        const fetchVulns = async () => {
            try {
                // Race condition trick for demo speed
                const result = await Promise.race([
                    client.get('/vulnerabilities'),
                    new Promise((_, reject) => setTimeout(() => reject('timeout'), 1000))
                ]);
                setVulns((result as any).data);
            } catch {
                // Mock
                setVulns([
                    { id: '1', cve: 'CVE-2023-44487', severity: 'High', status: 'Open', discovered_at: '2023-10-10' },
                    { id: '2', cve: 'CVE-2023-38545', severity: 'Critical', status: 'Open', discovered_at: '2023-10-11' },
                    { id: '3', cve: 'CVE-2023-29325', severity: 'Medium', status: 'Patched', discovered_at: '2023-09-15' },
                    { id: '4', cve: 'CVE-2021-44228', severity: 'Critical', status: 'Open', discovered_at: '2021-12-10' },
                    { id: '5', cve: 'CVE-2022-22965', severity: 'High', status: 'Mitigated', discovered_at: '2022-03-29' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchVulns();
    }, []);

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Vulnerability Management</h1>
                    <p className="text-gray-400">Continuous scanning, prioritization, and remediation of software flaws.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                         <Search className="absolute left-3 top-2.5 text-gray-500" size={16}/>
                         <input type="text" placeholder="Search CVEs..." className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-cyan-500 outline-none w-64" />
                    </div>
                    <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono text-sm border border-cyan-500/30 flex items-center gap-2">
                        <RefreshCw size={16}/> New Scan
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="flex flex-col justify-center border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="text-red-500" size={20} />
                        <span className="text-gray-400 text-xs font-bold uppercase">Critical Vulns</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">2</div>
                </GlassCard>
                <GlassCard className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Bug className="text-orange-400" size={20} />
                        <span className="text-gray-400 text-xs font-bold uppercase">Total Open</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">45</div>
                </GlassCard>
                 <GlassCard className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="text-yellow-400" size={20} />
                        <span className="text-gray-400 text-xs font-bold uppercase">Exploitable</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">12</div>
                </GlassCard>
                <GlassCard className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="text-green-400" size={20} />
                        <span className="text-gray-400 text-xs font-bold uppercase">Patch Rate</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">88%</div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Exploitability Donut */}
                <GlassCard title="Exploitability Context" className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={exploitabilityData}
                                cx="50%" cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {exploitabilityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            <Legend verticalAlign="middle" align="right" layout="vertical"/>
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Patch Velocity */}
                <div className="lg:col-span-2">
                    <GlassCard title="Patch Velocity (New vs Fixed)" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={patchVelocityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="week" stroke="#525252" fontSize={10} />
                                <YAxis stroke="#525252" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                                <Legend />
                                <Line type="monotone" dataKey="new" stroke="#ef4444" strokeWidth={2} name="New Vulns" />
                                <Line type="monotone" dataKey="patched" stroke="#10b981" strokeWidth={2} name="Patched" />
                            </LineChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Vulnerability Age */}
                 <GlassCard title="Vulnerability Age Distribution" className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={vulnAgeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false}/>
                            <XAxis dataKey="range" stroke="#525252" fontSize={10} />
                            <YAxis stroke="#525252" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Bar dataKey="count" fill="#3b82f6" barSize={30}>
                                {vulnAgeData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={index > 2 ? '#ef4444' : index > 1 ? '#f59e0b' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </GlassCard>

                 {/* Vuln List */}
                 <div className="lg:col-span-2">
                     <GlassCard title="Recent Vulnerabilities" className="h-[350px] overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 sticky top-0">
                                    <tr className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                                        <th className="p-3">CVE ID</th>
                                        <th className="p-3">Severity</th>
                                        <th className="p-3">Discovered</th>
                                        <th className="p-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-mono text-gray-300">
                                    {vulns.map((v) => (
                                        <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3 text-cyan-400 font-bold">{v.cve}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    v.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                                    v.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {v.severity}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-400">{v.discovered_at}</td>
                                            <td className="p-3 text-right">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                    v.status === 'Open' ? 'border-red-500/30 text-red-400' : 'border-green-500/30 text-green-400'
                                                }`}>
                                                    {v.status}
                                                </span>
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

export default VulnerabilitiesPage;
