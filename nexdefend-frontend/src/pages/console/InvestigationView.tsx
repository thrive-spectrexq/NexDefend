import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    // Node,
    // Edge
} from '@xyflow/react';
// Types are not exported as values in some builds, import them as types
import type { Node, Edge } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import {
    Terminal,
    FileCode,
    Globe,
    ShieldAlert,
    XCircle,
    CheckCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Define CustomNode outside the component to avoid re-creation on every render
// This is critical for React Flow performance and preventing bugs
const CustomNode = ({ data }: any) => {
    const Icon = data.icon;
    const isMalicious = data.status === 'malicious';
    const isSuspicious = data.status === 'suspicious';

    const borderColor = isMalicious ? 'border-brand-red' : isSuspicious ? 'border-brand-orange' : 'border-brand-blue';
    const bgColor = isMalicious ? 'bg-brand-red/10' : isSuspicious ? 'bg-brand-orange/10' : 'bg-surface';
    const iconColor = isMalicious ? 'text-brand-red' : isSuspicious ? 'text-brand-orange' : 'text-brand-blue';

    return (
        <div className={cn("px-4 py-2 rounded-lg border-2 shadow-lg min-w-[180px]", borderColor, bgColor)}>
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded bg-background/50", iconColor)}>
                    <Icon size={20} />
                </div>
                <div>
                    <div className="text-sm font-bold text-text font-mono">{data.label}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider">{data.type}</div>
                </div>
            </div>
            {data.status === 'malicious' && (
                <div className="absolute -top-3 -right-3 bg-brand-red text-background text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-background">
                    <ShieldAlert size={10} />
                    THREAT
                </div>
            )}

            {/* MITRE Badge Example */}
            {data.args && (
                <div className="mt-2 pt-2 border-t border-surface-highlight flex justify-end">
                    <span className="text-[10px] bg-surface-highlight text-text-muted px-1.5 py-0.5 rounded font-mono">
                        T1059
                    </span>
                </div>
            )}
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'custom',
        position: { x: 250, y: 0 },
        data: { label: 'Outlook.exe', type: 'process', icon: Terminal, status: 'benign' }
    },
    {
        id: '2',
        type: 'custom',
        position: { x: 250, y: 150 },
        data: { label: 'cmd.exe', type: 'process', icon: Terminal, status: 'suspicious', args: '/c powershell -enc ...' }
    },
    {
        id: '3',
        type: 'custom',
        position: { x: 250, y: 300 },
        data: { label: 'unknown_script.ps1', type: 'file', icon: FileCode, status: 'malicious', hash: 'a1b2c3d4...' }
    },
    {
        id: '4',
        type: 'custom',
        position: { x: 50, y: 450 },
        data: { label: '192.168.1.105', type: 'network', icon: Globe, status: 'benign' }
    },
    {
        id: '5',
        type: 'custom',
        position: { x: 450, y: 450 },
        data: { label: 'malware_c2.com', type: 'network', icon: Globe, status: 'malicious' }
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-3', source: '2', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, label: 'Spawned' },
    { id: 'e3-4', source: '3', target: '4', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3-5', source: '3', target: '5', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#ef4444' } },
];

export default function InvestigationView() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text">Investigation: DET-1024</h1>
                    <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                        <span className="font-mono">HOST: FIN-WS-004</span>
                        <span>•</span>
                        <span className="text-brand-red">Active Threat</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-brand-red text-white rounded hover:bg-brand-red/90 text-sm font-bold flex items-center gap-2">
                        <XCircle size={16} />
                        Isolate Host
                    </button>
                    <button className="px-4 py-2 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded hover:bg-brand-blue/20 text-sm font-bold flex items-center gap-2">
                        <CheckCircle size={16} />
                        Close Case
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-surface border border-surface-highlight rounded-lg overflow-hidden relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    defaultEdgeOptions={{ type: 'smoothstep' }}
                >
                    <Background color="#1e293b" gap={16} />
                    <Controls className="bg-surface border border-surface-highlight text-text fill-text" />
                    <MiniMap
                        nodeColor={(node: any) => {
                            switch (node.data.status) {
                                case 'malicious': return '#ef4444';
                                case 'suspicious': return '#f97316';
                                default: return '#38bdf8';
                            }
                        }}
                        className="bg-surface border border-surface-highlight"
                        maskColor="rgba(11, 17, 32, 0.8)"
                    />
                </ReactFlow>

                {/* Side Drawer Context Placeholder */}
                <div className="absolute top-4 right-4 w-80 bg-background/95 backdrop-blur border border-surface-highlight p-4 rounded-lg shadow-xl">
                    <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-surface-highlight pb-2">Selected Node Details</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs text-text-muted">Process Name</div>
                            <div className="text-sm font-mono text-text">cmd.exe</div>
                        </div>
                        <div>
                            <div className="text-xs text-text-muted">Command Line</div>
                            <div className="text-xs font-mono text-brand-orange bg-surface p-2 rounded break-all">
                                /c powershell -enc aW1wb3J0LW1vZHVsZS...
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-text-muted">Parent Process</div>
                            <div className="text-sm font-mono text-text">Outlook.exe (PID: 4421)</div>
                        </div>
                        <div className="pt-2">
                             <span className="text-xs bg-brand-red/20 text-brand-red px-2 py-1 rounded font-bold">
                                MITRE T1059.001
                             </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
