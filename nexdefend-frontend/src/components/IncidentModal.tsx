import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Divider,
  Tab,
  Tabs
} from '@mui/material';
import ProcessTreeViewer from './ProcessTreeViewer';

interface IncidentModalProps {
  open: boolean;
  onClose: () => void;
  incident: any;
}

const IncidentModal: React.FC<IncidentModalProps> = ({ open, onClose, incident }) => {
  const [tabIndex, setTabIndex] = useState(0);

  if (!incident) return null;

  // Mock Process Data for visualization if actual data is missing from incident context
  const mockProcesses = [
    { pid: 100, ppid: 1, name: "explorer.exe", cmdline: "C:\\Windows\\explorer.exe" },
    { pid: 204, ppid: 100, name: "chrome.exe", cmdline: "chrome.exe --url" },
    { pid: 305, ppid: 204, name: "cmd.exe", cmdline: "cmd.exe /c download.ps1" },
    { pid: 401, ppid: 305, name: "powershell.exe", cmdline: "powershell.exe -enc ..." },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
            <Typography variant="h6">Incident #{incident.id}</Typography>
            <Chip
                label={incident.severity}
                size="small"
                color={incident.severity === 'Critical' ? 'error' : incident.severity === 'High' ? 'warning' : 'primary'}
                sx={{ mt: 0.5 }}
            />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
                <Tab label="Overview" />
                <Tab label="Process Analysis" />
                <Tab label="Raw Data" />
            </Tabs>
        </Box>

        {tabIndex === 0 && (
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography paragraph>{incident.description}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Entity</Typography>
                <Typography paragraph>{incident.entity_name || "Unknown"}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography>{incident.status}</Typography>
            </Box>
        )}

        {tabIndex === 1 && (
            <Box>
                <Typography variant="h6" gutterBottom>Process Tree Analysis</Typography>
                <Divider sx={{ mb: 2 }} />
                {/*
                   In a real scenario, we would pass incident.related_processes.
                   For now, we use mock data to demonstrate the visualization component.
                */}
                <ProcessTreeViewer processes={mockProcesses} />
            </Box>
        )}

        {tabIndex === 2 && (
            <Box component="pre" sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, overflow: 'auto' }}>
                {JSON.stringify(incident, null, 2)}
            </Box>
        )}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Close</Button>
        <Button variant="contained" color="primary">Investigate</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentModal;
