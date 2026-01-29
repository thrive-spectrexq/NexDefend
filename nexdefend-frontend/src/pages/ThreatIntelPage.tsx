import { GlassCard } from '../components/ui/GlassCard';
import { Radar, Globe, Hash, Shield, ExternalLink } from 'lucide-react';

const iocs = [
  { id: 1, indicator: '192.168.1.105', type: 'IP Address', source: 'AlienVault OTX', confidence: 95, lastSeen: '2m ago', tags: ['Botnet', 'Scanner'] },
  { id: 2, indicator: 'a1b2c3d4e5f6...', type: 'SHA-256', source: 'VirusTotal', confidence: 100, lastSeen: '1h ago', tags: ['Ransomware', 'WannaCry'] },
  { id: 3, indicator: 'evil-phishing.com', type: 'Domain', source: 'PhishTank', confidence: 88, lastSeen: '4h ago', tags: ['Phishing', 'Credential Harvest'] },
  { id: 4, indicator: '10.0.0.55', type: 'IP Address', source: 'Internal AI', confidence: 75, lastSeen: '10m ago', tags: ['Lateral Movement'] },
  { id: 5, indicator: 'cmd.exe /c powershell', type: 'Process', source: 'CrowdStrike', confidence: 92, lastSeen: '1d ago', tags: ['Living off the Land'] },
];

const ThreatIntelPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Threat Intelligence Platform</h1>
            <p className="text-gray-400">Global Indicators of Compromise (IOCs) and threat feeds.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="bg-red-500/5 border-red-500/20">
            <h3 className="text-gray-400 text-sm font-bold uppercase">Critical IOCs</h3>
            <p className="text-3xl text-white font-mono font-bold mt-2">1,240</p>
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Shield size={12}/> Blocking Active</p>
        </GlassCard>
        <GlassCard className="bg-blue-500/5 border-blue-500/20">
            <h3 className="text-gray-400 text-sm font-bold uppercase">Feeds Active</h3>
            <p className="text-3xl text-white font-mono font-bold mt-2">12</p>
            <p className="text-xs text-blue-400 mt-1 flex items-center gap-1"><Globe size={12}/> Global Sources</p>
        </GlassCard>
        <GlassCard className="bg-purple-500/5 border-purple-500/20">
            <h3 className="text-gray-400 text-sm font-bold uppercase">Daily Ingest</h3>
            <p className="text-3xl text-white font-mono font-bold mt-2">45K</p>
            <p className="text-xs text-purple-400 mt-1 flex items-center gap-1"><Radar size={12}/> Indicators</p>
        </GlassCard>
      </div>

      <GlassCard title="Global Threat Feed">
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
                        <th className="py-3 px-4"></th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {iocs.map((ioc) => (
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
                                    {ioc.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300 border border-white/10">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-gray-400 font-mono text-xs">{ioc.lastSeen}</td>
                            <td className="py-3 px-4 text-right">
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
