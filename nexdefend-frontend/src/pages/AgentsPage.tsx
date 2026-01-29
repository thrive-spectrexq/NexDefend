import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgents } from '@/api/agents';
import { GlassCard } from '@/components/ui/GlassCard';
import { Server, Shield } from 'lucide-react';

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
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await getAgents();
        setAgents(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch agents", err);
        setError("Failed to load agent fleet. Check API connectivity.");
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
                    onClick={() => navigate(`/agents/${agent.id}`)}
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
    </div>
  );
};

export default AgentsPage;
