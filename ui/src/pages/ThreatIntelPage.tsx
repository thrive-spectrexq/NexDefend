import { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Radar as RadarIcon, Globe, Hash, Shield, ExternalLink, MapPin, Target, Crosshair, AlertOctagon } from 'lucide-react';
import {
    ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    ComposedChart, Bar, Line, CartesianGrid
} from 'recharts';

const ThreatIntelPage = () => {
  const [iocs, setIocs] = useState<any[]>([]);
  const [mapData, setMapData] = useState<any[]>([]);
  const [attackVectorData, setAttackVectorData] = useState<any[]>([]);
  const [campaignData, setCampaignData] = useState<any[]>([]);

  useEffect(() => {
    // Future: Fetch from API
    setIocs([]);
    setMapData([]);
    setAttackVectorData([]);
    setCampaignData([]);
  }, []);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Threat Intelligence Platform</h1>
            <p className="text-gray-400">Global Indicators of Compromise (IOCs), campaigns, and attack vectors.</p>
        </div>
        <div className="flex gap-3">
             <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm border border-white/10">
                Manage Feeds
             </button>
             <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono text-sm border border-cyan-500/30">
                Add Indicator
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Global Threat Map (Abstract Visualization) */}
          <div className="lg:col-span-2">
              <GlassCard title="Global Threat Velocity" icon={<MapPin size={18} className="text-red-400"/>} className="h-[350px] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-black to-black" />
                  {mapData.length === 0 ? (
                      <div className="flex justify-center items-center h-full text-gray-500 relative z-10">No Global Threat Data</div>
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
                          <YAxis type="number" dataKey="y" hide domain={[0, 60]} />
                          <ZAxis type="number" dataKey="z" range={[50, 400]} />
                          <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ payload }) => {
                                if (payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-black/80 border border-red-500/30 p-2 rounded text-xs">
                                            <p className="text-red-400 font-bold">Threat Detected</p>
                                            <p className="text-gray-300">Severity: {Math.round(data.z)}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                          />
                          <Scatter name="Threats" data={mapData} fill="#ef4444">
                              {mapData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.z > 80 ? '#ef4444' : '#f59e0b'} />
                              ))}
                          </Scatter>
                      </ScatterChart>
                  </ResponsiveContainer>
                  )}
              </GlassCard>
          </div>

          <div className="space-y-4">
            <GlassCard className="bg-red-500/5 border-red-500/20">
                <h3 className="text-gray-400 text-xs font-bold uppercase">Critical IOCs</h3>
                <p className="text-3xl text-white font-mono font-bold mt-2">0</p>
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Shield size={12}/> Blocking Active</p>
            </GlassCard>
            <GlassCard className="bg-blue-500/5 border-blue-500/20">
                <h3 className="text-gray-400 text-xs font-bold uppercase">Feeds Active</h3>
                <p className="text-3xl text-white font-mono font-bold mt-2">0</p>
                <p className="text-xs text-blue-400 mt-1 flex items-center gap-1"><Globe size={12}/> Global Sources</p>
            </GlassCard>
            <GlassCard className="bg-purple-500/5 border-purple-500/20">
                <h3 className="text-gray-400 text-xs font-bold uppercase">Daily Ingest</h3>
                <p className="text-3xl text-white font-mono font-bold mt-2">0</p>
                <p className="text-xs text-purple-400 mt-1 flex items-center gap-1"><RadarIcon size={12}/> Indicators</p>
            </GlassCard>
          </div>
      </div>

      {/* Deep Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attack Surface Radar */}
          <GlassCard title="Attack Vector Analysis" icon={<Target size={18} className="text-orange-400"/>} className="h-[350px]">
              {attackVectorData.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">No Vector Data</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={attackVectorData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar name="Threat Exposure" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                  </RadarChart>
              </ResponsiveContainer>
              )}
          </GlassCard>

          {/* Campaign Timeline */}
          <GlassCard title="Threat Campaign Activity" icon={<Crosshair size={18} className="text-cyan-400"/>} className="h-[350px]">
              {campaignData.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">No Campaign Data</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={campaignData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                      <XAxis dataKey="name" scale="band" stroke="#525252" fontSize={10} />
                      <YAxis stroke="#525252" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                      <Legend />
                      <Bar dataKey="attacks" barSize={20} fill="#3b82f6" name="Attack Volume" />
                      <Line type="monotone" dataKey="severity" stroke="#ef4444" strokeWidth={2} dot={false} name="Severity Index" />
                  </ComposedChart>
              </ResponsiveContainer>
              )}
          </GlassCard>
      </div>

      {/* IOC Table */}
      <GlassCard title="Global Threat Feed" icon={<AlertOctagon size={18} className="text-red-500" />}>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Indicator</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Source</th>
                        <th className="py-3 px-4">Confidence</th>
                        <th className="py-3 px-4">Tags</th>
                        <th className="py-3 px-4">Last Seen</th>
                        <th className="py-3 px-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {iocs.length === 0 ? (
                        <tr><td colSpan={7} className="p-4 text-center text-gray-500">No Indicators of Compromise</td></tr>
                    ) : iocs.map((ioc) => (
                        <tr key={ioc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td className="py-3 px-4 font-mono text-cyan-300 flex items-center gap-2">
                                {ioc.type === 'IP Address' ? <Globe size={14} className="text-gray-500"/> :
                                 ioc.type === 'Domain' ? <Globe size={14} className="text-gray-500"/> :
                                 <Hash size={14} className="text-gray-500"/>
                                }
                                {ioc.indicator}
                            </td>
                            <td className="py-3 px-4 text-gray-300">{ioc.type}</td>
                            <td className="py-3 px-4 text-gray-400">{ioc.source}</td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${ioc.confidence > 90 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${ioc.confidence}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono">{ioc.confidence}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex gap-2">
                                    {ioc.tags.map((tag: string) => (
                                        <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300 border border-white/10">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-gray-400 font-mono text-xs">{ioc.lastSeen}</td>
                            <td className="py-3 px-4 text-right flex gap-2 justify-end">
                                <button className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded border border-red-500/20 transition-colors">
                                    Block
                                </button>
                                <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
                                    <ExternalLink size={16} />
                                </button>
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

export default ThreatIntelPage;
