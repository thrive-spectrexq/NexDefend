import React, { useEffect, useState } from 'react';
import { getAgents } from '@/api/agents';
import { GlassCard } from '@/components/ui/GlassCard';
import { RightDrawer } from '@/components/ui/RightDrawer';
import { Server, Shield, Cpu, Activity, HardDrive, Network, Power, Lock, Terminal } from 'lucide-react';

interface Agent {
  id: number;
  hostname: string;
  ip_address: string;
  os_version: string;
  agent_version: string;
  status: string;
  last_heartbeat: string;
  [key: string]: unknown;
}

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await getAgents();
        setAgents(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch agents", err);
        setAgents([]);
        setError("Failed to load agents. Please check connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) return <div className="p-10 text-center text-cyan-400 font-mono animate-pulse">Scanning Network...</div>;
  if (error) return <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-400 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="text-cyan-400 w-8 h-8" />
          <h1 className="text-2xl font-bold font-mono text-white">Agent Fleet Command</h1>
        </div>
        <div className="flex gap-4 text-sm font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-400">Online: <span className="text-white font-bold">{agents.filter(a => a.status === 'active').length}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-400">Offline: <span className="text-white font-bold">{agents.filter(a => a.status !== 'active').length}</span></span>
          </div>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-mono border-b border-white/10">
              <th className="p-4">Hostname</th>
              <th className="p-4">IP Address</th>
              <th className="p-4">OS Version</th>
              <th className="p-4">Agent Ver.</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Last Heartbeat</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono text-gray-300 divide-y divide-white/5">
            {agents.map((agent) => (
              <tr
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className="hover:bg-cyan-500/5 cursor-pointer transition-colors group"
              >
                <td className="p-4 font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-600 group-hover:text-cyan-500" />
                  {agent.hostname}
                </td>
                <td className="p-4 text-gray-400">{agent.ip_address}</td>
                <td className="p-4 text-gray-400">{agent.os_version}</td>
                <td className="p-4 text-gray-500">{agent.agent_version}</td>
                <td className="p-4">
                  {agent.status === 'active' ? (
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-green-400 font-bold text-xs uppercase">Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-red-400 font-bold text-xs uppercase">Offline</span>
                    </div>
                  )}
                </td>
                <td className="p-4 text-right text-gray-500 text-xs">
                  {agent.last_heartbeat ? new Date(agent.last_heartbeat).toLocaleString() : 'Never'}
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500 italic">No agents deployed. Waiting for uplink...</td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      {/* Agent Detail Drawer with Active Response */}
      <RightDrawer
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        title={`Endpoint: ${selectedAgent?.hostname}`}
        width="w-[500px]"
      >
        {selectedAgent && (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedAgent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold">{selectedAgent.ip_address}</h3>
                <p className="text-sm text-gray-400">{selectedAgent.os_version}</p>
              </div>
            </div>

            {/* Health Metrics (Mocked for drill-down) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Cpu size={14} /> CPU Usage</div>
                <div className="text-xl font-mono text-white font-bold">12%</div>
                <div className="h-1 bg-gray-700 rounded-full mt-2"><div className="w-[12%] bg-cyan-500 h-full rounded-full" /></div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Activity size={14} /> Memory</div>
                <div className="text-xl font-mono text-white font-bold">4.2 GB</div>
                <div className="h-1 bg-gray-700 rounded-full mt-2"><div className="w-[45%] bg-blue-500 h-full rounded-full" /></div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><HardDrive size={14} /> Disk</div>
                <div className="text-xl font-mono text-white font-bold">128 GB</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Network size={14} /> Network</div>
                <div className="text-xl font-mono text-white font-bold">1.2 Mb/s</div>
              </div>
            </div>

            {/* Active Response Actions */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-red-400 font-bold uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                <Lock size={14} /> Active Response
              </h4>
              <div className="space-y-3">
                <button className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-between group">
                  <span className="font-bold flex items-center gap-2"><Network size={16} /> Isolate Host</span>
                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">CONFIRM</span>
                </button>
                <button className="w-full p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg transition-colors flex items-center justify-between group">
                  <span className="font-bold flex items-center gap-2"><Terminal size={16} /> Kill Process</span>
                  <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
                </button>
                <button className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg transition-colors flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2"><Power size={16} /> Reboot System</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
};

export default AgentsPage;
