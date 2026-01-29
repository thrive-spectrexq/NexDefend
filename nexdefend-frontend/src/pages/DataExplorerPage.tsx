import React, { useEffect, useState } from 'react';
import { getEvents } from '@/api/events';
import { GlassCard } from '@/components/ui/GlassCard';
import { Download, Calendar, Terminal, X, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell, XAxis, PieChart, Pie } from 'recharts';

interface LogEvent {
  timestamp: string;
  event_type: string;
  severity?: string;
  source_ip: string;
  destination_ip: string;
  details: unknown;
  [key: string]: unknown;
}

// Mock Histogram Data
const volumeData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    count: Math.floor(Math.random() * 500) + 50,
    severity: Math.random() > 0.8 ? 'high' : 'normal'
}));

const DataExplorerPage: React.FC = () => {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('severity:high AND event_type:network_flow');
  const [pivotData, setPivotData] = useState<{ field: string, value: string, distribution: any[] } | null>(null);

  const fetchEvents = async (query?: string) => {
    setLoading(true);
    try {
      const data = await getEvents(query);
      const rows = Array.isArray(data) ? data : (data?.hits || []);
      setEvents(rows);
    } catch (err) {
      console.error("Failed to fetch events", err);
      // Fallback Mock Data
      setEvents([
          { timestamp: new Date().toISOString(), event_type: 'network_flow', severity: 'low', source_ip: '192.168.1.105', destination_ip: '10.0.0.1', details: { port: 443, proto: 'TCP' } },
          { timestamp: new Date(Date.now() - 50000).toISOString(), event_type: 'auth_failed', severity: 'high', source_ip: '192.168.1.105', destination_ip: '10.0.0.5', details: { user: 'root' } },
          { timestamp: new Date(Date.now() - 120000).toISOString(), event_type: 'file_mod', severity: 'medium', source_ip: '10.0.0.2', destination_ip: '-', details: { path: '/etc/passwd' } },
          { timestamp: new Date(Date.now() - 300000).toISOString(), event_type: 'process_start', severity: 'low', source_ip: '10.0.0.5', destination_ip: '-', details: { cmd: 'curl google.com' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(searchQuery);
  };

  const handlePivot = (field: string, value: any) => {
      // Calculate top 5 values for this field from current dataset
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const counts = events.reduce((acc: any, evt: any) => {
          const val = String(evt[field] || 'N/A');
          acc[val] = (acc[val] || 0) + 1;
          return acc;
      }, {});

      const sorted = Object.entries(counts)
          .sort(([, a]: any, [, b]: any) => b - a)
          .slice(0, 5)
          .map(([k, v]) => ({ name: k, value: v }));

      setPivotData({ field, value: String(value), distribution: sorted });
  };

  return (
    <div className="h-full flex flex-col space-y-4 relative">
        {/* Pivot Modal Overlay */}
        {pivotData && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-[500px] bg-[#09090b] border border-cyan-500/30 rounded-2xl shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <PieChartIcon size={20} className="text-cyan-400"/> Pivot Analysis
                            </h3>
                            <p className="text-sm text-gray-400 font-mono mt-1">
                                Field: <span className="text-cyan-300">{pivotData.field}</span>
                            </p>
                        </div>
                        <button onClick={() => setPivotData(null)} className="text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="h-64 w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pivotData.distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pivotData.distribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Top Values Distribution</h4>
                        {pivotData.distribution.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-white/5 border border-white/5">
                                <span className="font-mono text-gray-300 truncate w-2/3" title={item.name}>{item.name}</span>
                                <span className="font-bold text-cyan-400">{item.value} ({Math.round((item.value / events.length) * 100)}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Data Explorer</h1>
          <p className="text-gray-400">Advanced log analysis and threat hunting using Lucene queries.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm border border-white/10 transition-colors">
                <Calendar size={14}/> Last 24 Hours
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg text-cyan-400 text-sm border border-cyan-500/20 transition-colors">
                <Download size={14}/> Export
            </button>
        </div>
      </div>

      {/* 1. Histogram (Timeline) */}
      <GlassCard className="h-48 p-4">
          <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Event Volume (24h)</h3>
              <span className="text-xs font-mono text-cyan-400">Total: 4,215 Events</span>
          </div>
          <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} barGap={2}>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', color: '#fff' }}
                        cursor={{ fill: '#ffffff10' }}
                      />
                      <XAxis dataKey="time" hide />
                      <Bar dataKey="count">
                          {volumeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.severity === 'high' ? '#ef4444' : '#3b82f6'} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </GlassCard>

      {/* 2. Search Bar */}
      <div className="sticky top-0 z-20">
        <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Terminal className="h-4 w-4 text-cyan-500" />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-[#09090b] border border-cyan-500/30 rounded-xl text-cyan-100 font-mono text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all"
                placeholder="Search query..."
            />
            <button type="submit" className="absolute inset-y-1 right-1 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-xs font-bold border border-cyan-500/20 transition-colors">
                RUN QUERY
            </button>
        </form>
      </div>

      {/* 3. Log Grid */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col p-0">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 sticky top-0 z-10">
                    <tr className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                        <th className="py-2 px-4 border-b border-white/10">Time</th>
                        <th className="py-2 px-4 border-b border-white/10">Severity</th>
                        <th className="py-2 px-4 border-b border-white/10">Type</th>
                        <th className="py-2 px-4 border-b border-white/10">Source</th>
                        <th className="py-2 px-4 border-b border-white/10">Destination</th>
                        <th className="py-2 px-4 border-b border-white/10 w-full">Message / Details</th>
                    </tr>
                </thead>
                <tbody className="text-xs font-mono text-gray-300">
                    {events.map((evt, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td className="py-2 px-4 text-gray-500 whitespace-nowrap">
                                {new Date(evt.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2 px-4 cursor-pointer hover:bg-white/10" onClick={() => handlePivot('severity', evt.severity)}>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    evt.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                    evt.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {evt.severity || 'INFO'}
                                </span>
                            </td>
                            <td className="py-2 px-4 text-cyan-300 cursor-pointer hover:underline decoration-cyan-500/50" onClick={() => handlePivot('event_type', evt.event_type)}>
                                {evt.event_type}
                            </td>
                            <td className="py-2 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handlePivot('source_ip', evt.source_ip)}>
                                {evt.source_ip}
                            </td>
                            <td className="py-2 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handlePivot('destination_ip', evt.destination_ip)}>
                                {evt.destination_ip}
                            </td>
                            <td className="py-2 px-4 text-gray-400 truncate max-w-md group-hover:text-white group-hover:whitespace-normal transition-all">
                                {JSON.stringify(evt.details)}
                            </td>
                        </tr>
                    ))}
                    {loading && (
                        <tr><td colSpan={6} className="py-10 text-center text-cyan-400">Searching...</td></tr>
                    )}
                </tbody>
            </table>
          </div>
          <div className="p-2 border-t border-white/10 bg-black/20 text-[10px] text-gray-500 font-mono flex justify-between">
              <span>Showing {events.length} results</span>
              <span>Query Time: 42ms</span>
          </div>
      </GlassCard>
    </div>
  );
};

export default DataExplorerPage;
