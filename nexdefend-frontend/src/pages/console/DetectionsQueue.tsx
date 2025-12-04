import {
    MoreHorizontal,
    User,
    Clock,
    Monitor,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useState } from 'react';

// Mock Data
const detections = [
    {
        id: 'DET-1024',
        severity: 'Critical',
        tactic: 'Ransomware',
        technique: 'T1486',
        host: 'FIN-WS-004',
        user: 'j.doe',
        timestamp: '2023-10-24 14:32:01',
        status: 'New'
    },
    {
        id: 'DET-1023',
        severity: 'High',
        tactic: 'Credential Access',
        technique: 'T1003',
        host: 'HR-LAPTOP-02',
        user: 'SYSTEM',
        timestamp: '2023-10-24 14:15:22',
        status: 'Investigating'
    },
    {
        id: 'DET-1022',
        severity: 'Medium',
        tactic: 'Execution',
        technique: 'T1059',
        host: 'DEV-SRV-01',
        user: 'admin',
        timestamp: '2023-10-24 13:45:10',
        status: 'Resolved'
    },
    {
        id: 'DET-1021',
        severity: 'Low',
        tactic: 'Discovery',
        technique: 'T1082',
        host: 'MKT-MAC-05',
        user: 's.smith',
        timestamp: '2023-10-24 12:10:05',
        status: 'Resolved'
    },
    {
        id: 'DET-1020',
        severity: 'Critical',
        tactic: 'Exfiltration',
        technique: 'T1041',
        host: 'DB-PROD-01',
        user: 'postgres',
        timestamp: '2023-10-24 11:55:00',
        status: 'Active'
    },
];

const severityColors: Record<string, string> = {
    'Critical': 'text-brand-red bg-brand-red/10 border-brand-red/20',
    'High': 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
    'Medium': 'text-brand-blue bg-brand-blue/10 border-brand-blue/20',
    'Low': 'text-brand-green bg-brand-green/10 border-brand-green/20',
};

export default function DetectionsQueue() {
    const navigate = useNavigate();
    const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const filteredDetections = detections.filter(det => {
        if (filterSeverity && det.severity !== filterSeverity) return false;
        if (filterStatus && det.status !== filterStatus) return false;
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-text">Detections Queue</h1>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded hover:bg-brand-blue/20 text-sm font-medium transition-colors">
                        Export CSV
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "px-3 py-1.5 border rounded text-sm font-medium transition-colors flex items-center gap-2",
                            showFilters || filterSeverity || filterStatus
                                ? "bg-surface-highlight text-text border-brand-blue/50"
                                : "bg-surface text-text border-surface-highlight hover:bg-surface-highlight"
                        )}
                    >
                        <Filter size={16} />
                        Filter View
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-surface border border-surface-highlight rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">Severity</label>
                        <div className="flex flex-wrap gap-2">
                            {['Critical', 'High', 'Medium', 'Low'].map(sev => (
                                <button
                                    key={sev}
                                    onClick={() => setFilterSeverity(filterSeverity === sev ? null : sev)}
                                    className={cn(
                                        "px-2 py-1 rounded text-xs border transition-colors",
                                        filterSeverity === sev
                                            ? severityColors[sev]
                                            : "bg-background border-surface-highlight text-text-muted hover:text-text"
                                    )}
                                >
                                    {sev}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">Status</label>
                        <div className="flex flex-wrap gap-2">
                            {['New', 'Active', 'Investigating', 'Resolved'].map(stat => (
                                <button
                                    key={stat}
                                    onClick={() => setFilterStatus(filterStatus === stat ? null : stat)}
                                    className={cn(
                                        "px-2 py-1 rounded text-xs border transition-colors",
                                        filterStatus === stat
                                            ? "bg-brand-blue/20 text-brand-blue border-brand-blue/50"
                                            : "bg-background border-surface-highlight text-text-muted hover:text-text"
                                    )}
                                >
                                    {stat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-end justify-end">
                        <button
                            onClick={() => { setFilterSeverity(null); setFilterStatus(null); }}
                            className="text-xs text-text-muted hover:text-text underline decoration-dotted"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-surface border border-surface-highlight rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-surface-highlight/50 border-b border-surface-highlight text-text-muted font-medium">
                            <th className="px-4 py-3">Severity</th>
                            <th className="px-4 py-3">Tactic / Technique</th>
                            <th className="px-4 py-3">Host</th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-highlight">
                        {filteredDetections.length > 0 ? filteredDetections.map((det) => (
                            <tr
                                key={det.id}
                                className="group hover:bg-surface-highlight/30 transition-colors cursor-pointer"
                                onClick={() => navigate('/dashboard/investigate')}
                            >
                                <td className="px-4 py-3">
                                    <span className={cn("px-2 py-1 rounded-full text-xs font-mono font-semibold border", severityColors[det.severity])}>
                                        {det.severity.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-text font-medium">{det.tactic}</span>
                                        <span className="text-text-muted text-xs font-mono">{det.technique}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 text-brand-blue">
                                        <Monitor size={14} />
                                        <span className="font-mono">{det.host}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <User size={14} />
                                        <span>{det.user}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 text-text-muted font-mono text-xs">
                                        <Clock size={14} />
                                        <span>{det.timestamp}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        "text-xs font-medium",
                                        det.status === 'New' ? 'text-brand-blue' :
                                        det.status === 'Active' ? 'text-brand-red' :
                                        'text-text-muted'
                                    )}>
                                        {det.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="p-1 text-text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-text-muted italic">
                                    No detections found matching filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
