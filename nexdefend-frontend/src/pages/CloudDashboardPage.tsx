import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Grid, CircularProgress, Alert } from '@mui/material';
import { Cloud as CloudIcon, Storage as StorageIcon } from '@mui/icons-material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import client from '@/api/client';

const CloudDashboardPage: React.FC = () => {
  const [cloudAssets, setCloudAssets] = useState<any[]>([]);
  const [k8sPods, setK8sPods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cloudRes, k8sRes] = await Promise.all([
          client.get('/assets/cloud'),
          client.get('/assets/kubernetes')
        ]);
        setCloudAssets(cloudRes.data || []);
        setK8sPods(k8sRes.data || []);
      } catch (err) {
        console.error("Failed to fetch cloud data", err);
        setError("Could not load cloud assets. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cloudColumns: GridColDef[] = [
    { field: 'instance_id', headerName: 'Instance ID', width: 150 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'state', headerName: 'State', width: 120, renderCell: (params: GridRenderCellParams) => (
        <Chip
            label={params.value as string}
            size="small"
            color={params.value === 'running' ? 'success' : 'default'}
            variant="outlined"
        />
    )},
    { field: 'public_ip', headerName: 'Public IP', width: 150 },
    { field: 'region', headerName: 'Region', width: 120 },
  ];

  const k8sColumns: GridColDef[] = [
    { field: 'name', headerName: 'Pod Name', width: 250 },
    { field: 'namespace', headerName: 'Namespace', width: 150 },
    { field: 'phase', headerName: 'Phase', width: 120, renderCell: (params: GridRenderCellParams) => (
        <Chip
            label={params.value as string}
            size="small"
            color={params.value === 'Running' ? 'success' : params.value === 'Failed' ? 'error' : 'warning'}
        />
    )},
    { field: 'node_name', headerName: 'Node', width: 150 },
    { field: 'pod_ip', headerName: 'Pod IP', width: 150 },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold">Cloud & Container Monitoring</Typography>
            <Typography variant="body2" color="text.secondary">Real-time visibility into AWS infrastructure and Kubernetes workloads.</Typography>
            {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CloudIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">AWS Instances</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold">{cloudAssets.length}</Typography>
                        <Typography variant="caption" color="text.secondary">Active EC2 Instances</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <StorageIcon color="secondary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Kubernetes Pods</Typography>
                        </Box>
                        <Typography variant="h3" fontWeight="bold">{k8sPods.length}</Typography>
                        <Typography variant="caption" color="text.secondary">Monitored Pods</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Cloud Assets (AWS)</Typography>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={cloudAssets}
                    columns={cloudColumns}
                    getRowId={(row: any) => row.instance_id}
                    sx={{ border: '1px solid rgba(255,255,255,0.08)', color: 'text.secondary' }}
                />
            </Box>
        </Box>

        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Kubernetes Workloads</Typography>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={k8sPods}
                    columns={k8sColumns}
                    getRowId={(row: any) => `${row.namespace}-${row.name}`}
                    sx={{ border: '1px solid rgba(255,255,255,0.08)', color: 'text.secondary' }}
                />
            </Box>
        </Box>
    </Box>
  );
};

export default CloudDashboardPage;
