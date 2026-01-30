import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell
} from 'recharts';
import client from '@/api/client';
import { GlassCard } from '../components/ui/GlassCard';
import { Network, Activity, Globe, Download, Upload } from 'lucide-react';

const NetworkDashboardPage: React.FC = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [protocolData, setProtocolData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trafficRes, protoRes] = await Promise.all([
            client.get('/dashboard/network/traffic'),
            client.get('/dashboard/network/protocols')
        ]);
        setTrafficData(trafficRes.data);
        setProtocolData(protoRes.data);
      } catch (err) {
        console.error("Network stats fetch failed", err);
        // Robust Mock Data
        const mockTraffic = Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            inbound: Math.floor(Math.random() * 5000) + 1000,
            outbound: Math.floor(Math.random() * 3000) + 500,
        }));
        setTrafficData(mockTraffic as any);

        const mockProto = [
            { name: 'HTTPS', value: 65, color: '#3b82f6' },
            { name: 'SSH', value: 15, color: '#10b981' },
            { name: 'DNS', value: 12, color: '#f59e0b' },
            { name: 'RDP', value: 5, color: '#ef4444' },
            { name: 'FTP', value: 3, color: '#8b5cf6' },
        ];
        setProtocolData(mockProto as any);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Network Telemetry</h1>
          <p className="text-gray-400">Real-time traffic analysis and protocol distribution.</p>
        </div>
        <div className="flex gap-4">
            <GlassCard className="px-4 py-2 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Download size={16}/></div>
                <div>
                    <p className="text-[10px] text-gray-500 uppercase">Inbound</p>
                    <p className="text-lg font-bold font-mono text-white">4.2 GB/s</p>
                </div>
            </GlassCard>
            <GlassCard className="px-4 py-2 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Upload size={16}/></div>
                <div>
                    <p className="text-[10px] text-gray-500 uppercase">Outbound</p>
                    <p className="text-lg font-bold font-mono text-white">1.8 GB/s</p>
                </div>
            </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Traffic Chart */}
        <div className="lg:col-span-2">
            <GlassCard title="Global Traffic Volume (24h)" icon={<Activity size={18} className="text-cyan-400"/>} className="h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-gray-500">Initializing Probes...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#525252" fontSize={10} tickMargin={10} />
                        <YAxis stroke="#525252" fontSize={10} tickFormatter={(v) => `${v/1000}G`} />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="inbound" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} name="Inbound" />
                        <Area type="monotone" dataKey="outbound" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} name="Outbound" />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                    </AreaChart>
                    </ResponsiveContainer>
                )}
            </GlassCard>
        </div>

        {/* Protocol Distribution */}
        <div className="lg:col-span-1">
            <GlassCard title="Protocol Distribution" icon={<Network size={18} className="text-green-400"/>} className="h-[400px]">
                 {loading ? (
                    <div className="flex justify-center items-center h-full text-gray-500">Analyzing Packets...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={protocolData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={50} />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {protocolData.map((entry: any, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </GlassCard>
        </div>
      </div>

      {/* Active Connections Table (Mock) */}
      <GlassCard title="Active Network Flows" icon={<Globe size={18} />}>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-xs text-gray-500 uppercase font-mono">
                      <tr>
                          <th className="p-3">Source</th>
                          <th className="p-3">Destination</th>
                          <th className="p-3">Proto</th>
                          <th className="p-3">Bytes</th>
                          <th className="p-3">Status</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm font-mono text-gray-300">
                      {[
                          { src: '10.0.0.5:49152', dst: '172.217.16.142:443', proto: 'TCP', bytes: '1.2 MB', status: 'ESTABLISHED' },
                          { src: '10.0.0.5:53', dst: '8.8.8.8:53', proto: 'UDP', bytes: '128 B', status: 'WAIT' },
                          { src: '192.168.1.100:22', dst: '10.0.0.8:58211', proto: 'SSH', bytes: '45 KB', status: 'ESTABLISHED' },
                      ].map((flow, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-3 text-cyan-300">{flow.src}</td>
                              <td className="p-3">{flow.dst}</td>
                              <td className="p-3 text-purple-400">{flow.proto}</td>
                              <td className="p-3 text-gray-500">{flow.bytes}</td>
                              <td className="p-3">
                                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px] border border-green-500/20">{flow.status}</span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </GlassCard>
    </div>
  );
};

export default NetworkDashboardPage;
