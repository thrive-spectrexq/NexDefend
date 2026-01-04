import {
  ShieldCheck,
  AlertTriangle,
  Wifi,
  Users,
  Activity,
  Terminal,
  FileText,
  Globe
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { cn } from '../../lib/utils';
import { PageTransition } from '../../components/common/PageTransition';
import { useEffect, useState } from 'react';

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
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Poll for metrics
    const fetchMetrics = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/v1/metrics/dashboard');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error("Failed to fetch dashboard metrics", e);
        }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const severityData = [
    { name: 'Critical', value: data?.severity_breakdown?.critical || 0, color: '#F87171' }, // brand-red
    { name: 'High', value: data?.severity_breakdown?.high || 0, color: '#FB923C' },     // brand-orange
    { name: 'Medium', value: data?.severity_breakdown?.medium || 0, color: '#38BDF8' },   // brand-blue
    { name: 'Low', value: data?.severity_breakdown?.low || 0, color: '#4ADE80' },      // brand-green
  ];

  const activeThreats = data?.active_threats || 0;
  const securityScore = data?.security_score || 100;

  return (
    <PageTransition className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
            label="Security Score"
            value={`${securityScore}/100`}
            subtext="Real-time calculation"
            icon={ShieldCheck}
            colorClass={securityScore > 80 ? "text-brand-green" : securityScore > 50 ? "text-brand-orange" : "text-brand-red"}
        />
        <StatCard
            label="Active Threats"
            value={activeThreats}
            subtext={`${data?.severity_breakdown?.critical || 0} Critical, ${data?.severity_breakdown?.high || 0} High`}
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

      {/* Main Charts Row */}
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

      {/* Recent System Activity Feed */}
      <div className="bg-surface border border-surface-highlight rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Activity className="text-brand-blue" size={20} />
                  Recent System Activity
              </h3>
              <div className="flex gap-2">
                  {['All', 'Process', 'Network', 'File'].map((filter) => (
                      <button
                          key={filter}
                          className={cn(
                              "px-3 py-1 text-xs font-mono rounded border transition-colors",
                              filter === 'All'
                                  ? "bg-brand-blue/10 text-brand-blue border-brand-blue/30"
                                  : "bg-surface-highlight/10 text-text-muted border-surface-highlight hover:bg-surface-highlight/20"
                          )}
                      >
                          {filter}
                      </button>
                  ))}
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead className="text-text-muted font-mono bg-surface-highlight/20 border-b border-surface-highlight">
                      <tr>
                          <th className="px-4 py-3 font-medium">Timestamp</th>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="px-4 py-3 font-medium">Host</th>
                          <th className="px-4 py-3 font-medium">User</th>
                          <th className="px-4 py-3 font-medium">Event Detail</th>
                          <th className="px-4 py-3 font-medium text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-highlight font-mono">
                      {[
                          { time: '10:42:15', type: 'Process', host: 'FIN-WS-004', user: 'j.doe', detail: 'Started powershell.exe -enc ...', icon: Terminal, color: 'text-brand-orange' },
                          { time: '10:41:02', type: 'Network', host: 'DMZ-WEB-01', user: 'SYSTEM', detail: 'Outbound conn to 192.168.4.22:443', icon: Globe, color: 'text-brand-blue' },
                          { time: '10:38:55', type: 'File', host: 'HR-LAP-09', user: 'm.smith', detail: 'Modified payroll_2024.xlsx', icon: FileText, color: 'text-brand-green' },
                          { time: '10:35:12', type: 'Process', host: 'DEV-SRV-01', user: 'root', detail: 'sudo apt-get install nmap', icon: Terminal, color: 'text-text-muted' },
                          { time: '10:32:01', type: 'Network', host: 'FIN-WS-004', user: 'j.doe', detail: 'DNS Query: mal-site.com', icon: Globe, color: 'text-brand-red' },
                      ].map((event, idx) => (
                          <tr key={idx} className="hover:bg-surface-highlight/10 group transition-colors">
                              <td className="px-4 py-3 text-text-muted whitespace-nowrap">{event.time}</td>
                              <td className="px-4 py-3">
                                  <span className={cn("flex items-center gap-2", event.color)}>
                                      <event.icon size={14} />
                                      {event.type}
                                  </span>
                              </td>
                              <td className="px-4 py-3 text-text">{event.host}</td>
                              <td className="px-4 py-3 text-text-muted">{event.user}</td>
                              <td className="px-4 py-3 text-text truncate max-w-xs" title={event.detail}>{event.detail}</td>
                              <td className="px-4 py-3 text-right">
                                  <button className="text-xs text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                                      View Raw
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          <div className="mt-4 text-center">
              <button className="text-sm text-text-muted hover:text-brand-blue transition-colors">
                  Load More Activity
              </button>
          </div>
      </div>
    </PageTransition>
  );
}
