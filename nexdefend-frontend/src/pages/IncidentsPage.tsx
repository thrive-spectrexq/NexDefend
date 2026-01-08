import React from 'react';
import { Typography, Box } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { v4 as uuidv4 } from 'uuid';

const incidentsData = Array.from({ length: 20 }, () => ({
  id: uuidv4(),
  title: ['Data Exfiltration Attempt', 'Ransomware Activity', 'DDoS Attack', 'Insider Threat'][Math.floor(Math.random() * 4)],
  priority: ['P1', 'P2', 'P3'][Math.floor(Math.random() * 3)],
  assignee: ['Alice', 'Bob', 'Charlie', 'Unassigned'][Math.floor(Math.random() * 4)],
  status: ['Open', 'In Progress', 'Closed'][Math.floor(Math.random() * 3)],
  created: new Date(Date.now() - Math.floor(Math.random() * 500000000)).toLocaleDateString(),
}));

const columns = [
  { id: 'title', label: 'Title', minWidth: 250 },
  {
    id: 'priority',
    label: 'Priority',
    minWidth: 100,
    format: (value: string) => {
        let status = 'info';
        if(value === 'P1') status = 'critical';
        if(value === 'P2') status = 'warning';
        return <StatusChip status={status === 'critical' || status === 'warning' ? value : 'info'} />;
    }
  },
  { id: 'assignee', label: 'Assignee', minWidth: 150 },
  {
    id: 'status',
    label: 'Status',
    minWidth: 120,
    format: (value: string) => {
        return <StatusChip status={value} />;
    }
  },
  { id: 'created', label: 'Created Date', minWidth: 150 },
];

const IncidentsPage: React.FC = () => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Incidents Management
      </Typography>
      <DataTable columns={columns} rows={incidentsData} title="Active Incidents" />
    </Box>
  );
};

export default IncidentsPage;
