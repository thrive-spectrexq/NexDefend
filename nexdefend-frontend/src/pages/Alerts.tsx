import { PageTransition } from '../components/common/PageTransition';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Alerts() {
  const alerts = [
    { id: 'ALT-001', type: 'Intrusion Attempt', severity: 'Critical', source: '192.168.1.105', time: '2 mins ago', status: 'Open' },
    { id: 'ALT-002', type: 'Malware Download', severity: 'High', source: 'HR-PC-02', time: '15 mins ago', status: 'Investigating' },
    { id: 'ALT-003', type: 'Port Scan', severity: 'Medium', source: 'External IP', time: '1 hour ago', status: 'Resolved' },
    { id: 'ALT-004', type: 'Failed Login', severity: 'Low', source: 'Admin Console', time: '3 hours ago', status: 'Resolved' },
  ];

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            <ShieldAlert className="text-brand-red" />
            Security Alerts
        </h1>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-brand-blue/10 text-brand-blue rounded hover:bg-brand-blue/20 text-sm font-semibold">
                Export CSV
            </button>
            <button className="px-4 py-2 bg-brand-red text-background rounded hover:bg-brand-red/90 text-sm font-semibold">
                Triage All
            </button>
        </div>
      </div>

      <div className="bg-surface border border-surface-highlight rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="text-text-muted font-mono bg-surface-highlight/20 border-b border-surface-highlight">
                <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-surface-highlight font-mono">
                {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-surface-highlight/10 transition-colors">
                        <td className="px-6 py-4 text-text-muted">{alert.id}</td>
                        <td className="px-6 py-4 font-semibold text-text">{alert.type}</td>
                        <td className="px-6 py-4">
                            <span className={cn(
                                "px-2 py-1 rounded text-xs font-bold uppercase",
                                alert.severity === 'Critical' ? "bg-brand-red/20 text-brand-red" :
                                alert.severity === 'High' ? "bg-brand-orange/20 text-brand-orange" :
                                alert.severity === 'Medium' ? "bg-brand-blue/20 text-brand-blue" :
                                "bg-brand-green/20 text-brand-green"
                            )}>
                                {alert.severity}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-text">{alert.source}</td>
                        <td className="px-6 py-4 text-text-muted flex items-center gap-2">
                            <Clock size={14} />
                            {alert.time}
                        </td>
                        <td className="px-6 py-4">
                            <span className={cn("flex items-center gap-2",
                                alert.status === 'Open' ? "text-brand-red" :
                                alert.status === 'Resolved' ? "text-brand-green" : "text-brand-orange"
                            )}>
                                {alert.status === 'Open' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                {alert.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-brand-blue hover:underline">View</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </PageTransition>
  )
}
