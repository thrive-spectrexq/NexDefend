import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { getAgents } from '@/api/agents';

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
  { id: 'last_seen', label: 'Last Seen', minWidth: 150 },
];

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await getAgents();
        setAgents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch agents", err);
        setError("Failed to load agents.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Agent Fleet
      </Typography>
      <DataTable columns={columns} rows={agents} title="Registered Agents" />
    </Box>
  );
};

export default AgentsPage;
