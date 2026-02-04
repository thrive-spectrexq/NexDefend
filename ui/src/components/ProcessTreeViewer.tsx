import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Tree, TreeNode } from 'react-organizational-chart';

interface Process {
  pid: number;
  ppid: number;
  name: string;
  cmdline: string;
  username?: string;
}

interface ProcessTreeViewerProps {
  processes: Process[];
}

const getProcessColor = (procName: string) => {
    const suspicious = ['nc', 'nmap', 'powershell.exe', 'cmd.exe', 'mimikatz', 'wget', 'curl'];
    const system = ['systemd', 'svchost.exe', 'init', 'winlogon.exe'];

    if (suspicious.some(s => procName.toLowerCase().includes(s))) return '#ff1744'; // Red
    if (system.some(s => procName.toLowerCase() === s)) return '#00e676'; // Green
    return 'text.primary'; // Default
};

const ProcessNode = ({ process }: { process: Process }) => (
  <Paper
    elevation={3}
    sx={{
      p: 1,
      bgcolor: 'background.paper',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'inline-block',
      textAlign: 'left',
      minWidth: 150
    }}
  >
    <Typography
        variant="body2"
        sx={{
            color: getProcessColor(process.name),
            fontWeight: getProcessColor(process.name) !== 'text.primary' ? 'bold' : 'normal',
            textShadow: getProcessColor(process.name) === '#ff1744' ? '0 0 8px rgba(255, 23, 68, 0.4)' : 'none'
        }}
    >
        {process.name} <span style={{ opacity: 0.5 }}>({process.pid})</span>
    </Typography>
    <Typography variant="caption" display="block" color="text.secondary">{process.username && `User: ${process.username}`}</Typography>
    <Typography variant="caption" display="block" color="text.secondary" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {process.cmdline}
    </Typography>
  </Paper>
);

const buildTree = (processes: Process[], rootPid: number): React.ReactNode => {
    const root = processes.find(p => p.pid === rootPid);
    if (!root) return null;

    const children = processes.filter(p => p.ppid === rootPid);

    return (
        <TreeNode key={root.pid} label={<ProcessNode process={root} />}>
            {children.map(child => buildTree(processes, child.pid))}
        </TreeNode>
    );
};

const ProcessTreeViewer: React.FC<ProcessTreeViewerProps> = ({ processes }) => {
    // Find potential roots (processes with ppid not in the list or 0/1)
    // For visualization simplicity, let's assume the first process or lowest PID is root for this snapshot
    if (!processes || processes.length === 0) return <Typography>No process data available</Typography>;

    const pids = new Set(processes.map(p => p.pid));
    const roots = processes.filter(p => !pids.has(p.ppid));

  return (
    <Box sx={{ overflowX: 'auto', p: 2 }}>
      <Tree
        lineWidth={'2px'}
        lineColor={'rgba(255,255,255,0.1)'}
        lineBorderRadius={'10px'}
        label={<Typography variant="caption" color="text.secondary">Process Tree Snapshot</Typography>}
      >
        {roots.map(root => buildTree(processes, root.pid))}
      </Tree>
    </Box>
  );
};

export default ProcessTreeViewer;
