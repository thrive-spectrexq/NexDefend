import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, Paper } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import client from '@/api/client';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface AlertData {
  id?: string | number;
  timestamp: string;
  severity: string;
  rule_name: string;
  source_ip: string;
  destination_ip: string;
  action: string;
  alert?: {
    signature?: string;
    severity?: string;
  };
  message?: string;
  // Allow indexing for generic DataTable use
  [key: string]: unknown;
}

const columns = [
  { id: 'timestamp', label: 'Time', minWidth: 160, format: (val: unknown) => new Date(String(val)).toLocaleString() },
  {
    id: 'severity',
    label: 'Severity',
    minWidth: 100,
    format: (value: unknown) => <StatusChip status={value ? String(value).toLowerCase() : 'info'} />
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
    format: (value: unknown) => <StatusChip status={value === 'blocked' ? 'critical' : 'success'} label={String(value)} />
  },
];

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Timeline Data transformation
  const timelineData = alerts.map((a, index) => ({
      time: new Date(a.timestamp).getHours(),
      severity: (String(a.severity).toLowerCase().includes('critical') || String(a.severity).toLowerCase().includes('high')) ? 3 : (String(a.severity).toLowerCase().includes('warning') || String(a.severity).toLowerCase().includes('medium')) ? 2 : 1,
      id: a.id || index
  }));

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Security Alerts
      </Typography>

      <Paper sx={{ p: 2, mb: 3, height: 250, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="h6" gutterBottom>Alert Timeline (24h)</Typography>
          <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" dataKey="time" name="Hour" unit="h" domain={[0, 24]} stroke="#94a3b8" />
                  <YAxis
                      type="number"
                      dataKey="severity"
                      name="Severity"
                      domain={[0, 4]}
                      ticks={[1, 2, 3]}
                      tickFormatter={(val) => val === 3 ? 'Critical' : val === 2 ? 'High' : 'Low'}
                      stroke="#94a3b8"
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1E293B' }} />
                  <Scatter name="Alerts" data={timelineData} fill="#00D1FF">
                      {timelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.severity === 3 ? '#F50057' : entry.severity === 2 ? '#FF9100' : '#00D1FF'} />
                      ))}
                  </Scatter>
              </ScatterChart>
          </ResponsiveContainer>
      </Paper>

      <DataTable columns={columns} rows={alerts} title="Real-time Alerts" />
    </Box>
  );
};

export default AlertsPage;
