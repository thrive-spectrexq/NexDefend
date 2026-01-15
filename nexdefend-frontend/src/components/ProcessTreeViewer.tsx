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

const ProcessNode = ({ process }: { process: Process }) => (
  <Paper
    elevation={3}
    sx={{
      p: 1,
      bgcolor: process.name === 'powershell.exe' || process.name === 'cmd.exe' ? 'rgba(244, 67, 54, 0.1)' : 'background.paper',
      border: '1px solid',
      borderColor: process.name === 'powershell.exe' ? '#f44336' : 'rgba(255,255,255,0.1)',
      display: 'inline-block',
      textAlign: 'left',
      minWidth: 150
    }}
  >
    <Typography variant="subtitle2" fontWeight="bold">{process.name}</Typography>
    <Typography variant="caption" display="block" color="text.secondary">PID: {process.pid} {process.username && `| User: ${process.username}`}</Typography>
    <Typography variant="caption" display="block" color="text.secondary" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {process.cmdline}
    </Typography>
  </Paper>
);

const buildTree = (processes: Process[], rootPid: number): any => {
    const root = processes.find(p => p.pid === rootPid);
    if (!root) return null;

    const children = processes.filter(p => p.ppid === rootPid);

    return (
        <TreeNode label={<ProcessNode process={root} />}>
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
