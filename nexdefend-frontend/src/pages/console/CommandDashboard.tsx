import {
  ShieldCheck,
  AlertTriangle,
  Wifi,
  Users
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { cn } from '../../lib/utils';
import { useDetectionStore } from '../../stores/detectionStore';
import { PageTransition } from '../../components/common/PageTransition';

// Mock Timeline (keeping static for now as store doesn't have history trend yet)
const timelineData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 50) + 10
}));

function StatCard({ label, value, subtext, icon: Icon, colorClass }: any) {
    return (
        <div className="bg-surface border border-surface-highlight p-6 rounded-lg relative overflow-hidden group hover:border-brand-blue/50 transition-colors">
            <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity", colorClass)}>
                <Icon size={64} />
            </div>
            <div className="relative z-10">
                <div className="text-text-muted text-sm uppercase tracking-wider font-semibold mb-2">{label}</div>
                <div className="text-4xl font-mono font-bold text-text mb-1">{value}</div>
                {subtext && <div className={cn("text-xs font-mono", colorClass)}>{subtext}</div>}
            </div>
        </div>
    );
}

export default function CommandDashboard() {
  const stats = useDetectionStore((state) => state.stats);

  const severityData = [
    { name: 'Critical', value: stats.critical, color: '#F87171' }, // brand-red
    { name: 'High', value: stats.high, color: '#FB923C' },     // brand-orange
    { name: 'Medium', value: stats.medium, color: '#38BDF8' },   // brand-blue
    { name: 'Low', value: stats.low, color: '#4ADE80' },      // brand-green
  ];

  const activeThreats = stats.critical + stats.high;

  return (
    <PageTransition className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
            label="Security Score"
            value={`${Math.max(0, 100 - (activeThreats * 2))}/100`}
            subtext="Real-time calculation"
            icon={ShieldCheck}
            colorClass="text-brand-green"
        />
        <StatCard
            label="Active Threats"
            value={activeThreats}
            subtext={`${stats.critical} Critical, ${stats.high} High`}
            icon={AlertTriangle}
            colorClass="text-brand-red"
        />
        <StatCard
            label="Online Agents"
            value="98.5%"
            subtext="2,431 / 2,468 Online"
            icon={Wifi}
            colorClass="text-brand-blue"
        />
        <StatCard
            label="Analysts Online"
            value="8"
            subtext="SOC Shift B"
            icon={Users}
            colorClass="text-text-muted"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Severity Breakdown */}
        <div className="bg-surface border border-surface-highlight rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-text mb-4">Alert Severity</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={severityData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {severityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#162032', borderColor: '#1E293B', color: '#E2E8F0' }}
                            itemStyle={{ color: '#E2E8F0' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs font-mono text-text-muted mt-4">
                {severityData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name} ({item.value})</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Threat Timeline */}
        <div className="bg-surface border border-surface-highlight rounded-lg p-6 lg:col-span-2 flex flex-col">
            <h3 className="text-lg font-semibold text-text mb-4">Threat Detection Volume (24h)</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timelineData}>
                        <XAxis
                            dataKey="time"
                            stroke="#94A3B8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94A3B8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }}
                            contentStyle={{ backgroundColor: '#162032', borderColor: '#1E293B', color: '#E2E8F0' }}
                        />
                        <Bar dataKey="value" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </PageTransition>
  );
}
