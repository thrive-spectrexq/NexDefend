import { GlassCard } from '../components/ui/GlassCard';
import { TrendingUp, DollarSign, Clock, ShieldAlert, AlertOctagon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const riskTrendData = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 68 },
  { day: 'Wed', score: 72 }, // Spiked
  { day: 'Thu', score: 70 },
  { day: 'Fri', score: 60 },
  { day: 'Sat', score: 58 },
  { day: 'Sun', score: 55 },
];

const RiskPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Executive Risk Scorecard</h1>
        <p className="text-gray-400">Strategic view of organizational security posture and financial exposure.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Score */}
        <GlassCard className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-red-500/20 rounded text-red-400"><AlertOctagon size={24}/></div>
                <span className="text-xs text-red-300 font-bold bg-red-900/40 px-2 py-1 rounded">+12% vs last week</span>
            </div>
            <div className="mt-4">
                <span className="text-4xl font-mono font-bold text-white">72</span>
                <span className="text-gray-400 text-sm">/100</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Enterprise Risk Score</p>
        </GlassCard>

        {/* Financial Exposure */}
        <GlassCard>
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-green-500/20 rounded text-green-400"><DollarSign size={24}/></div>
            </div>
            <div className="mt-4">
                <span className="text-4xl font-mono font-bold text-white">$125K</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Estimated Breach Impact</p>
        </GlassCard>

        {/* MTTD */}
        <GlassCard>
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-500/20 rounded text-blue-400"><Clock size={24}/></div>
                <span className="text-xs text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded">-2m improved</span>
            </div>
            <div className="mt-4">
                <span className="text-4xl font-mono font-bold text-white">4m 12s</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Mean Time To Detect</p>
        </GlassCard>

        {/* MTTR */}
        <GlassCard>
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-500/20 rounded text-purple-400"><ShieldAlert size={24}/></div>
            </div>
            <div className="mt-4">
                <span className="text-4xl font-mono font-bold text-white">18m 45s</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Mean Time To Respond</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <GlassCard title="Risk Velocity (7 Days)" icon={<TrendingUp className="h-5 w-5"/>} className="lg:col-span-2">
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskTrendData}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>

        {/* Top Risk Contributors */}
        <GlassCard title="Top Risk Factors">
            <div className="space-y-4 mt-2">
                {[
                    { label: 'Unpatched Databases', severity: 'Critical', impact: 'High' },
                    { label: 'Admin Login Anomalies', severity: 'High', impact: 'Med' },
                    { label: 'Open RDP Ports', severity: 'High', impact: 'High' },
                    { label: 'Weak Password Policy', severity: 'Medium', impact: 'Med' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div>
                            <p className="text-sm font-bold text-gray-200">{item.label}</p>
                            <p className="text-xs text-gray-500">Impact: {item.impact}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                            item.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                            item.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                        }`}>
                            {item.severity}
                        </span>
                    </div>
                ))}
            </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default RiskPage;
