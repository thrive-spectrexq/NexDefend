import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Grid, Chip, CircularProgress, Alert, Tooltip, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, PlayArrow as RunIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchPlaybooks, type Playbook } from '@/api/soar';

const PlaybooksPage: React.FC = () => {
  const navigate = useNavigate();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  const loadData = async () => {
      setLoading(true);
      setUsingDemo(false);
      try {
        const data = await fetchPlaybooks();
        setPlaybooks(data);
      } catch (err) {
        console.warn("API failed, falling back to demo data", err);
        // Fallback demo data
        setPlaybooks([
            { id: 'pb-101', name: 'Ransomware Containment', trigger: 'alert.type == "ransomware"', actions: [{ type: 'isolate_host', params: { target: '{ip}' } }, { type: 'notify_slack', params: { channel: '#incidents' } }] },
            { id: 'pb-102', name: 'Phishing Response', trigger: 'email.suspicious == true', actions: [{ type: 'delete_email', params: { msg_id: '{id}' } }] },
            { id: 'pb-103', name: 'New User Onboarding', trigger: 'manual', actions: [{ type: 'check_compliance', params: { user: '{username}' } }] }
        ]);
        setUsingDemo(true);
        // We do not show a blocking error, just an alert that we are in offline/demo mode
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Security Playbooks
        </Typography>
        <Box>
            <Tooltip title="Reload">
                <IconButton onClick={loadData} sx={{ mr: 1 }}><RefreshIcon /></IconButton>
            </Tooltip>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/playbooks/new')}>
              Create Playbook
            </Button>
        </Box>
      </Box>

      {usingDemo && (
        <Alert severity="info" sx={{ mb: 3 }}>
            Backend SOAR service unreachable. Showing <strong>offline/demo</strong> playbooks.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {playbooks.map((playbook) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={playbook.id}>
              <Card sx={{
                  bgcolor: 'background.paper',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                      {playbook.name}
                    </Typography>
                    <Chip
                        label={playbook.trigger === 'manual' ? 'Manual' : 'Automated'}
                        size="small"
                        color={playbook.trigger === 'manual' ? 'default' : 'success'}
                        variant="filled"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'monospace' }}>
                    ID: {playbook.id}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>
                    Actions Chain:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {playbook.actions?.map((action, idx) => (
                      <Chip
                        key={idx}
                        label={action.type.replace('_', ' ')}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(0, 209, 255, 0.1)',
                            color: '#00D1FF',
                            border: '1px solid rgba(0, 209, 255, 0.2)',
                            textTransform: 'capitalize'
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(`/playbooks/edit/${playbook.id}`)}>
                    Edit
                  </Button>
                   <Button size="small" variant="contained" color="success" startIcon={<RunIcon />}>
                    Run
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PlaybooksPage;
