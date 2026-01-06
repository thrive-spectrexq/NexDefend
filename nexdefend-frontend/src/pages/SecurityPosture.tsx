import { useEffect } from 'react';
import { useRiskStore } from '../stores/riskStore';
import { Shield, TrendingUp, Users, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data for the chart
const trendData = [
  { time: '00:00', risk: 40 }, { time: '04:00', risk: 30 },
  { time: '08:00', risk: 65 }, { time: '12:00', risk: 45 },
  { time: '16:00', risk: 80 }, { time: '20:00', risk: 55 },
];

const SecurityPosture = () => {
  const { globalRiskScore } = useRiskStore();

  useEffect(() => {
    // In a real app, you would fetch risk data here
  }, []);

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Security Posture</h1>
          <p className="text-slate-400">Real-time risk aggregation and executive visibility.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Global Risk Score</div>
          <div className={`text-4xl font-black ${globalRiskScore > 70 ? 'text-red-500' : 'text-green-500'}`}>
            {globalRiskScore || 42} <span className="text-lg text-slate-600">/ 100</span>
          </div>
        </div>
      </header>

      {/* KPI Tiles (Glass Table Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPICard title="Notable Incidents" value="12" trend="+2" icon={<Shield className="text-indigo-400" />} />
        <KPICard title="Mean Time to Triage" value="4m 30s" trend="-10%" icon={<TrendingUp className="text-green-400" />} />
        <KPICard title="Active Entities" value="142" trend="stable" icon={<Users className="text-blue-400" />} />
        <KPICard title="Threat Sources" value="Global" trend="High" icon={<Globe className="text-orange-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">24h Risk Velocity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                <Area type="monotone" dataKey="risk" stroke="#6366f1" fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Risky Assets (Risk Analysis) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Top Risky Assets</h3>
          <div className="space-y-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-mono text-xs">
                    WS
                  </div>
                  <div>
                    <div className="text-sm font-medium">workstation-{100+i}</div>
                    <div className="text-xs text-slate-500">Malware Detected</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-bold">{90 - (i*5)}</div>
                  <div className="text-[10px] text-slate-500">SCORE</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, trend, icon }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-400 text-sm font-medium">{title}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-slate-500">
      <span className={trend.includes('+') ? 'text-red-400' : 'text-green-400'}>{trend}</span> vs last 24h
    </div>
  </div>
);

export default SecurityPosture;
