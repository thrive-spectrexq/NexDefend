import { GlassCard } from '../components/ui/GlassCard';
import { ShieldCheck, Lock, Globe, FileCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const frameworks = [
  { name: 'SOC 2 Type II', status: 'Passing', score: 98, icon: ShieldCheck, color: 'text-green-400' },
  { name: 'GDPR', status: 'At Risk', score: 82, icon: Globe, color: 'text-yellow-400' },
  { name: 'ISO 27001', status: 'Passing', score: 95, icon: FileCheck, color: 'text-green-400' },
  { name: 'PCI DSS', status: 'Failing', score: 65, icon: Lock, color: 'text-red-400' },
];

const controls = [
  { id: 'AC-1', name: 'Access Control Policy', framework: 'SOC 2', status: 'pass', evidence: 'Link' },
  { id: 'CM-2', name: 'Baseline Configuration', framework: 'ISO 27001', status: 'pass', evidence: 'Link' },
  { id: 'IA-5', name: 'Authenticator Management', framework: 'PCI DSS', status: 'fail', evidence: 'Missing MFA on 12 nodes' },
  { id: 'SC-8', name: 'Transmission Integrity', framework: 'GDPR', status: 'pass', evidence: 'Link' },
  { id: 'SI-3', name: 'Malicious Code Protection', framework: 'SOC 2', status: 'pass', evidence: 'Link' },
];

const CompliancePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Compliance Command Center</h1>
          <p className="text-gray-400">Real-time governance against global security standards.</p>
        </div>
        <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono text-sm border border-cyan-500/30">
            Generate Audit Report
        </button>
      </div>

      {/* Framework Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {frameworks.map((fw) => (
          <GlassCard key={fw.name} className="relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-white/5 ${fw.color}`}>
                <fw.icon size={24} />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                fw.status === 'Passing' ? 'bg-green-500/10 text-green-400' :
                fw.status === 'At Risk' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                {fw.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{fw.name}</h3>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-mono font-bold text-white">{fw.score}%</span>
                <span className="text-xs text-gray-500 mb-1">Compliance Score</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${
                        fw.score > 90 ? 'bg-green-500' : fw.score > 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${fw.score}%` }}
                />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Failing Controls List */}
          <GlassCard title="Critical Gaps" icon={<AlertTriangle className="h-5 w-5 text-red-400"/>} className="lg:col-span-2">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-4">Control ID</th>
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Framework</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {controls.map((control) => (
                            <tr key={control.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 font-mono text-cyan-400">{control.id}</td>
                                <td className="py-3 px-4 text-white font-medium">{control.name}</td>
                                <td className="py-3 px-4 text-gray-400">{control.framework}</td>
                                <td className="py-3 px-4">
                                    {control.status === 'pass' ? (
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle size={14} /> <span className="text-xs font-bold">PASS</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-400">
                                            <XCircle size={14} /> <span className="text-xs font-bold">FAIL</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-gray-400 truncate max-w-[200px]">{control.evidence}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </GlassCard>

          {/* Automated Checks Stats */}
          <GlassCard title="Automated Verification">
             <div className="space-y-6 mt-2">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Endpoint Encryption</span>
                        <span className="text-green-400 font-mono">92%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[92%] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">MFA Adoption</span>
                        <span className="text-yellow-400 font-mono">75%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 w-[75%]" />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Patch Level (Critical)</span>
                        <span className="text-red-400 font-mono">68%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[68%]" />
                    </div>
                </div>
             </div>

             <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                    <span className="font-bold">Recommendation:</span> Enforce OS updates on 42 endpoints to improve Patch Level compliance.
                </p>
             </div>
          </GlassCard>
      </div>
    </div>
  );
};

export default CompliancePage;
