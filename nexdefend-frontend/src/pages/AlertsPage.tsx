import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import client from '@/api/client';

const columns = [
  { id: 'timestamp', label: 'Time', minWidth: 160, format: (val: string) => new Date(val).toLocaleString() },
  {
    id: 'severity',
    label: 'Severity',
    minWidth: 100,
    format: (value: string) => <StatusChip status={value ? value.toLowerCase() : 'info'} />
  },
  {
    id: 'rule_name', // Mapped from backend 'rule_name' or 'event_type'
    label: 'Alert Rule',
    minWidth: 200
  },
  { id: 'source_ip', label: 'Source IP', minWidth: 130 },
  { id: 'destination_ip', label: 'Dest IP', minWidth: 130 },
  {
    id: 'action', // Often 'allowed', 'blocked', or 'alerted'
    label: 'Action',
    minWidth: 120,
    format: (value: string) => <StatusChip status={value === 'blocked' ? 'critical' : 'success'} label={value} />
  },
];

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Calls the new /alerts route in Go (which queries OpenSearch)
        const response = await client.get('/alerts');
        const data = response.data;
        // Handle OpenSearch response structure (hits vs direct array)
        const rows = Array.isArray(data) ? data : (data?.hits || []);

        // Map any necessary fields if backend names differ
        const mappedRows = rows.map((r: any) => ({
            ...r,
            // Fallbacks if specific alert fields are missing
            rule_name: r.rule_name || r.alert?.signature || r.message || 'Unknown Alert',
            severity: r.severity || (r.alert?.severity ? 'high' : 'info')
        }));

        setAlerts(mappedRows);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
        setError("Failed to load security alerts.");
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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Security Alerts
      </Typography>
      <DataTable columns={columns} rows={alerts} title="Real-time Alerts" />
    </Box>
  );
};

export default AlertsPage;
