import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { User, ShieldAlert, Fingerprint, Lock, Eye, MapPin } from 'lucide-react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';

const riskTimelineData = [
    { time: '08:00', riskScore: 12, events: 45 },
    { time: '10:00', riskScore: 45, events: 120 },
    { time: '12:00', riskScore: 20, events: 60 },
    { time: '14:00', riskScore: 88, events: 340 },
    { time: '16:00', riskScore: 95, events: 450 },
    { time: '18:00', riskScore: 60, events: 200 },
];

const behaviorRadarData = [
    { subject: 'Data Exfil', A: 120, fullMark: 150 },
    { subject: 'Priv Escalation', A: 98, fullMark: 150 },
    { subject: 'Abnormal Login', A: 86, fullMark: 150 },
    { subject: 'Lateral Mov', A: 99, fullMark: 150 },
    { subject: 'File Access', A: 85, fullMark: 150 },
    { subject: 'Process Inj', A: 65, fullMark: 150 },
];

// Login Map Data (Scatter) - X: Time of Day, Y: Location Variance
const loginMapData = Array.from({ length: 30 }, (_, i) => ({
    x: Math.random() * 24, // Hour
    y: Math.random() * 100, // Distance from usual location (km)
    z: Math.random() * 100, // Risk
    user: `user-${i}`
}));

const UEBAPage: React.FC = () => {
    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">User & Entity Behavior Analytics</h1>
                    <p className="text-gray-400">Detect insider threats, compromised accounts, and anomalous behavior patterns.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs font-mono">
                    <Eye size={14} className="text-cyan-400"/> AI Model: Active (Isolation Forest)
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="text-cyan-400" size={20} />
                        <span className="text-gray-400 text-xs font-bold uppercase">Monitored Users</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">4,281</div>
                </GlassCard>
                <GlassCard className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="text-red-400" size={20} />
                        <span className="text-gray-400 text-xs font-bold uppercase">High Risk Users</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">12</div>
                    <div className="text-xs text-red-400 mt-1">Requires Investigation</div>
                </GlassCard>
                <GlassCard className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="text-yellow-400" size={20} />
                        <span className="text-gray-400 text-xs font-bold uppercase">Privileged Accts</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">45</div>
                </GlassCard>
                <GlassCard className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Fingerprint className="text-purple-400" size={20} />
                        <span className="text-gray-400 text-xs font-bold uppercase">Anomalies (24h)</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white">156</div>
                </GlassCard>
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Timeline */}
                <div className="lg:col-span-2">
                    <GlassCard title="User Risk Timeline (Aggregate)" icon={<ActivityIcon className="text-red-400"/>} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={riskTimelineData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false}/>
                                <XAxis dataKey="time" stroke="#525252" fontSize={10} />
                                <YAxis yAxisId="left" stroke="#ef4444" fontSize={10} label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: '#ef4444' }}/>
                                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                                <Legend />
                                <Bar yAxisId="right" dataKey="events" barSize={20} fill="#3b82f6" opacity={0.3} name="Event Volume"/>
                                <Line yAxisId="left" type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} name="Avg Risk Score" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>

                {/* Insider Threat Radar */}
                <div className="lg:col-span-1">
                    <GlassCard title="Insider Threat Vectors" icon={<Fingerprint className="text-purple-400"/>} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={behaviorRadarData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar name="Anomaly Intensity" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </div>
            </div>

            {/* Row 2: Login Map & List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Anomalous Login Map (Scatter) */}
                <GlassCard title="Anomalous Access (Time vs Location)" icon={<MapPin className="text-cyan-400"/>} className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis type="number" dataKey="x" name="Hour of Day" unit="h" domain={[0, 24]} stroke="#525252" fontSize={10} />
                            <YAxis type="number" dataKey="y" name="Location Variance" unit="km" stroke="#525252" fontSize={10} />
                            <ZAxis type="number" dataKey="z" range={[50, 400]} name="Risk" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            <Legend />
                            <Scatter name="Logins" data={loginMapData} fill="#ef4444">
                                {loginMapData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.z > 80 ? '#ef4444' : '#10b981'} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* High Risk Entities List */}
                <GlassCard title="Top Risky Entities" icon={<ShieldAlert className="text-red-500"/>} className="h-[350px] overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 sticky top-0">
                                <tr className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                                    <th className="p-3">User/Entity</th>
                                    <th className="p-3">Department</th>
                                    <th className="p-3 text-right">Risk Score</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-mono text-gray-300">
                                {[
                                    { user: 'jdoe@corp.com', dept: 'Engineering', score: 98 },
                                    { user: 'finance-admin', dept: 'Finance', score: 92 },
                                    { user: 'svc-backup', dept: 'IT Ops', score: 85 },
                                    { user: 'asmith', dept: 'HR', score: 78 },
                                    { user: 'dev-workstation-44', dept: 'R&D', score: 75 },
                                ].map((u, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-3 text-white font-bold">{u.user}</td>
                                        <td className="p-3 text-gray-400">{u.dept}</td>
                                        <td className="p-3 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                u.score > 90 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {u.score}
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
    );
};

// Helper
const ActivityIcon = ({className}: {className?: string}) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
)

export default UEBAPage;
