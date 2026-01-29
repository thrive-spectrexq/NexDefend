import { GlassCard } from '../components/ui/GlassCard';
import { User, MapPin, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const anomalies = [
  { id: 1, user: 'admin_jules', action: 'Impossible Travel', detail: 'Login from NYC then London in 1h', time: '10:42 AM', severity: 'Critical' },
  { id: 2, user: 'service_kafka', action: 'Data Exfiltration', detail: 'Uploaded 2GB to unknown IP', time: '09:15 AM', severity: 'High' },
  { id: 3, user: 'dave_dev', action: 'Privilege Escalation', detail: 'Added to sudoers group', time: '08:30 AM', severity: 'High' },
  { id: 4, user: 'sarah_hr', action: 'Unusual Time', detail: 'Accessing payroll DB at 3 AM', time: '03:12 AM', severity: 'Medium' },
];

const activityData = [
  { hour: '00:00', events: 12 }, { hour: '04:00', events: 5 },
  { hour: '08:00', events: 45 }, { hour: '12:00', events: 120 },
  { hour: '16:00', events: 90 }, { hour: '20:00', events: 30 },
];

const UEBAPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">User & Entity Behavior Analytics</h1>
        <p className="text-gray-400">Detect anomalies and insider threats using behavioral baselining.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Risk Leaderboard */}
        <GlassCard title="High Risk Users" className="h-full">
            <div className="space-y-4">
                {[
                    { user: 'admin_jules', score: 98, dept: 'IT Ops' },
                    { user: 'service_kafka', score: 85, dept: 'System' },
                    { user: 'dave_dev', score: 72, dept: 'Engineering' },
                ].map((u) => (
                    <div key={u.user} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-700/50 rounded-full"><User size={16}/></div>
                            <div>
                                <p className="text-sm font-bold text-white">{u.user}</p>
                                <p className="text-xs text-gray-500">{u.dept}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-lg font-mono font-bold ${
                                u.score > 90 ? 'text-red-500' : u.score > 80 ? 'text-orange-500' : 'text-yellow-500'
                            }`}>{u.score}</span>
                            <p className="text-[10px] text-gray-500 uppercase">Risk Score</p>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>

        {/* Anomaly Timeline */}
        <div className="lg:col-span-2 space-y-6">
            <GlassCard title="Anomaly Detection Stream">
                <div className="space-y-0 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-px bg-white/10" />

                    {anomalies.map((event) => (
                        <div key={event.id} className="relative flex items-start gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors group">
                            <div className={`relative z-10 p-2 rounded-full border-2 border-[#050505] ${
                                event.severity === 'Critical' ? 'bg-red-500 text-white' :
                                event.severity === 'High' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-black'
                            }`}>
                                <AlertCircle size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                                        {event.action}
                                    </h4>
                                    <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                                        <Clock size={12} /> {event.time}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{event.detail}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                        <User size={10} /> {event.user}
                                    </span>
                                    {event.action === 'Impossible Travel' && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                                            <MapPin size={10} /> Geo-Anomaly
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="self-center p-2 text-gray-600 hover:text-white transition-colors">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Activity Chart */}
            <GlassCard title="Baseline Deviation (24h)">
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData}>
                            <Tooltip
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', color: '#fff' }}
                            />
                            <Bar dataKey="events" radius={[4, 4, 0, 0]}>
                                {activityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.events > 100 ? '#ef4444' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default UEBAPage;
