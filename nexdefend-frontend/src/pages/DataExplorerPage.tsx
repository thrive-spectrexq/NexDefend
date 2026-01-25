import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert, TextField, Button, Paper } from '@mui/material';
import DataTable from '@/components/DataTable';
import { getEvents } from '@/api/events';

interface LogEvent {
  timestamp: string;
  event_type: string;
  source_ip: string;
  destination_ip: string;
  details: unknown;
  [key: string]: unknown;
}

const columns = [
  { id: 'timestamp', label: 'Timestamp', minWidth: 170 },
  { id: 'event_type', label: 'Type', minWidth: 120 },
  { id: 'source_ip', label: 'Source IP', minWidth: 130 },
  { id: 'destination_ip', label: 'Dest IP', minWidth: 130 },
  { id: 'details', label: 'Details', minWidth: 250, format: (val: unknown) => typeof val === 'object' ? JSON.stringify(val) : String(val) },
];

const DataExplorerPage: React.FC = () => {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents(query);
      // Backend might return { hits: [...] } or just [...]
      // Assuming array or hits array
      const rows = Array.isArray(data) ? data : (data?.hits || []);
      setEvents(rows);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(searchQuery);
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Data Explorer
      </Typography>

      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Search Logs (Lucene Query)"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="e.g. event_type:alert AND severity:high"
        />
        <Button type="submit" variant="contained" size="large">
            Search
        </Button>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <DataTable columns={columns} rows={events} title="Log Events" />
      )}
    </Box>
  );
};

export default DataExplorerPage;
