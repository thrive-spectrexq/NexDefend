import React, { useEffect, useState } from 'react';
import { Typography, Paper, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '@/api/dashboard';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setError("Failed to load dashboard statistics. Ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  // Fallback data if stats are missing or empty (for demo purpose if API returns null)
  const chartData = stats?.activity || [
    { name: 'Mon', alerts: 0, incidents: 0 },
    { name: 'Tue', alerts: 0, incidents: 0 },
    { name: 'Wed', alerts: 0, incidents: 0 },
    { name: 'Thu', alerts: 0, incidents: 0 },
    { name: 'Fri', alerts: 0, incidents: 0 },
    { name: 'Sat', alerts: 0, incidents: 0 },
    { name: 'Sun', alerts: 0, incidents: 0 },
  ];

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Alerts</Typography>
            <Typography variant="h3" color="primary">{stats?.total_alerts || 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Incidents</Typography>
            <Typography variant="h3" color="secondary">{stats?.active_incidents || 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Online Agents</Typography>
            <Typography variant="h3" sx={{ color: '#4caf50' }}>{stats?.online_agents || 0}</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Weekly Activity</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
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
