import { useEffect, useState } from 'react';
import { getVulnerabilities } from '@/api/vulnerabilities';
import { GlassCard } from '@/components/ui/GlassCard';
import { RightDrawer } from '@/components/ui/RightDrawer';
import { ShieldAlert, CheckCircle, AlertTriangle, Bug, PenTool } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Vulnerability {
  id: number;
  title: string;
  package_name: string;
  severity: string;
  description: string;
  status: string;
  discovered_at: string;
  [key: string]: unknown;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6']; // Red, Orange, Yellow, Blue

const VulnerabilitiesPage: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

  // Mock Stats
  const stats = [
      { name: 'Critical', value: vulnerabilities.filter(v => v.severity.toLowerCase() === 'critical').length },
      { name: 'High', value: vulnerabilities.filter(v => v.severity.toLowerCase() === 'high').length },
      { name: 'Medium', value: vulnerabilities.filter(v => v.severity.toLowerCase() === 'medium').length },
      { name: 'Low', value: vulnerabilities.filter(v => v.severity.toLowerCase() === 'low').length },
  ];

  useEffect(() => {
    const fetchVulns = async () => {
      try {
        // Race against timeout to ensure UI renders in demo mode if backend is down
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000));
        const data = await Promise.race([getVulnerabilities(), timeoutPromise]);
        setVulnerabilities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch vulnerabilities (or timeout)", err);
        // Fallback Mock Data
        setVulnerabilities([
            { id: 1, title: 'CVE-2023-44487', package_name: 'nginx', severity: 'Critical', description: 'HTTP/2 Rapid Reset Attack allowing DoS.', status: 'Active', discovered_at: new Date().toISOString() },
            { id: 2, title: 'CVE-2021-44228', package_name: 'log4j-core', severity: 'Critical', description: 'Remote Code Execution (RCE) via JNDI injection.', status: 'Patched', discovered_at: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, title: 'CVE-2022-42889', package_name: 'commons-text', severity: 'High', description: 'Variable interpolation RCE.', status: 'Active', discovered_at: new Date().toISOString() },
            { id: 4, title: 'CVE-2023-0286', package_name: 'openssl', severity: 'Medium', description: 'Type confusion vulnerability.', status: 'Active', discovered_at: new Date().toISOString() },
        ]);
      }
    };
    fetchVulns();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Vulnerability Scanner</h1>
          <p className="text-gray-400">Automated CVE detection and patch management.</p>
        </div>
        <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono text-sm border border-cyan-500/30">
            Run Full Scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Stats Overview */}
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
               <GlassCard className="bg-red-500/5 border-red-500/20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-red-400">
                        <ShieldAlert size={20}/> <span className="font-bold text-sm uppercase">Critical Risk</span>
                    </div>
                    <span className="text-4xl font-mono font-bold text-white">{stats[0].value}</span>
                    <span className="text-xs text-gray-400 mt-1">Immediate Action Required</span>
               </GlassCard>
               <GlassCard className="bg-green-500/5 border-green-500/20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                        <CheckCircle size={20}/> <span className="font-bold text-sm uppercase">Patched (24h)</span>
                    </div>
                    <span className="text-4xl font-mono font-bold text-white">12</span>
                    <span className="text-xs text-gray-400 mt-1">System Hardening Active</span>
               </GlassCard>
               <GlassCard className="bg-blue-500/5 border-blue-500/20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Bug size={20}/> <span className="font-bold text-sm uppercase">Total Detected</span>
                    </div>
                    <span className="text-4xl font-mono font-bold text-white">{vulnerabilities.length}</span>
                    <span className="text-xs text-gray-400 mt-1">Across 42 Assets</span>
               </GlassCard>
          </div>

          {/* 2. Donut Chart */}
          <GlassCard className="relative min-h-[160px]">
              <div className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase">Severity Distribution</div>
              <div className="w-full h-40 mt-8 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {stats.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
              </div>
          </GlassCard>
      </div>

      {/* 3. Vulnerability List */}
      <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-mono border-b border-white/10">
                <th className="p-4 pl-6">CVE ID</th>
                <th className="p-4">Package</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Detected</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300 divide-y divide-white/5">
              {vulnerabilities.map((vuln) => (
                <tr
                    key={vuln.id}
                    onClick={() => setSelectedVuln(vuln)}
                    className="hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <td className="p-4 pl-6 font-mono font-bold text-cyan-400 group-hover:underline">{vuln.title}</td>
                  <td className="p-4 font-mono text-gray-400">{vuln.package_name}</td>
                  <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        vuln.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        vuln.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                          {vuln.severity}
                      </span>
                  </td>
                  <td className="p-4 text-gray-400 max-w-md truncate">{vuln.description}</td>
                  <td className="p-4">
                      {vuln.status === 'Patched' ? (
                          <span className="text-green-400 flex items-center gap-1 text-xs font-bold"><CheckCircle size={12}/> PATCHED</span>
                      ) : (
                          <span className="text-red-400 flex items-center gap-1 text-xs font-bold"><AlertTriangle size={12}/> ACTIVE</span>
                      )}
                  </td>
                  <td className="p-4 text-right text-gray-500 text-xs font-mono">
                      {new Date(vuln.discovered_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </GlassCard>

      {/* Drill-Down Drawer */}
      <RightDrawer
        isOpen={!!selectedVuln}
        onClose={() => setSelectedVuln(null)}
        title={selectedVuln?.title || 'Details'}
        width="w-[500px]"
      >
        {selectedVuln && (
            <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${
                    selectedVuln.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Bug size={18} className={selectedVuln.severity === 'Critical' ? 'text-red-400' : 'text-blue-400'}/>
                        <span className={`font-bold ${selectedVuln.severity === 'Critical' ? 'text-red-400' : 'text-blue-400'}`}>
                            {selectedVuln.package_name}
                        </span>
                    </div>
                    <p className="text-white text-lg font-medium leading-snug">{selectedVuln.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/40 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-500 uppercase mb-1">CVSS Score</p>
                        <p className="text-2xl font-mono font-bold text-white">9.8</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-500 uppercase mb-1">Vector</p>
                        <p className="text-sm font-mono text-gray-300 mt-1">NETWORK/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Remediation Plan</h4>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                         <div className="flex items-start gap-3">
                             <CheckCircle className="text-green-400 mt-1" size={18} />
                             <div>
                                 <h5 className="text-green-400 font-bold text-sm">Upgrade Package</h5>
                                 <p className="text-gray-300 text-sm mt-1">Update <span className="font-mono text-white bg-white/10 px-1 rounded">{selectedVuln.package_name}</span> to version <span className="font-mono text-white bg-white/10 px-1 rounded">latest</span>.</p>
                             </div>
                         </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                    <button className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                        <PenTool size={18} /> Patch Now via Ansible
                    </button>
                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-colors border border-white/10">
                        Create Jira Ticket
                    </button>
                </div>
            </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default VulnerabilitiesPage;
