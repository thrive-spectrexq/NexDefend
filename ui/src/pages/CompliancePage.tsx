import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { ShieldCheck, FileText, CheckCircle, AlertOctagon, RefreshCw, Download } from 'lucide-react';
import {
    RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';

const CompliancePage: React.FC = () => {
    const [frameworkData, setFrameworkData] = useState<any[]>([]);
    const [gapAnalysisData, setGapAnalysisData] = useState<any[]>([]);
    const [auditHistory, setAuditHistory] = useState<any[]>([]);
    const [criticalFailures, setCriticalFailures] = useState<any[]>([]);

    useEffect(() => {
        // Future: fetch from API
        setFrameworkData([]);
        setGapAnalysisData([]);
        setAuditHistory([]);
        setCriticalFailures([]);
    }, []);

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">GRC & Compliance</h1>
                    <p className="text-gray-400">Automated governance, risk management, and regulatory compliance adherence.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm border border-white/10 flex items-center gap-2">
                        <Download size={16}/> Export Report
                    </button>
                    <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono text-sm border border-cyan-500/30 flex items-center gap-2">
                        <RefreshCw size={16}/> Run Audit
                    </button>
                </div>
            </div>

            {/* Framework Score Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radial Chart: Overall Adherence */}
                <GlassCard title="Framework Adherence" className="h-[300px] relative">
                    {frameworkData.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-gray-500">No Framework Data</div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" barSize={15} data={frameworkData}>
                            <RadialBar
                                label={{ position: 'insideStart', fill: '#fff' }}
                                background
                                dataKey="uv"
                            />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#fff', fontSize: '11px' }}/>
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} cursor={false} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    )}
                </GlassCard>

                {/* Audit Timeline */}
                <GlassCard title="Audit Score Trend (6 Mo)" icon={<FileText className="text-cyan-400"/>} className="h-[300px]">
                     {auditHistory.length === 0 ? (
                         <div className="flex justify-center items-center h-full text-gray-500">No Audit History</div>
                     ) : (
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={auditHistory} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="month" stroke="#525252" fontSize={10} />
                            <YAxis domain={[0, 100]} stroke="#525252" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            <Line type="stepAfter" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{r:4, fill:'#10b981'}} />
                        </LineChart>
                    </ResponsiveContainer>
                     )}
                </GlassCard>

                 {/* Quick Stats */}
                 <div className="grid grid-cols-1 gap-4">
                     <GlassCard className="flex flex-col justify-center bg-green-500/5 border-green-500/20">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase">Passed Controls</h3>
                                <p className="text-4xl text-white font-mono font-bold mt-2">0</p>
                             </div>
                             <div className="p-2 bg-green-500/20 rounded-full text-green-400"><CheckCircle size={24}/></div>
                        </div>
                     </GlassCard>
                     <GlassCard className="flex flex-col justify-center bg-red-500/5 border-red-500/20">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase">Failed Controls</h3>
                                <p className="text-4xl text-white font-mono font-bold mt-2">0</p>
                             </div>
                             <div className="p-2 bg-red-500/20 rounded-full text-red-400"><AlertOctagon size={24}/></div>
                        </div>
                        <button className="mt-3 text-xs text-red-400 text-left hover:underline">View Critical Failures →</button>
                     </GlassCard>
                 </div>
            </div>

            {/* Gap Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard title="Control Gap Analysis" icon={<ShieldCheck className="text-blue-400"/>} className="h-[350px]">
                    {gapAnalysisData.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-gray-500">No Gap Analysis Data</div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gapAnalysisData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false}/>
                            <XAxis type="number" hide />
                            <YAxis dataKey="control" type="category" stroke="#9ca3af" fontSize={11} width={100} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Legend />
                            <Bar dataKey="passed" stackId="a" fill="#10b981" barSize={20} name="Passed" />
                            <Bar dataKey="failed" stackId="a" fill="#ef4444" barSize={20} name="Failed" />
                        </BarChart>
                    </ResponsiveContainer>
                    )}
                </GlassCard>

                {/* Failing Controls List */}
                <GlassCard title="Critical Failures" icon={<AlertOctagon className="text-red-500"/>} className="h-[350px] overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 sticky top-0">
                                <tr className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                                    <th className="p-3">Control ID</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-mono text-gray-300">
                                {criticalFailures.length === 0 ? (
                                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">No Critical Failures Found</td></tr>
                                ) : criticalFailures.map((c, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-3 text-red-400 font-bold">{c.id}</td>
                                        <td className="p-3">
                                            <div className="text-white">{c.desc}</div>
                                            <div className="text-xs text-gray-500">{c.issue}</div>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/20 transition-colors">
                                                Fix Now
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default CompliancePage;
