import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { getAlerts } from '@/api/alerts';

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
        return <StatusChip status={value} />;
    }
  },
];

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        // Ensure data is array
        setAlerts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
        setError("Failed to load alerts.");
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Security Alerts
      </Typography>
      <DataTable columns={columns} rows={alerts} title="Recent Alerts" />
    </Box>
  );
};

export default AlertsPage;
