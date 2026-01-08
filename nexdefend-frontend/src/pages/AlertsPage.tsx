import React from 'react';
import { Typography, Box } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { v4 as uuidv4 } from 'uuid';

// Mock Data
const alertsData = Array.from({ length: 50 }, (_, i) => ({
  id: uuidv4(),
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleString(),
  severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
  ruleName: ['Brute Force', 'Port Scan', 'Malware Detected', 'Unauthorized Access', 'Privilege Escalation'][Math.floor(Math.random() * 5)],
  source: `192.168.1.${Math.floor(Math.random() * 255)}`,
  destination: `10.0.0.${Math.floor(Math.random() * 255)}`,
  status: ['New', 'Investigating', 'Resolved', 'False Positive'][Math.floor(Math.random() * 4)],
}));

const columns = [
  { id: 'timestamp', label: 'Timestamp', minWidth: 170 },
  {
    id: 'severity',
    label: 'Severity',
    minWidth: 100,
    format: (value: string) => (
      <StatusChip status={value} />
    )
  },
  { id: 'ruleName', label: 'Rule Name', minWidth: 200 },
  { id: 'source', label: 'Source IP', minWidth: 130 },
  { id: 'destination', label: 'Destination IP', minWidth: 130 },
  {
    id: 'status',
    label: 'Status',
    minWidth: 120,
    format: (value: string) => {
        let color = 'default';
        if(value === 'New') color = 'error';
        if(value === 'Investigating') color = 'warning';
        if(value === 'Resolved') color = 'success';
        return <StatusChip status={value} />; // We can customize color mapping in StatusChip if needed
    }
  },
];

const AlertsPage: React.FC = () => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Security Alerts
      </Typography>
      <DataTable columns={columns} rows={alertsData} title="Recent Alerts" />
    </Box>
  );
};

export default AlertsPage;
