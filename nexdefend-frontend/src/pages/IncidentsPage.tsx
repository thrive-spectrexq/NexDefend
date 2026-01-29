import { useEffect, useState } from 'react';
import { getIncidents } from '@/api/alerts';
import { GlassCard } from '../components/ui/GlassCard';
import { RightDrawer } from '../components/ui/RightDrawer';
import {
    AlertTriangle, Clock,
    ChevronRight, Terminal, Activity, Zap, Sparkles, Server, User, CheckCircle
} from 'lucide-react';

interface Incident {
  id: number;
  description: string;
  severity: string;
  assigned_to: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setIncidents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch incidents", err);
        // Fallback mock data if API fails (for demo purposes)
        setIncidents([
            { id: 2091, description: 'Suspicious PowerShell Execution', severity: 'Critical', assigned_to: 'Unassigned', status: 'Open', created_at: new Date().toISOString() },
            { id: 2092, description: 'Potential Brute Force: SSH', severity: 'High', assigned_to: 'admin', status: 'In Progress', created_at: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Incidents Management</h1>
          <p className="text-gray-400">Track and respond to security incidents with AI-driven insights.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20 flex items-center gap-2">
                <AlertTriangle size={12} /> {incidents.filter(i => i.severity === 'Critical' || i.severity === 'High').length} CRITICAL
            </span>
        </div>
      </div>

      <GlassCard className="min-h-[500px]">
        {loading ? (
            <div className="flex justify-center items-center h-48 text-cyan-400">Loading Incidents...</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="py-4 px-4 pl-6">ID</th>
                            <th className="py-4 px-4">Severity</th>
                            <th className="py-4 px-4 w-1/3">Description</th>
                            <th className="py-4 px-4">Assignee</th>
                            <th className="py-4 px-4">Status</th>
                            <th className="py-4 px-4">Time</th>
                            <th className="py-4 px-4"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {incidents.map((incident) => (
                            <tr
                                key={incident.id}
                                onClick={() => setSelectedIncident(incident)}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                <td className="py-4 px-4 pl-6 font-mono text-cyan-400">INC-{incident.id}</td>
                                <td className="py-4 px-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        (incident.severity || '').toLowerCase() === 'critical' ? 'bg-red-500/20 text-red-400' :
                                        (incident.severity || '').toLowerCase() === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {incident.severity}
                                    </span>
                                </td>
                                <td className="py-4 px-4 font-medium text-white group-hover:text-cyan-300 transition-colors">
                                    {incident.description}
                                </td>
                                <td className="py-4 px-4 text-gray-400 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">
                                        {(incident.assigned_to || '?').charAt(0).toUpperCase()}
                                    </div>
                                    {incident.assigned_to}
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`flex items-center gap-1.5 ${
                                        incident.status === 'Open' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            incident.status === 'Open' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`} />
                                        {incident.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-gray-500 text-xs font-mono">
                                    {new Date(incident.created_at).toLocaleTimeString()}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </GlassCard>

      {/* Drill-Down Drawer */}
      <RightDrawer
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={`Incident Details: INC-${selectedIncident?.id}`}
        width="w-[600px]"
      >
        {selectedIncident && (
            <div className="space-y-8">
                {/* 1. Header Context */}
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} /> {selectedIncident.severity.toUpperCase()} SEVERITY
                    </h3>
                    <p className="text-white text-lg font-medium">{selectedIncident.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-400 font-mono">
                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(selectedIncident.created_at).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Activity size={14}/> Status: {selectedIncident.status}</span>
                    </div>
                </div>

                {/* Contextual Asset Intelligence */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Server size={10}/> Involved Host</p>
                        <p className="text-cyan-300 font-mono text-sm">PROD-WEB-01</p>
                        <p className="text-gray-500 text-xs">192.168.1.105</p>
                    </div>
                     <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><User size={10}/> Owner</p>
                        <p className="text-white font-mono text-sm">Jane Doe (DevOps)</p>
                        <p className="text-red-400 text-xs">3 Critical Vulns</p>
                    </div>
                </div>

                {/* Unified Timeline (Activity Stream) */}
                <div>
                     <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity size={14} /> Activity Stream
                    </h4>
                    <div className="space-y-4 pl-2 border-l border-white/10 ml-2">
                        {[
                            { time: '10:42:05', type: 'AI_INSIGHT', msg: 'Pattern matches Cobalt Strike Beacon', icon: Sparkles, color: 'text-purple-400' },
                            { time: '10:42:01', type: 'NETWORK', msg: 'Outbound connection to 45.33.2.1 (Malicious)', icon: Activity, color: 'text-red-400' },
                            { time: '10:41:55', type: 'PROCESS', msg: 'Powershell.exe spawned by cmd.exe', icon: Terminal, color: 'text-yellow-400' },
                        ].map((item, i) => (
                            <div key={i} className="relative pl-6">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-black border-2 ${item.color.replace('text', 'border')} flex items-center justify-center`}>
                                   <div className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text', 'bg')}`} />
                                </div>
                                <p className="text-[10px] text-gray-500 font-mono mb-0.5">{item.time}</p>
                                <p className="text-gray-300 text-sm">{item.msg}</p>
                                <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold ${item.color}`}>
                                    <item.icon size={10} /> {item.type}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Remediation (One-Click SOAR) */}
                <div>
                    <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap size={14} /> AI Recommended Response
                    </h4>
                    <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5 hover:border-cyan-500/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">1</div>
                                <div>
                                    <span className="text-gray-300 group-hover:text-white block font-medium">Isolate Host</span>
                                    <span className="text-gray-500 text-xs">Block all non-management traffic</span>
                                </div>
                            </div>
                            <button className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded shadow-[0_0_10px_rgba(239,68,68,0.4)] transition-all transform active:scale-95">
                                EXECUTE
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5 hover:border-cyan-500/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs">2</div>
                                <div>
                                    <span className="text-gray-300 group-hover:text-white block font-medium">Revoke Token</span>
                                    <span className="text-gray-500 text-xs">Invalidate active sessions for user</span>
                                </div>
                            </div>
                            <button className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded shadow-[0_0_10px_rgba(249,115,22,0.4)] transition-all transform active:scale-95">
                                EXECUTE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Raw Log Data */}
                <div>
                     <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Terminal size={14} /> Raw Event Log
                    </h4>
                    <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                        <pre>{JSON.stringify({
                            event_id: 48102,
                            timestamp: selectedIncident.created_at,
                            source_ip: "192.168.1.105",
                            dest_ip: "10.0.0.5",
                            protocol: "TCP",
                            payload: "powershell.exe -enc ZWNobyAnaGVsbG8n...",
                            user: "NT AUTHORITY\\SYSTEM"
                        }, null, 2)}</pre>
                    </div>
                </div>
            </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default IncidentsPage;
