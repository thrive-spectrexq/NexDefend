import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import DataTable from '@/components/DataTable';
import StatusChip from '@/components/StatusChip';
import IncidentModal from '@/components/IncidentModal';
import { getIncidents } from '@/api/alerts'; // Assuming this maps to /incidents endpoint

const columns = [
  {
      id: 'description', // Backend uses 'description', no 'title' field
      label: 'Incident Description',
      minWidth: 250
  },
  {
    id: 'severity', // Backend uses 'severity', no 'priority' field
    label: 'Severity',
    minWidth: 100,
    format: (value: string) => {
        // Handle case-insensitive standard severity levels
        const v = (value || '').toLowerCase();
        let status = 'info';
        if(v === 'critical' || v === 'p1') status = 'critical';
        if(v === 'high' || v === 'warning' || v === 'p2') status = 'warning';
        if(v === 'medium') status = 'warning';
        return <StatusChip status={status} label={value} />;
    }
  },
  { id: 'assigned_to', label: 'Assignee', minWidth: 150 }, // Backend JSON tag is 'assigned_to'
  {
    id: 'status',
    label: 'Status',
    minWidth: 120,
    format: (value: string) => <StatusChip status={value} />
  },
  {
    id: 'created_at', // Backend JSON tag is 'created_at'
    label: 'Created Date',
    minWidth: 150,
    format: (value: string) => value ? new Date(value).toLocaleDateString() + ' ' + new Date(value).toLocaleTimeString() : 'N/A'
  },
];

const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents(); // Ensure this calls /incidents
        setIncidents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch incidents", err);
        setError("Failed to load incidents. Ensure the backend SOAR module is active.");
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const handleRowClick = (row: any) => {
    setSelectedIncident(row);
  };

  const handleCloseModal = () => {
    setSelectedIncident(null);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Incidents Management
      </Typography>
      <DataTable
        columns={columns}
        rows={incidents}
        title="Active Incidents"
        onRowClick={handleRowClick}
      />

      {selectedIncident && (
        <IncidentModal
          open={Boolean(selectedIncident)}
          onClose={handleCloseModal}
          incident={selectedIncident}
        />
      )}
    </Box>
  );
};

export default IncidentsPage;
