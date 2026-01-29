import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import {
    Zap, Shield, Mail, Server, Plus,
    Settings, Play, Save, Layout
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Node Types
const NODE_TYPES = [
    { type: 'Trigger', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    { type: 'Condition', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { type: 'Action', icon: Server, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { type: 'Notification', icon: Mail, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
];

const PlaybooksPage = () => {
  const [nodes] = useState([
      { id: 1, type: 'Trigger', label: 'Alert: High Severity', x: 100, y: 100 },
      { id: 2, type: 'Condition', label: 'Is Source External?', x: 400, y: 100 },
      { id: 3, type: 'Action', label: 'Isolate Host', x: 700, y: 50 },
      { id: 4, type: 'Notification', label: 'Slack: SOC Channel', x: 700, y: 180 },
  ]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Automation Playbooks</h1>
          <p className="text-gray-400">Drag-and-drop SOAR workflow builder.</p>
        </div>
        <div className="flex gap-3">
             <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm border border-white/10 flex items-center gap-2">
                <Save size={16}/> Save Workflow
             </button>
             <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-mono text-sm border border-green-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <Play size={16}/> Test Run
            </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar Toolkit */}
        <GlassCard className="w-64 flex flex-col gap-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Toolkit</h3>
            <div className="space-y-3">
                {NODE_TYPES.map((node) => (
                    <div
                        key={node.type}
                        className={`p-3 rounded-lg border ${node.border} ${node.bg} cursor-grab active:cursor-grabbing hover:brightness-110 transition-all flex items-center gap-3`}
                        draggable
                    >
                        <node.icon size={18} className={node.color} />
                        <span className="text-gray-200 text-sm font-bold">{node.type}</span>
                    </div>
                ))}
            </div>
            <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xs font-bold text-gray-400 mb-2">Tips</h4>
                <p className="text-xs text-gray-500">
                    Connect nodes by dragging from output ports. Right-click to configure node parameters.
                </p>
            </div>
        </GlassCard>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-[#09090b] rounded-2xl border border-white/10 overflow-hidden"
             style={{
                 backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
             }}>

            {/* SVG Connections Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
                    </marker>
                </defs>
                {/* Mock Connections */}
                <path d="M 280 135 C 340 135, 340 135, 400 135" stroke="#4b5563" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 580 135 C 640 135, 640 85, 700 85" stroke="#4b5563" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <path d="M 580 135 C 640 135, 640 215, 700 215" stroke="#4b5563" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            </svg>

            {/* Nodes Layer */}
            {nodes.map((node) => {
                const typeConfig = NODE_TYPES.find(n => n.type === node.type) || NODE_TYPES[0];
                return (
                    <motion.div
                        key={node.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute w-44 p-3 rounded-xl border ${typeConfig.border} bg-[#09090b] shadow-xl z-10 flex flex-col gap-2 group cursor-pointer hover:ring-2 ring-cyan-500/50 transition-all`}
                        style={{ left: node.x, top: node.y }}
                        drag
                        dragMomentum={false}
                    >
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <typeConfig.icon size={14} className={typeConfig.color} />
                            <span className={`text-xs font-bold ${typeConfig.color}`}>{node.type}</span>
                            <Settings size={12} className="ml-auto text-gray-600 hover:text-white cursor-pointer" />
                        </div>
                        <p className="text-sm font-bold text-gray-200">{node.label}</p>

                        {/* Ports */}
                        <div className="absolute -left-1.5 top-1/2 w-3 h-3 bg-gray-600 rounded-full border border-black" />
                        <div className="absolute -right-1.5 top-1/2 w-3 h-3 bg-gray-600 rounded-full border border-black hover:bg-cyan-500 transition-colors" />
                    </motion.div>
                );
            })}

            {/* Canvas Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2">
                <button className="p-2 bg-black/50 border border-white/10 rounded-lg text-gray-400 hover:text-white"><Plus size={16}/></button>
                <button className="p-2 bg-black/50 border border-white/10 rounded-lg text-gray-400 hover:text-white"><Layout size={16}/></button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlaybooksPage;
