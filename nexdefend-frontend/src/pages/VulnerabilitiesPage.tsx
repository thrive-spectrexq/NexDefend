import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import { getVulnerabilities } from '@/api/vulnerabilities';

interface Vulnerability {
  id: number;
  title: string;
  package_name: string;
  severity: string;
  description: string;
  status: string;
  discovered_at: string;
  [key: string]: unknown;
}

// Update columns to match Backend JSON tags (vulnerability.go)
const columns = [
  { id: 'title', label: 'CVE ID', minWidth: 120 }, // Backend maps CVE to 'title'
  { id: 'package_name', label: 'Package', minWidth: 150 },
  {
    id: 'severity',
    label: 'Severity',
    minWidth: 100,
    format: (value: unknown) => <StatusChip status={String(value)} />
  },
  { id: 'description', label: 'Description', minWidth: 250 },
  { id: 'status', label: 'Status', minWidth: 120, format: (value: unknown) => <StatusChip status={String(value)} /> },
  {
    id: 'discovered_at', // Matched 'discovered_at' from backend
    label: 'Detected At',
    minWidth: 150,
    format: (value: unknown) => value ? new Date(String(value)).toLocaleDateString() : 'N/A'
  },
];

const VulnerabilitiesPage: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVulns = async () => {
      try {
        const data = await getVulnerabilities();
        setVulnerabilities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch vulnerabilities", err);
        setError("Failed to load vulnerabilities. Check API connection.");
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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Vulnerability Scanner
      </Typography>
      <DataTable columns={columns} rows={vulnerabilities} title="Detected Vulnerabilities" />
    </Box>
  );
};

export default VulnerabilitiesPage;
