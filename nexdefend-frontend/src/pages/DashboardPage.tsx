import React from 'react';
import { Typography, Paper, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', alerts: 40, incidents: 24 },
  { name: 'Tue', alerts: 30, incidents: 13 },
  { name: 'Wed', alerts: 20, incidents: 58 },
  { name: 'Thu', alerts: 27, incidents: 39 },
  { name: 'Fri', alerts: 18, incidents: 48 },
  { name: 'Sat', alerts: 23, incidents: 38 },
  { name: 'Sun', alerts: 34, incidents: 43 },
];

const DashboardPage: React.FC = () => {
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Alerts</Typography>
            <Typography variant="h3" color="primary">124</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Incidents</Typography>
            <Typography variant="h3" color="secondary">12</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Online Agents</Typography>
            <Typography variant="h3" sx={{ color: '#4caf50' }}>58</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Weekly Activity</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend />
                <Bar dataKey="alerts" fill="#00D1FF" name="Alerts" />
                <Bar dataKey="incidents" fill="#F50057" name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardPage;
