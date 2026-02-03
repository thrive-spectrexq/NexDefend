import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { AlertTriangle, TrendingUp, Layers, Activity } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const riskTrendData = [
    { day: 'Mon', score: 45 },
    { day: 'Tue', score: 48 },
    { day: 'Wed', score: 52 },
    { day: 'Thu', score: 49 },
    { day: 'Fri', score: 60 },
    { day: 'Sat', score: 55 },
    { day: 'Sun', score: 58 },
];

const assetCriticalityData = [
    { name: 'Mission Critical', value: 15, color: '#ef4444' }, // Red
    { name: 'Business Critical', value: 35, color: '#f97316' }, // Orange
    { name: 'Operational', value: 40, color: '#eab308' }, // Yellow
    { name: 'Low Impact', value: 10, color: '#22c55e' }, // Green
];

// Mock Heatmap Data (Matrix 5x5)
const riskHeatmap = [
    { likelihood: 'Rare', impact: 'Negligible', value: 2, color: 'bg-green-900' },
    { likelihood: 'Rare', impact: 'Minor', value: 5, color: 'bg-green-800' },
    { likelihood: 'Rare', impact: 'Moderate', value: 10, color: 'bg-yellow-900' },
    { likelihood: 'Rare', impact: 'Major', value: 20, color: 'bg-orange-900' },
    { likelihood: 'Rare', impact: 'Catastrophic', value: 40, color: 'bg-red-900' },

    { likelihood: 'Unlikely', impact: 'Negligible', value: 4, color: 'bg-green-800' },
    { likelihood: 'Unlikely', impact: 'Minor', value: 8, color: 'bg-green-700' },
    { likelihood: 'Unlikely', impact: 'Moderate', value: 16, color: 'bg-yellow-800' },
    { likelihood: 'Unlikely', impact: 'Major', value: 32, color: 'bg-orange-800' },
    { likelihood: 'Unlikely', impact: 'Catastrophic', value: 64, color: 'bg-red-800' },

    { likelihood: 'Possible', impact: 'Negligible', value: 6, color: 'bg-green-700' },
    { likelihood: 'Possible', impact: 'Minor', value: 12, color: 'bg-yellow-800' },
    { likelihood: 'Possible', impact: 'Moderate', value: 24, color: 'bg-yellow-700' },
    { likelihood: 'Possible', impact: 'Major', value: 48, color: 'bg-orange-700' },
    { likelihood: 'Possible', impact: 'Catastrophic', value: 96, color: 'bg-red-700' },

    { likelihood: 'Likely', impact: 'Negligible', value: 8, color: 'bg-yellow-900' },
    { likelihood: 'Likely', impact: 'Minor', value: 16, color: 'bg-yellow-700' },
    { likelihood: 'Likely', impact: 'Moderate', value: 32, color: 'bg-orange-800' },
    { likelihood: 'Likely', impact: 'Major', value: 64, color: 'bg-red-800' },
    { likelihood: 'Likely', impact: 'Catastrophic', value: 128, color: 'bg-red-600' },

    { likelihood: 'Certain', impact: 'Negligible', value: 10, color: 'bg-orange-900' },
    { likelihood: 'Certain', impact: 'Minor', value: 20, color: 'bg-orange-800' },
    { likelihood: 'Certain', impact: 'Moderate', value: 40, color: 'bg-red-800' },
    { likelihood: 'Certain', impact: 'Major', value: 80, color: 'bg-red-600' },
    { likelihood: 'Certain', impact: 'Catastrophic', value: 160, color: 'bg-red-500' },
];

