import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
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
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
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
      setSettings(response.data);
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
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put('/settings', settings);
      setSuccess('Settings saved successfully.');
      // Reload to get fresh state (e.g. re-mask secrets)
      fetchSettings();
    } catch (err) {
      console.error(err);
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderField = (setting: Setting) => {
    // Boolean switch for specific keys or based on value
    const isBoolean = setting.value === 'true' || setting.value === 'false' || setting.key.includes('enabled') || setting.key.includes('active');

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

    return (
      <Box key={setting.key} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
            {setting.description || setting.key}
        </Typography>
        <TextField
            fullWidth
            type={setting.is_secret ? 'password' : 'text'}
            value={setting.value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            placeholder={setting.is_secret ? '••••••••' : ''}
            variant="outlined"
            size="small"
            helperText={`Key: ${setting.key}`}
            InputProps={{
                sx: { bgcolor: theme.palette.background.default }
            }}
        />
      </Box>
    );
  };

  const filterByCategory = (category: string) => settings.filter(s => s.category === category);

  if (loading && settings.length === 0) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
        </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', pb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          System Settings
        </Typography>
        <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
        >
            {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>

      <Paper sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#09090b' }}
        >
            <Tab label="General" />
            <Tab label="Notifications" />
            <Tab label="Integrations" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                General Configuration
            </Typography>
            {filterByCategory('general').map(renderField)}
            {filterByCategory('general').length === 0 && <Typography color="text.secondary">No general settings found.</Typography>}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                Alerts & Notifications
            </Typography>
            {filterByCategory('notifications').map(renderField)}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                External Integrations
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                API Keys provided here are stored securely and masked in the UI.
            </Alert>
            {filterByCategory('integrations').map(renderField)}
        </TabPanel>
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button startIcon={<RefreshIcon />} onClick={fetchSettings} color="inherit">
            Reload Settings
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
