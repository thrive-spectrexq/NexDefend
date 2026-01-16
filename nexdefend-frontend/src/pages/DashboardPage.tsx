import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Paper, Grid, Box, Button, Chip, Alert, CircularProgress } from '@mui/material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';
import { ArrowOutward as ArrowIcon, Security as SecurityIcon } from '@mui/icons-material';
import { getDashboardStats } from '@/api/dashboard';

// Types matching your Go Backend 'DashboardSummary' and 'ModuleStat' structs
interface ModuleStat {
  name: string;
  count: number;
  status: 'critical' | 'warning' | 'healthy';
  trend: 'up' | 'down' | 'flat';
}

interface DashboardData {
  modules: ModuleStat[];
  compliance: any[];
  total_events_24h: number;
}

// Sparkline Data (Simulated for visual design as backend doesn't provide history yet)
const sparklineData1 = [{ value: 10 }, { value: 12 }, { value: 15 }, { value: 18 }, { value: 20 }, { value: 22 }, { value: 25 }];
const sparklineData2 = [{ value: 5 }, { value: 8 }, { value: 12 }, { value: 4 }, { value: 6 }, { value: 3 }, { value: 2 }];
const sparklineData3 = [{ value: 2 }, { value: 4 }, { value: 3 }, { value: 5 }, { value: 8 }, { value: 6 }, { value: 9 }];

const KPICard = ({ title, value, subtext, trend, data, color }: any) => {
    // Map backend status/trend to UI colors/labels
    const isPositive = trend === 'up';
    const trendLabel = trend === 'up' ? '+5%' : trend === 'down' ? '-5%' : '0%';

    return (
      <Paper
        sx={{
          p: 2.5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
              {title}
            </Typography>
             <Chip
                 label={trendLabel}
                 size="small"
                 sx={{
                   height: 20,
                   fontSize: '0.7rem',
                   fontWeight: 'bold',
                   bgcolor: isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                   color: isPositive ? '#4caf50' : '#f44336'
                 }}
               />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtext}
          </Typography>
        </Box>

        <Box sx={{ height: 60, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`color${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                 type="monotone"
                 dataKey="value"
                 stroke={color}
                 strokeWidth={2}
                 fillOpacity={1}
                 fill={`url(#color${title.replace(/\s/g, '')})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    );
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setError("Failed to load live statistics. Connecting to backup display.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Helper to extract count from modules array safely
  const getModuleCount = (name: string) => {
      return stats?.modules?.find(m => m.name === name)?.count || 0;
  };

  // Mapped Data from Backend
  const totalAgents = getModuleCount('Active Agents');
  const totalVulns = getModuleCount('Vulnerability Detector');
  const totalFim = getModuleCount('Integrity Monitoring');
  const totalEvents = stats?.total_events_24h || 0;

  // Chart Data (Mocked for now as backend doesn't provide time-series yet)
  const activityData = [
    { name: 'Mon', events: 1200 },
    { name: 'Tue', events: 3500 },
    { name: 'Wed', events: 2200 },
    { name: 'Thu', events: 4800 },
    { name: 'Fri', events: 6000 },
    { name: 'Sat', events: 3800 },
    { name: 'Sun', events: totalEvents > 0 ? totalEvents : 2500 },
  ];

  const threatData = useMemo(() => [
    { name: 'Jan', low: 40, critical: 24 },
    { name: 'Feb', low: 30, critical: 13 },
    { name: 'Mar', low: 20, critical: 98 },
    { name: 'Apr', low: 27, critical: 39 },
    { name: 'May', low: 18, critical: 48 },
    { name: 'Jun', low: 23, critical: 38 },
  ], []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold">Security Overview</Typography>
        {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>

      <Grid container spacing={3}>
        {/* Row 1: KPI Cards */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <KPICard
            title="Active Agents"
            value={totalAgents}
            subtext="Online endpoints"
            trend="up"
            data={sparklineData1}
            color="#4caf50"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
           <KPICard
            title="Open Vulnerabilities"
            value={totalVulns}
            subtext="Detected in scans"
            trend={totalVulns > 0 ? "down" : "flat"} // Logic: High vulns is "bad" so we might want to color differently, keeping simple for now
            data={sparklineData2}
            color="#f44336"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
           <KPICard
            title="Integrity Events"
            value={totalFim}
            subtext="File changes detected"
            trend="flat"
            data={sparklineData3}
            color="#00D1FF"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
              border: '1px solid rgba(255,255,255,0.08)',
              position: 'relative'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ position: 'absolute', top: 20, left: 20 }}>
              System Health Score
            </Typography>

            <Box sx={{ height: 180, width: '100%', mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ name: 'Health', value: 85, fill: '#00D1FF' }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ position: 'absolute', top: '55%', textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">85%</Typography>
              <Typography variant="caption" color="text.secondary">Optimal</Typography>
            </Box>

            <Button
                variant="outlined"
                size="small"
                href="/data-explorer"
                sx={{ mt: 1, borderRadius: 20, textTransform: 'none' }}
            >
                View Threat Map
            </Button>
          </Paper>
        </Grid>

        {/* Row 2: Large Charts */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: 400, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.08)' }}>
             <Box sx={{ mb: 3 }}>
               <Typography variant="subtitle2" color="text.secondary">Event Volume</Typography>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                 <Typography variant="h4" fontWeight="bold">{totalEvents}</Typography>
                 <Chip label="+8%" size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', height: 20, fontSize: '0.7rem' }} />
               </Box>
               <Typography variant="caption" color="text.secondary">Total processed events (Last 24h)</Typography>
             </Box>
             <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }} itemStyle={{ color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="events" stroke="#00D1FF" strokeWidth={3} fillOpacity={1} fill="url(#colorEvents)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
           <Paper sx={{ p: 3, height: 400, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.08)' }}>
             <Box sx={{ mb: 3 }}>
               <Typography variant="subtitle2" color="text.secondary">Vulnerability Trends</Typography>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                 <Typography variant="h4" fontWeight="bold">Critical & Low</Typography>
               </Box>
               <Typography variant="caption" color="text.secondary">Detected vulnerabilities by severity</Typography>
             </Box>
             <ResponsiveContainer width="100%" height={280}>
              <BarChart data={threatData} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1E293B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }} itemStyle={{ color: '#F8FAFC' }} />
                <Bar dataKey="low" name="Low Severity" stackId="a" fill="#00D1FF" radius={[0, 0, 4, 4]} />
                <Bar dataKey="critical" name="Critical" stackId="a" fill="#f44336" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
