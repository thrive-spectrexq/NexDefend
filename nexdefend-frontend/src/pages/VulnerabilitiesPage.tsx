import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { getVulnerabilities } from '@/api/vulnerabilities';

const columns = [
  { id: 'cve_id', label: 'CVE ID', minWidth: 120 },
  { id: 'package_name', label: 'Package', minWidth: 150 },
  {
    id: 'severity',
    label: 'Severity',
    minWidth: 100,
    format: (value: string) => <StatusChip status={value} />
  },
  { id: 'description', label: 'Description', minWidth: 250 },
  { id: 'status', label: 'Status', minWidth: 120, format: (value: string) => <StatusChip status={value} /> },
  { id: 'created_at', label: 'Detected At', minWidth: 150 },
];

const VulnerabilitiesPage: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVulns = async () => {
      try {
        const data = await getVulnerabilities();
        setVulnerabilities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch vulnerabilities", err);
        setError("Failed to load vulnerabilities.");
      } finally {
        setLoading(false);
      }
    };
    fetchVulns();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Vulnerability Scanner
      </Typography>
      <DataTable columns={columns} rows={vulnerabilities} title="Detected Vulnerabilities" />
    </Box>
  );
};

export default VulnerabilitiesPage;
