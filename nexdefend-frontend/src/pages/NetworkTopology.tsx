import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getTopology } from '../api/apiClient';
import { Server, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

// --- Custom Node Component ---
const AssetNode = ({ data }: { data: any }) => {
  const isOnline = data.status === 'online';
  const isCompromised = data.status === 'compromised';

  return (
    <div className={cn(
      "min-w-[180px] bg-surface border-2 rounded-lg p-3 shadow-lg transition-all",
      isCompromised ? "border-red-500 shadow-red-500/20" :
      isOnline ? "border-brand-blue shadow-brand-blue/20" : "border-text-muted"
    )}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "p-2 rounded-full",
          isCompromised ? "bg-red-500/20 text-red-500" : "bg-brand-blue/20 text-brand-blue"
        )}>
          <Server size={20} />
        </div>
        <div>
            <div className="font-bold text-text text-sm">{data.label}</div>
            <div className="text-xs text-text-muted">{data.ip}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-surface-highlight pt-2 mt-1">
        <span className="text-xs text-text-muted">{data.os}</span>
        {isCompromised ? (
             <Shield size={14} className="text-red-500" />
        ) : (
             <div className="w-2 h-2 rounded-full bg-brand-green shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  assetNode: AssetNode,
};

export default function NetworkTopology() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await getTopology();

      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (error) {
      console.error("Failed to fetch topology", error);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchData();
    // Refresh topology every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
      return <div className="p-8 text-text">Loading Network Graph...</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-surface-darker">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#334155" gap={20} />
        <Controls className="bg-surface border-surface-highlight text-text fill-text" />
      </ReactFlow>
    </div>
  );
}
