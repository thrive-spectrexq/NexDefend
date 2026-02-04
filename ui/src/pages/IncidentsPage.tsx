import { useEffect, useState } from 'react';
import { incidentsApi, type Incident } from '../api/incidents';
import { GlassCard } from '../components/ui/GlassCard';
import { RightDrawer } from '../components/ui/RightDrawer';
import {
    AlertTriangle, Clock,
    ChevronRight, Zap, Activity, Server, User, Sparkles
} from 'lucide-react';

const IncidentsPage = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const data = await incidentsApi.getAll();
                // Backend returns the list directly or wrapped? incidentsApi.getAll returns response.data which is Incident[]
                setIncidents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch incidents", err);
                setIncidents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchIncidents();
    }, []);

    const handleAnalyze = async () => {
        if (!selectedIncident) return;
        setAnalyzing(true);
        setAiAnalysis(null);
        try {
            const result = await incidentsApi.analyze(selectedIncident.ID);
            // Result is expected to be { response: string } or similar depending on the python output proxy
            // The Go handler proxies the body directly. The Python handler returns { "response": "..." }
            // So result should be object with response field if we typed it correctly in incidents.ts
            // incidents.ts analyze returns { response: string }
            setAiAnalysis(result.response);
        } catch (e) {
            console.error("AI Analysis failed", e);
            setAiAnalysis("Failed to generate analysis. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    // Reset analysis when selecting a new incident
    useEffect(() => {
        setAiAnalysis(null);
        setAnalyzing(false);
    }, [selectedIncident]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Incidents Management</h1>
                    <p className="text-gray-400">Track and respond to security incidents with AI-driven insights.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold border border-red-500/20 flex items-center gap-2">
                        <AlertTriangle size={12} /> {incidents.filter(i => i.Severity === 'Critical' || i.Severity === 'High').length} CRITICAL
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
                                        key={incident.ID}
                                        onClick={() => setSelectedIncident(incident)}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <td className="py-4 px-4 pl-6 font-mono text-cyan-400">INC-{incident.ID}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${(incident.Severity || '').toLowerCase() === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                (incident.Severity || '').toLowerCase() === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {incident.Severity}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 font-medium text-white group-hover:text-cyan-300 transition-colors">
                                            {incident.Description}
                                        </td>
                                        <td className="py-4 px-4 text-gray-400 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">
                                                {(incident.AssignedTo || '?').charAt(0).toUpperCase()}
                                            </div>
                                            {incident.AssignedTo}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`flex items-center gap-1.5 ${incident.Status === 'Open' ? 'text-red-400' : 'text-yellow-400'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${incident.Status === 'Open' ? 'bg-red-500' : 'bg-yellow-500'
                                                    }`} />
                                                {incident.Status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-500 text-xs font-mono">
                                            {new Date(incident.CreatedAt).toLocaleTimeString()}
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
                title={`Incident Details: INC-${selectedIncident?.ID}`}
                width="w-[600px]"
            >
                {selectedIncident && (
                    <div className="space-y-8">
                        {/* 1. Header Context */}
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                                <AlertTriangle size={18} /> {selectedIncident.Severity.toUpperCase()} SEVERITY
                            </h3>
                            <p className="text-white text-lg font-medium">{selectedIncident.Description}</p>
                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400 font-mono">
                                <span className="flex items-center gap-1"><Clock size={14} /> {new Date(selectedIncident.CreatedAt).toLocaleString()}</span>
                                <span className="flex items-center gap-1"><Activity size={14} /> Status: {selectedIncident.Status}</span>
                            </div>
                        </div>

                        {/* Contextual Asset Intelligence - Placeholder for now as Incident struct is simple */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Server size={10} /> Involved Host</p>
                                <p className="text-cyan-300 font-mono text-sm">{selectedIncident.AssignedTo ? "Managed Host" : "Unknown Host"}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><User size={10} /> Owner</p>
                                <p className="text-white font-mono text-sm">{selectedIncident.AssignedTo || "Unassigned"}</p>
                            </div>
                        </div>

                        {/* AI Remediation (One-Click SOAR) */}
                        <div>
                            <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Zap size={14} /> AI Analysis & Remediation
                            </h4>

                            {!aiAnalysis && !analyzing && (
                                <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-6 text-center">
                                    <p className="text-gray-400 mb-4">Run NexDefend AI to analyze logs and suggest remediation steps.</p>
                                    <button
                                        onClick={handleAnalyze}
                                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-2 mx-auto transition-all"
                                    >
                                        <Sparkles size={16} /> Analyze Incident
                                    </button>
                                </div>
                            )}

                            {analyzing && (
                                <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-6 text-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p className="text-cyan-400 animate-pulse">Consulting Neural Network...</p>
                                </div>
                            )}

                            {aiAnalysis && (
                                <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-6 whitespace-pre-wrap text-sm text-cyan-100 font-mono">
                                    {aiAnalysis}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default IncidentsPage;
