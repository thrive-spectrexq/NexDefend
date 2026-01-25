import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid, Avatar, Chip, Alert, Snackbar, Tabs, Tab, Divider
} from '@mui/material';
import { Person as PersonIcon, Lock as LockIcon, Save as SaveIcon, VerifiedUser as RoleIcon } from '@mui/icons-material';
import client from '@/api/client';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  // Form States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/auth/profile');
      setProfile(res.data);
      setUsername(res.data.username);
      setEmail(res.data.email);
    } catch (err) {
      console.error("Failed to load profile", err);
      // Fallback for demo/dev when auth isn't fully working locally
      setUsingDemo(true);
      const demoProfile = {
          id: 1,
          username: "Demo User",
          email: "demo@nexdefend.ai",
          role: "admin",
          created_at: new Date().toISOString()
      };
      setProfile(demoProfile);
      setUsername(demoProfile.username);
      setEmail(demoProfile.email);
    }
  };

  const handleUpdateInfo = async () => {
    setLoading(true);
    try {
      if (!usingDemo) {
          await client.put('/auth/profile', { username, email });
      } else {
          // Simulate delay
          await new Promise(r => setTimeout(r, 1000));
      }
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      // In real app we would refetch, but for demo we just keep state
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      if (!usingDemo) {
          await client.put('/auth/profile', {
              old_password: oldPassword,
              password: newPassword
          });
      } else {
           await new Promise(r => setTimeout(r, 1000));
      }
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
        // Backend returns 401 for bad old password
        // Use type assertion for basic Axios-like error structure if needed
        const error = err as { response?: { status: number } };
        if (error.response?.status === 401) {
            setMessage({ type: 'error', text: 'Incorrect old password' });
        } else {
            setMessage({ type: 'error', text: 'Failed to update password' });
        }
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <Box sx={{ p: 4 }}><Typography>Loading Profile...</Typography></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Account Settings</Typography>

      {usingDemo && <Alert severity="warning" sx={{ mb: 3 }}>Running in Demo Mode (Backend Unreachable)</Alert>}

      {/* User Header Card */}
      <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
            {profile.username.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight="bold">{profile.username}</Typography>
            <Typography variant="body2" color="text.secondary">{profile.email}</Typography>
        </Box>
        <Chip
            icon={<RoleIcon sx={{ fontSize: 16 }} />}
            label={profile.role.toUpperCase()}
            color={profile.role === 'admin' ? 'secondary' : 'default'}
            variant="outlined"
        />
      </Paper>

      <Paper sx={{ overflow: 'hidden', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab icon={<PersonIcon />} iconPosition="start" label="General Info" />
            <Tab icon={<LockIcon />} iconPosition="start" label="Security" />
        </Tabs>

        {/* Tab 1: General Info */}
        {tabValue === 0 && (
            <Box sx={{ p: 4 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth label="Username" variant="outlined"
                            value={username} onChange={(e) => setUsername(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth label="Email Address" variant="outlined"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Button
                            variant="contained" startIcon={<SaveIcon />}
                            onClick={handleUpdateInfo} disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        )}

        {/* Tab 2: Security */}
        {tabValue === 1 && (
            <Box sx={{ p: 4 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    To change your password, you must verify your current password first.
                </Alert>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth type="password" label="Current Password"
                            value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Divider />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth type="password" label="New Password"
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth type="password" label="Confirm New Password"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Button
                            variant="contained" color="warning" startIcon={<LockIcon />}
                            onClick={handleUpdatePassword} disabled={loading || !oldPassword}
                        >
                            {loading ? 'Updating...' : 'Change Password'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        )}
      </Paper>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={message?.type} onClose={() => setMessage(null)}>{message?.text}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
