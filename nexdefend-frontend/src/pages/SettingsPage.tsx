import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Switch, TextField, Button, Grid, Alert, Snackbar, CircularProgress, Tabs, Tab
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import BuildIcon from '@mui/icons-material/Build'; // Icon for initialization
import SendIcon from '@mui/icons-material/Send';
import client from '../api/client';

interface Setting {
  key: string;
  value: string;
  category: string;
  description: string;
  is_secret: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await client.get<Setting[]>('/settings');
      setSettings(response.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put('/settings', settings); // Uses existing UpdateSettings endpoint
      setSuccess('Settings saved successfully.');
      fetchSettings();
    } catch (err) {
      console.error(err);
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // Helper to initialize defaults if DB is empty
  const handleInitialize = async () => {
      setSaving(true);
      const defaults = [
          { key: 'theme', value: 'dark', category: 'general', description: 'UI Theme' },
          { key: 'refresh_interval', value: '30', category: 'general', description: 'Dashboard Refresh (sec)' },
          { key: 'email_enabled', value: 'false', category: 'notifications', description: 'Enable Email Alerts' },
          { key: 'slack_webhook', value: '', category: 'integrations', description: 'Slack Webhook URL', is_secret: true }
      ];
      try {
          await client.put('/settings', defaults); // Use PUT (UpdateSettings) which handles creation in your backend
          setSuccess('Default settings initialized.');
          fetchSettings();
      } catch (err) {
          setError('Failed to initialize settings.');
      } finally {
          setSaving(false);
      }
  };

  const handleTestIntegration = async (key: string, value: string) => {
      try {
          // Assuming a backend endpoint '/settings/test' exists
          await client.post('/settings/test', { key, value });
          setSuccess(`Connection test for ${key} passed!`);
      } catch (err: any) {
          setError(`Connection test failed: ${err.message || err}`);
      }
  };

  const renderField = (setting: Setting) => {
    const isBoolean = setting.value === 'true' || setting.value === 'false' || setting.key.includes('enabled');

    if (isBoolean) {
      return (
        <Grid container alignItems="center" key={setting.key} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
                <Typography variant="subtitle1" fontWeight="bold">{setting.description || setting.key}</Typography>
                <Typography variant="caption" color="text.secondary">{setting.key}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'right' }}>
                <Switch
                    checked={setting.value === 'true'}
                    onChange={(e) => handleChange(setting.key, String(e.target.checked))}
                    color="primary"
                />
            </Grid>
        </Grid>
      );
    }

    // Check if the setting is a testable integration (e.g., Slack)
    const isTestable = setting.key === 'slack_webhook' || setting.key.includes('smtp');

    return (
      <Box key={setting.key} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>{setting.description || setting.key}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
                fullWidth
                type={setting.is_secret ? 'password' : 'text'}
                value={setting.value}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                placeholder={setting.is_secret ? '••••••••' : ''}
                variant="outlined"
                size="small"
            />
            {isTestable && (
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<SendIcon />}
                    onClick={() => handleTestIntegration(setting.key, setting.value)}
                    sx={{ minWidth: 100 }}
                >
                    Test
                </Button>
            )}
        </Box>
      </Box>
    );
  };

  const filterByCategory = (category: string) => settings.filter(s => s.category === category);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', pb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">System Settings</Typography>
        <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || settings.length === 0}
        >
            {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>

      {/* Empty State / Initialization Handler */}
      {settings.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper', border: '1px dashed rgba(255,255,255,0.2)' }}>
              <Typography variant="h6" gutterBottom>No Settings Found</Typography>
              <Typography color="text.secondary" paragraph>The system configuration has not been initialized yet.</Typography>
              <Button variant="outlined" startIcon={<BuildIcon />} onClick={handleInitialize} disabled={saving}>
                  Initialize Default Settings
              </Button>
          </Paper>
      ) : (
          <Paper sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
            <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)} variant="fullWidth" textColor="primary" indicatorColor="primary">
                <Tab label="General" />
                <Tab label="Notifications" />
                <Tab label="Integrations" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                {filterByCategory('general').length > 0 ? filterByCategory('general').map(renderField) : <Typography color="text.secondary">No general settings.</Typography>}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                {filterByCategory('notifications').length > 0 ? filterByCategory('notifications').map(renderField) : <Typography color="text.secondary">No notification settings.</Typography>}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                 <Alert severity="info" sx={{ mb: 3 }}>API Keys are masked for security.</Alert>
                {filterByCategory('integrations').length > 0 ? filterByCategory('integrations').map(renderField) : <Typography color="text.secondary">No integration settings.</Typography>}
            </TabPanel>
          </Paper>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button startIcon={<RefreshIcon />} onClick={fetchSettings} color="inherit">Reload Settings</Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
