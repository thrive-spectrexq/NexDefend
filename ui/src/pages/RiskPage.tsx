import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { AlertTriangle, TrendingUp, Layers, Activity } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const RiskPage: React.FC = () => {
    const [riskTrendData, setRiskTrendData] = useState<any[]>([]);
    const [assetCriticalityData, setAssetCriticalityData] = useState<any[]>([]);
    const [riskHeatmap, setRiskHeatmap] = useState<any[]>([]);
    const [topRisks, setTopRisks] = useState<any[]>([]);

    useEffect(() => {
        // Future: fetch from API
        setRiskTrendData([]);
        setAssetCriticalityData([]);
        setRiskHeatmap([]);
        setTopRisks([]);
    }, []);

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
                     <div className="text-5xl font-mono font-bold text-white mb-1">0<span className="text-2xl text-gray-500">/100</span></div>
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">Calculating</span>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center p-6">
                     <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Annualized Loss Expectancy</h3>
                     <div className="text-4xl font-mono font-bold text-white mb-1">$0</div>
                     <span className="text-xs text-red-400">--</span>
                </GlassCard>
                <GlassCard className="flex flex-col items-center justify-center p-6">
                     <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Open Risk Items</h3>
                     <div className="text-4xl font-mono font-bold text-white mb-1">0</div>
                     <span className="text-xs text-green-400">--</span>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Risk Trend */}
                 <GlassCard title="Risk Trend (7 Days)" icon={<TrendingUp className="text-red-400"/>} className="h-[350px]">
                    {riskTrendData.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-gray-500">No Trend Data</div>
                    ) : (
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
                    )}
                 </GlassCard>

                 {/* Asset Criticality */}
                 <GlassCard title="Asset Criticality Distribution" icon={<Layers className="text-orange-400"/>} className="h-[350px]">
                    {assetCriticalityData.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-gray-500">No Asset Data</div>
                    ) : (
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
                    )}
                 </GlassCard>
            </div>

            {/* Risk Heatmap (Manual Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <GlassCard title="Risk Heatmap (Likelihood vs Impact)" icon={<Activity className="text-purple-400"/>} className="h-auto">
                        {riskHeatmap.length === 0 ? (
                            <div className="flex justify-center items-center h-[300px] text-gray-500">No Heatmap Data</div>
                        ) : (
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
                                    {/* Map logic would go here */}
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
                        )}
                    </GlassCard>
                </div>

                {/* Top Risks Table */}
                <div className="lg:col-span-1">
                    <GlassCard title="Top Identified Risks" icon={<AlertTriangle className="text-yellow-400"/>} className="h-full">
                         <div className="space-y-3">
                             {topRisks.length === 0 ? (
                                 <div className="text-center text-gray-500 py-4">No Risks Identified</div>
                             ) : topRisks.map((risk, i) => (
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
