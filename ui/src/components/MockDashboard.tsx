import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface MockDashboardProps {
  title: string;
  color?: string;
}

const data = [
  { time: '00:00', value: 40 },
  { time: '04:00', value: 30 },
  { time: '08:00', value: 20 },
  { time: '12:00', value: 27 },
  { time: '16:00', value: 18 },
  { time: '20:00', value: 23 },
  { time: '24:00', value: 34 },
];

const MockDashboard: React.FC<MockDashboardProps> = ({ title, color = '#3b82f6' }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6">
        <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-mono font-bold text-white tracking-wide">
                {title}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                SIMULATION MODE
            </span>
        </div>

        <div className="flex-1 glass-panel p-6 rounded-2xl relative overflow-hidden">
             {/* Chart Header */}
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Metric Volume</h3>
                    <p className="text-2xl font-mono text-white mt-1">2,451 <span className="text-sm text-gray-500">ops/sec</span></p>
                </div>
                <div className="flex gap-2">
                    {['1h', '6h', '12h', '24h'].map(t => (
                        <button key={t} className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 transition-colors">
                            {t}
                        </button>
                    ))}
                </div>
             </div>

             {/* Chart */}
             <div className="h-[80%] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
        </div>
    </div>
  );
};

export default MockDashboard;
