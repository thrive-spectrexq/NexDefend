import React from 'react';
import { Typography, Paper, Grid } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

const trafficData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  inbound: Math.floor(Math.random() * 5000) + 1000,
  outbound: Math.floor(Math.random() * 3000) + 500,
}));

const protocolData = [
  { name: '00:00', http: 400, ssh: 200, dns: 100 },
  { name: '04:00', http: 300, ssh: 150, dns: 120 },
  { name: '08:00', http: 2000, ssh: 500, dns: 300 },
  { name: '12:00', http: 3500, ssh: 800, dns: 400 },
  { name: '16:00', http: 3000, ssh: 700, dns: 350 },
  { name: '20:00', http: 1500, ssh: 400, dns: 200 },
];

const NetworkDashboardPage: React.FC = () => {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h4" gutterBottom>Network Dashboard</Typography>

      <Grid container spacing={3}>
        {/* Traffic Volume Area Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Network Traffic Volume (24h)</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                <XAxis dataKey="time" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }} />
                <Area type="monotone" dataKey="inbound" stroke="#00D1FF" fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="outbound" stroke="#F50057" fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Protocol Distribution Line Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Protocol Distribution</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={protocolData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
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
import { Box } from '@mui/material';

export default NetworkDashboardPage;
