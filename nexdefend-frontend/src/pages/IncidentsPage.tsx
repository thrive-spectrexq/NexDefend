import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { getIncidents } from '@/api/alerts';

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
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setIncidents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch incidents", err);
        setError("Failed to load incidents.");
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Incidents Management
      </Typography>
      <DataTable columns={columns} rows={incidents} title="Active Incidents" />
    </Box>
  );
};

export default IncidentsPage;
