import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Tabs, Tab, CircularProgress, Chip,
  LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button
} from '@mui/material';
import {
  Computer, Storage, ArrowBack, Refresh, Terminal, VerifiedUser
} from '@mui/icons-material';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import client from '@/api/client';

interface Process {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  memory: number;
  state: string;
}

interface Disk {
  mount_point: string;
  filesystem: string;
  used: number;
  total: number;
  percent: number;
}

interface NetworkInterface {
  name: string;
  ip: string;
  mac: string;
  bytes_sent: number;
  bytes_recv: number;
}

interface User {
  username: string;
  terminal: string;
  login_time: string;
}

interface HostDetails {
  summary: { hostname: string; ip: string; status: string; uptime: string; agent_version: string; last_seen: string };
  system: { os: string; kernel: string; model: string; manufacturer: string; serial: string };
  resources: { cpu_percent: number; memory_percent: number; memory_used: number; memory_total: number };
  processes: Process[];
  disks: Disk[];
  network: NetworkInterface[];
  users: User[];
}

const HostDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<HostDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/assets/${id}/details`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load host details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !data) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  const { summary, system, resources, processes, disks, network, users } = data;

  const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Add this reusable Gauge Component
  const ResourceGauge = ({ label, value, color }: { label: string, value: number, color: string }) => {
    const data = [{ name: label, value: value, fill: color }];

    return (
      <Box sx={{ position: 'relative', height: 180, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            barSize={10}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={30} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Centered Label */}
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color }}>{value}%</Typography>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/agents')} sx={{ color: 'text.secondary' }}>Back</Button>
            <Box>
                <Typography variant="h4" fontWeight="bold">{summary.hostname}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                    <Chip
                        label={summary.status.toUpperCase()}
                        color={summary.status === 'online' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                    <Typography variant="body2" color="text.secondary">{summary.ip}</Typography>
                    <Typography variant="body2" color="text.secondary">•</Typography>
                    <Typography variant="body2" color="text.secondary">{system.os}</Typography>
                </Box>
            </Box>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchDetails}>Refresh</Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ResourceGauge label="CPU Load" value={Number(resources.cpu_percent.toFixed(1))} color="#F50057" />
            </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
             <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ResourceGauge label="Memory Usage" value={Number(resources.memory_percent.toFixed(1))} color="#00D1FF" />
            </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Manufacturer</Typography>
                        <Typography variant="body1">{system.manufacturer}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Model</Typography>
                        <Typography variant="body1">{system.model}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Agent Version</Typography>
                        <Typography variant="body1">{summary.agent_version}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Uptime</Typography>
                        <Typography variant="body1">{summary.uptime}</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Processes" icon={<Terminal />} iconPosition="start" />
            <Tab label="Network Interfaces" icon={<Computer />} iconPosition="start" />
            <Tab label="Disk & Storage" icon={<Storage />} iconPosition="start" />
            <Tab label="Users" icon={<VerifiedUser />} iconPosition="start" />
        </Tabs>

        {/* Processes Tab */}
        {tabValue === 0 && (
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>PID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>CPU %</TableCell>
                            <TableCell>Memory %</TableCell>
                            <TableCell>State</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processes.map((proc) => (
                            <TableRow key={proc.pid} hover>
                                <TableCell>{proc.pid}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{proc.name}</TableCell>
                                <TableCell>{proc.user}</TableCell>
                                <TableCell>{proc.cpu}%</TableCell>
                                <TableCell>{proc.memory}%</TableCell>
                                <TableCell><Chip label={proc.state} size="small" color={proc.state === 'running' ? 'success' : 'default'} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )}

        {/* Network Tab */}
        {tabValue === 1 && (
             <TableContainer>
                <Table>
                    <TableHead><TableRow><TableCell>Interface</TableCell><TableCell>IP Address</TableCell><TableCell>MAC Address</TableCell><TableCell>Sent</TableCell><TableCell>Received</TableCell></TableRow></TableHead>
                    <TableBody>
                        {network.map((net, idx) => (
                            <TableRow key={idx}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{net.name}</TableCell>
                                <TableCell>{net.ip}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{net.mac}</TableCell>
                                <TableCell>{formatBytes(net.bytes_sent)}</TableCell>
                                <TableCell>{formatBytes(net.bytes_recv)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )}

        {/* Disk Tab */}
        {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
                {disks.map((disk, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography fontWeight="bold">{disk.mount_point} ({disk.filesystem})</Typography>
                            <Typography color="text.secondary">{formatBytes(disk.used)} used of {formatBytes(disk.total)}</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={disk.percent}
                            color={disk.percent > 90 ? 'error' : disk.percent > 70 ? 'warning' : 'primary'}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                    </Box>
                ))}
            </Box>
        )}

        {/* Users Tab */}
        {tabValue === 3 && (
             <TableContainer>
             <Table>
                 <TableHead><TableRow><TableCell>Username</TableCell><TableCell>Terminal</TableCell><TableCell>Login Time</TableCell></TableRow></TableHead>
                 <TableBody>
                     {users.map((u, idx) => (
                         <TableRow key={idx}>
                             <TableCell sx={{ fontWeight: 'bold' }}>{u.username}</TableCell>
                             <TableCell>{u.terminal}</TableCell>
                             <TableCell>{u.login_time}</TableCell>
                         </TableRow>
                     ))}
                 </TableBody>
             </Table>
         </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default HostDetailsPage;