const RiskPage: React.FC = () => {
    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Enterprise Risk Management</h1>
                    <p className="text-gray-400">Quantify, prioritize, and mitigate cyber risk across the organization.</p>
                </div>
            </div>

            {/* Risk KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30">
                     <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Overall Risk Score</h3>
                     <div className="text-5xl font-mono font-bold text-white mb-1">58<span className="text-2xl text-gray-500">/100</span></div>
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">Moderate</span>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center p-6">
                     <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Annualized Loss Expectancy</h3>
                     <div className="text-4xl font-mono font-bold text-white mb-1">$1.2M</div>
                     <span className="text-xs text-red-400">▲ 15% from last quarter</span>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center p-6">
                     <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Open Risk Items</h3>
                     <div className="text-4xl font-mono font-bold text-white mb-1">24</div>
                     <span className="text-xs text-green-400">▼ 4 items closed this week</span>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Risk Trend */}
                 <GlassCard title="Risk Trend (7 Days)" icon={<TrendingUp className="text-red-400"/>} className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={riskTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#525252" fontSize={10} />
                            <YAxis domain={[0, 100]} stroke="#525252" fontSize={10} />
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            <Area type="monotone" dataKey="score" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </GlassCard>

                 {/* Asset Criticality */}
                 <GlassCard title="Asset Criticality Distribution" icon={<Layers className="text-orange-400"/>} className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={assetCriticalityData}
                                cx="50%" cy="50%"
                                outerRadius={100}
                                innerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {assetCriticalityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                 </GlassCard>
            </div>

            {/* Risk Heatmap (Manual Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <GlassCard title="Risk Heatmap (Likelihood vs Impact)" icon={<Activity className="text-purple-400"/>} className="h-auto">
                        <div className="grid grid-cols-[auto_1fr] gap-4">
                            {/* Y Axis Labels */}
                            <div className="flex flex-col justify-between py-6 text-xs text-gray-400 font-bold uppercase h-[300px] w-16 text-right">
                                <span>Certain</span>
                                <span>Likely</span>
                                <span>Possible</span>
                                <span>Unlikely</span>
                                <span>Rare</span>
                            </div>

                            <div className="flex flex-col">
                                {/* The Grid */}
                                <div className="grid grid-cols-5 grid-rows-5 gap-1 h-[300px]">
                                    {/* Row 5 (Certain) - Indices 20-24 */}
                                    {riskHeatmap.slice(20, 25).map((cell, i) => <div key={`r5-${i}`} className={`${cell.color} rounded hover:brightness-125 transition-all cursor-pointer border border-black/20`} title={`Risk: ${cell.value}`} />)}
                                    {/* Row 4 (Likely) - Indices 15-19 */}
                                    {riskHeatmap.slice(15, 20).map((cell, i) => <div key={`r4-${i}`} className={`${cell.color} rounded hover:brightness-125 transition-all cursor-pointer border border-black/20`} title={`Risk: ${cell.value}`} />)}
                                    {/* Row 3 (Possible) - Indices 10-14 */}
                                    {riskHeatmap.slice(10, 15).map((cell, i) => <div key={`r3-${i}`} className={`${cell.color} rounded hover:brightness-125 transition-all cursor-pointer border border-black/20`} title={`Risk: ${cell.value}`} />)}
                                    {/* Row 2 (Unlikely) - Indices 5-9 */}
                                    {riskHeatmap.slice(5, 10).map((cell, i) => <div key={`r2-${i}`} className={`${cell.color} rounded hover:brightness-125 transition-all cursor-pointer border border-black/20`} title={`Risk: ${cell.value}`} />)}
                                    {/* Row 1 (Rare) - Indices 0-4 */}
                                    {riskHeatmap.slice(0, 5).map((cell, i) => <div key={`r1-${i}`} className={`${cell.color} rounded hover:brightness-125 transition-all cursor-pointer border border-black/20`} title={`Risk: ${cell.value}`} />)}
                                </div>
                                {/* X Axis Labels */}
                                <div className="grid grid-cols-5 mt-2 text-xs text-gray-400 font-bold uppercase text-center">
                                    <span>Negligible</span>
                                    <span>Minor</span>
                                    <span>Moderate</span>
                                    <span>Major</span>
                                    <span>Catastrophic</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Top Risks Table */}
                <div className="lg:col-span-1">
                    <GlassCard title="Top Identified Risks" icon={<AlertTriangle className="text-yellow-400"/>} className="h-full">
                         <div className="space-y-3">
                             {[
                                 { title: 'Data Center Outage', score: 80, impact: 'High' },
                                 { title: 'Phishing Campaign', score: 64, impact: 'Med' },
                                 { title: 'Vendor Breach', score: 48, impact: 'Med' },
                                 { title: 'Unpatched Server', score: 40, impact: 'Low' },
                                 { title: 'Insider Leak', score: 32, impact: 'Low' },
                             ].map((risk, i) => (
                                 <div key={i} className="p-3 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors flex justify-between items-center">
                                     <div>
                                         <div className="text-sm font-bold text-white">{risk.title}</div>
                                         <div className="text-xs text-gray-500">Impact: {risk.impact}</div>
                                     </div>
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                                         risk.score > 60 ? 'bg-red-500 text-white' : risk.score > 30 ? 'bg-yellow-500 text-black' : 'bg-green-500 text-black'
                                     }`}>
                                         {risk.score}
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default RiskPage;
