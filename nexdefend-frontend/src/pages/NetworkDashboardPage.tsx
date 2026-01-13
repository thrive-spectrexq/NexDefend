import React, { useEffect, useState } from 'react';
import { Typography, Paper, Grid, Box, CircularProgress, Alert } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import client from '@/api/client';

const NetworkDashboardPage: React.FC = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [protocolData, setProtocolData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trafficRes, protoRes] = await Promise.all([
            client.get('/dashboard/network/traffic'),
            client.get('/dashboard/network/protocols')
        ]);
        setTrafficData(trafficRes.data);
        setProtocolData(protoRes.data);
      } catch (err) {
        console.error("Network stats fetch failed", err);
        setError("Failed to load network telemetry.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Network Dashboard</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Traffic Volume */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, height: 400, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>Network Traffic Volume (24h)</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F50057" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F50057" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }} />
                <Area type="monotone" dataKey="inbound" stroke="#00D1FF" fillOpacity={1} fill="url(#colorIn)" name="Inbound (Bytes)" />
                <Area type="monotone" dataKey="outbound" stroke="#F50057" fillOpacity={1} fill="url(#colorOut)" name="Outbound (Bytes)" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Protocol Distribution */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, height: 400, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>Protocol Distribution</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={protocolData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="http" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="ssh" stroke="#82ca9d" />
                <Line type="monotone" dataKey="dns" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NetworkDashboardPage;
