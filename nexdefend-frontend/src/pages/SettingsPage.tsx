import React from 'react';
import { Typography, Box, Paper, Switch, FormControlLabel, Button, TextField, Grid } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>System Preferences</Typography>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Enable Dark Mode" />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Enable Desktop Notifications" />
            </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Agent Configuration Defaults</Typography>
        <Box component="form" noValidate autoComplete="off">
            <TextField label="Heartbeat Interval (seconds)" defaultValue="60" fullWidth margin="normal" />
            <TextField label="Log Retention (days)" defaultValue="30" fullWidth margin="normal" />
            <Button variant="contained" sx={{ mt: 2 }}>Save Defaults</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="error">Danger Zone</Typography>
        <Typography variant="body2" paragraph>
            Resetting the system will clear all alerts and incidents. This action cannot be undone.
        </Typography>
        <Button variant="outlined" color="error">Reset System Data</Button>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
