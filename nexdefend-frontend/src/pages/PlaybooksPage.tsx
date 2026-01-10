import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, PlayArrow as RunIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchPlaybooks } from '@/api/soar';
import type { Playbook } from '@/api/soar';

const PlaybooksPage: React.FC = () => {
  const navigate = useNavigate();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPlaybooks();
        setPlaybooks(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load playbooks", err);
        // Fallback for demo if API is not reachable yet
        setPlaybooks([
            { id: 'pb-001', name: 'High-Severity Incident Playbook', trigger: 'incident.severity == "High"', actions: [{ type: 'scan', params: { target: '{source_ip}' } }] },
            { id: 'pb-002', name: 'User Compromise Playbook', trigger: 'manual', actions: [{ type: 'disable_user', params: { username: '{username}' } }] }
        ]);
        // setError('Failed to load playbooks. Showing cached/demo data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreate = () => {
    navigate('/playbooks/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/playbooks/edit/${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Playbooks
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Create Playbook
        </Button>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {playbooks.map((playbook) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={playbook.id}>
              <Card sx={{ bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {playbook.name}
                    </Typography>
                    <Chip
                        label={playbook.trigger || 'Manual'}
                        size="small"
                        color={playbook.trigger ? 'warning' : 'default'}
                        variant="outlined"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ID: {playbook.id}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Actions ({playbook.actions?.length || 0}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {playbook.actions?.map((action, idx) => (
                      <Chip key={idx} label={action.type} size="small" sx={{ bgcolor: 'action.selected' }} />
                    ))}
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(playbook.id)}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                   <Button
                    size="small"
                    startIcon={<RunIcon />}
                    color="success"
                    variant="contained"
                  >
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
