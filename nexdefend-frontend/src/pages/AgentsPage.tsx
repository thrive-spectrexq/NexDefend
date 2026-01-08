import React from 'react';
import { Typography, Box } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { v4 as uuidv4 } from 'uuid';

const agentsData = Array.from({ length: 15 }, (_, i) => ({
  id: uuidv4(),
  hostname: `host-${Math.floor(Math.random() * 1000)}`,
  ip: `192.168.1.${100 + i}`,
  os: ['Windows 11', 'Ubuntu 22.04', 'macOS 14', 'Windows Server 2022'][Math.floor(Math.random() * 4)],
  version: '1.2.4',
  status: ['Online', 'Offline', 'Updating'][Math.floor(Math.random() * 3)],
  lastSeen: new Date(Date.now() - Math.floor(Math.random() * 60000)).toLocaleTimeString(),
}));

const columns = [
  { id: 'hostname', label: 'Hostname', minWidth: 150 },
  { id: 'ip', label: 'IP Address', minWidth: 130 },
  { id: 'os', label: 'OS', minWidth: 150 },
  { id: 'version', label: 'Agent Version', minWidth: 120 },
  {
    id: 'status',
    label: 'Status',
    minWidth: 120,
    format: (value: string) => <StatusChip status={value} />
  },
  { id: 'lastSeen', label: 'Last Seen', minWidth: 150 },
];

const AgentsPage: React.FC = () => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Agent Fleet
      </Typography>
      <DataTable columns={columns} rows={agentsData} title="Registered Agents" />
    </Box>
  );
};

export default AgentsPage;
