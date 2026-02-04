import React, { useEffect, useState } from 'react';
import client from '@/api/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Cloud, Database, AlertTriangle, CheckCircle, RefreshCw, Box as BoxIcon, DollarSign, Map } from 'lucide-react';
import {
    RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

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

const CloudDashboardPage: React.FC = () => {
  const [cloudAssets, setCloudAssets] = useState<CloudAsset[]>([]);
  const [k8sPods, setK8sPods] = useState<K8sPod[]>([]);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [regionData, setRegionData] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const [cloudRes, k8sRes] = await Promise.all([
        client.get('/assets/cloud'),
        client.get('/assets/kubernetes')
      ]);
      setCloudAssets(cloudRes.data || []);
      setK8sPods(k8sRes.data || []);

      // In future, fetch these from API
      setComplianceData([]);
      setCostData([]);
      setRegionData([]);
    } catch (err) {
      console.error("Failed to fetch cloud data", err);
      setCloudAssets([]);
      setK8sPods([]);
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
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Cloud Security Posture</h1>
          <p className="text-gray-400">Multi-cloud visibility (CSPM), cost analysis, and Kubernetes protection.</p>
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
          <GlassCard title="Compliance Score" className="h-[300px] relative">
             {complianceData.length === 0 ? (
                 <div className="flex justify-center items-center h-full text-gray-500">No Compliance Data</div>
             ) : (
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pr-24">
                     <span className="text-3xl font-bold text-white">0%</span>
                     <p className="text-[10px] text-gray-400 uppercase">Avg Score</p>
                </div>
             </div>
             )}
          </GlassCard>

          {/* 2. Asset Summary Stats */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-4">
              <GlassCard className="flex flex-col justify-center h-[300px]">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Cloud size={24}/></div>
                      <span className="text-gray-400 font-bold text-sm">AWS EC2</span>
                  </div>
                  <span className="text-5xl font-mono font-bold text-white mb-2">{cloudAssets.length}</span>
                  <p className="text-xs text-green-400 flex items-center gap-1 mb-4"><CheckCircle size={10}/> Status OK</p>

                  {/* Mini Distribution by State */}
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500" style={{ width: '0%' }} />
                      <div className="h-full bg-gray-500" style={{ width: '0%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>Running</span>
                      <span>Stopped</span>
                  </div>
              </GlassCard>

              <GlassCard className="flex flex-col justify-center h-[300px]">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><BoxIcon size={24}/></div>
                      <span className="text-gray-400 font-bold text-sm">K8s Pods</span>
                  </div>
                  <span className="text-5xl font-mono font-bold text-white mb-2">{k8sPods.length}</span>
                  <p className="text-xs text-red-400 flex items-center gap-1 mb-4"><AlertTriangle size={10}/> Check Logs</p>

                   {/* Mini Distribution by Phase */}
                   <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500" style={{ width: '0%' }} />
                      <div className="h-full bg-red-500" style={{ width: '0%' }} />
                      <div className="h-full bg-yellow-500" style={{ width: '0%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>Run</span>
                      <span>Fail</span>
                      <span>Pend</span>
                  </div>
              </GlassCard>

              <GlassCard className="flex flex-col justify-center h-[300px]">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Database size={24}/></div>
                      <span className="text-gray-400 font-bold text-sm">S3 Buckets</span>
                  </div>
                  <span className="text-5xl font-mono font-bold text-white mb-2">0</span>
                  <p className="text-xs text-yellow-400 flex items-center gap-1 mb-4"><AlertTriangle size={10}/> No Data</p>
                  <button className="mt-auto w-full py-2 text-xs border border-white/10 rounded hover:bg-white/5 transition-colors">
                      Scan Permissions
                  </button>
              </GlassCard>
          </div>
      </div>

      {/* Row 2: Deep Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard title="Cloud Spend & Forecast" icon={<DollarSign size={18} className="text-green-400"/>} className="h-[300px]">
              {costData.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">No Cost Data</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#525252" fontSize={10} />
                      <YAxis stroke="#525252" fontSize={10} />
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                      <Area type="monotone" dataKey="cost" stroke="#22c55e" fillOpacity={1} fill="url(#colorCost)" />
                      <Area type="monotone" dataKey="forecast" stroke="#9ca3af" strokeDasharray="5 5" fill="none" />
                  </AreaChart>
              </ResponsiveContainer>
              )}
          </GlassCard>

          <GlassCard title="Workload Distribution (Region)" icon={<Map size={18} className="text-blue-400"/>} className="h-[300px]">
              {regionData.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">No Region Data</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                          {regionData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'][index % 4]} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
              )}
          </GlassCard>
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
                          {cloudAssets.length === 0 ? (
                              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No AWS Assets Found</td></tr>
                          ) : cloudAssets.map(asset => (
                              <tr key={asset.instance_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 pl-4 font-mono text-orange-300">{asset.name || asset.instance_id}</td>
                                  <td className="p-3 text-gray-400">{asset.type}</td>
                                  <td className="p-3 text-gray-500">{asset.region}</td>
                                  <td className="p-3 text-right">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                          asset.state === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                      }`}>
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
                          {k8sPods.length === 0 ? (
                              <tr><td colSpan={3} className="p-4 text-center text-gray-500">No Pods Found</td></tr>
                          ) : k8sPods.map((pod, i) => (
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
