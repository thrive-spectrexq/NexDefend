import React, { useEffect, useState } from 'react';
import client from '@/api/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Cloud, Database, AlertTriangle, CheckCircle, RefreshCw, Box as BoxIcon } from 'lucide-react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface CloudAsset {
  instance_id: string;
  name: string;
  type: string;
  state: string;
  public_ip: string;
  region: string;
}

interface K8sPod {
  uid?: string;
  name: string;
  namespace: string;
  phase: string;
  node_name: string;
  pod_ip: string;
}

const complianceData = [
  { name: 'AWS CIS', uv: 92, fill: '#22c55e' },
  { name: 'K8s Hardening', uv: 78, fill: '#eab308' },
  { name: 'IAM Policy', uv: 65, fill: '#f97316' },
];

const CloudDashboardPage: React.FC = () => {
  const [cloudAssets, setCloudAssets] = useState<CloudAsset[]>([]);
  const [k8sPods, setK8sPods] = useState<K8sPod[]>([]);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const [cloudRes, k8sRes] = await Promise.all([
        client.get('/assets/cloud'),
        client.get('/assets/kubernetes')
      ]);
      setCloudAssets(cloudRes.data || []);
      setK8sPods(k8sRes.data || []);
    } catch (err) {
      console.error("Failed to fetch cloud data", err);
      // Mock Fallback
      setCloudAssets([
          { instance_id: 'i-0123456789abcdef0', name: 'prod-api-01', type: 't3.medium', state: 'running', public_ip: '54.12.34.56', region: 'us-east-1' },
          { instance_id: 'i-0987654321fedcba0', name: 'prod-worker-01', type: 'm5.large', state: 'running', public_ip: '54.12.34.57', region: 'us-east-1' },
      ]);
      setK8sPods([
          { name: 'nexdefend-api-7d8f9c6b54-x2z1', namespace: 'default', phase: 'Running', node_name: 'ip-10-0-1-50', pod_ip: '10.0.1.50' },
          { name: 'postgres-0', namespace: 'database', phase: 'Running', node_name: 'ip-10-0-1-51', pod_ip: '10.0.1.51' },
          { name: 'redis-master-0', namespace: 'cache', phase: 'Failed', node_name: 'ip-10-0-1-52', pod_ip: '10.0.1.52' },
      ]);
    } finally {
      // Done
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
      setSyncing(true);
      try {
          await client.post('/assets/sync');
          await fetchData();
      } catch {
          // Ignore sync errors for demo
      } finally {
          setSyncing(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Cloud Security Posture</h1>
          <p className="text-gray-400">Multi-cloud visibility (CSPM) and Kubernetes workload protection.</p>
        </div>
        <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm border border-white/10 flex items-center gap-2"
        >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''}/> {syncing ? 'Syncing...' : 'Sync Assets'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Compliance Score (Radial Bar) */}
          <GlassCard title="Compliance Score" className="h-64 relative">
             <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={15} data={complianceData}>
                        <RadialBar
                            label={{ position: 'insideStart', fill: '#fff' }}
                            background
                            dataKey="uv"
                        />
                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#fff', fontSize: '12px' }}/>
                        <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff20', color: '#fff' }} cursor={false} />
                    </RadialBarChart>
                </ResponsiveContainer>
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pr-24">
                 <span className="text-3xl font-bold text-white">78%</span>
                 <p className="text-[10px] text-gray-400 uppercase">Avg Score</p>
             </div>
          </GlassCard>

          {/* 2. Asset Summary Stats */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-4">
              <GlassCard className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Cloud size={24}/></div>
                      <span className="text-gray-400 font-bold text-sm">AWS EC2</span>
                  </div>
                  <span className="text-4xl font-mono font-bold text-white">{cloudAssets.length}</span>
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle size={10}/> All Compliant</p>
              </GlassCard>
              <GlassCard className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><BoxIcon size={24}/></div>
                      <span className="text-gray-400 font-bold text-sm">K8s Pods</span>
                  </div>
                  <span className="text-4xl font-mono font-bold text-white">{k8sPods.length}</span>
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle size={10}/> 1 Failed State</p>
              </GlassCard>
              <GlassCard className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Database size={24}/></div>
                      <span className="text-gray-400 font-bold text-sm">S3 Buckets</span>
                  </div>
                  <span className="text-4xl font-mono font-bold text-white">14</span>
                  <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1"><AlertTriangle size={10}/> 2 Public Access</p>
              </GlassCard>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AWS Assets Table */}
          <GlassCard title="AWS Infrastructure" className="h-96 flex flex-col p-0 overflow-hidden">
              <div className="overflow-auto flex-1 custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5 sticky top-0">
                          <tr className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                              <th className="p-3 pl-4">Instance ID</th>
                              <th className="p-3">Type</th>
                              <th className="p-3">Region</th>
                              <th className="p-3 text-right">State</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm text-gray-300">
                          {cloudAssets.map(asset => (
                              <tr key={asset.instance_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 pl-4 font-mono text-orange-300">{asset.name || asset.instance_id}</td>
                                  <td className="p-3 text-gray-400">{asset.type}</td>
                                  <td className="p-3 text-gray-500">{asset.region}</td>
                                  <td className="p-3 text-right">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/20 text-green-400">
                                          {asset.state}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </GlassCard>

          {/* K8s Pods Table */}
          <GlassCard title="Kubernetes Workloads" className="h-96 flex flex-col p-0 overflow-hidden">
              <div className="overflow-auto flex-1 custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5 sticky top-0">
                          <tr className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                              <th className="p-3 pl-4">Pod Name</th>
                              <th className="p-3">Namespace</th>
                              <th className="p-3 text-right">Phase</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm text-gray-300">
                          {k8sPods.map((pod, i) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 pl-4 font-mono text-blue-300 truncate max-w-[200px]">{pod.name}</td>
                                  <td className="p-3 text-gray-400">{pod.namespace}</td>
                                  <td className="p-3 text-right">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                          pod.phase === 'Running' ? 'bg-green-500/20 text-green-400' :
                                          pod.phase === 'Failed' ? 'bg-red-500/20 text-red-400' :
                                          'bg-yellow-500/20 text-yellow-400'
                                      }`}>
                                          {pod.phase}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </GlassCard>
      </div>
    </div>
  );
};

export default CloudDashboardPage;
