import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Add as AddIcon, Radar } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPlaybooks as fetchPolicies, savePolicyPlaybook, type Playbook } from '@/api/policy';

interface PlaybookAction {
  type: string;
  params: Record<string, string>;
}

// Extension of the API Playbook for the editor's needs
interface EditorPlaybook extends Omit<Playbook, 'actions' | 'id'> {
  id: string | number;
  trigger: string;
  actions: PlaybookAction[];
}

const PlaybookEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const [playbook, setPlaybook] = useState<EditorPlaybook>({
    id: '',
    name: '',
    trigger: '',
    actions: [],
    threatContext: '',
    score: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!isNew && id) {
          const data = await fetchPolicies();
          const found = data.find((p) => p.id.toString() === id);
          if (found) {
            // Convert API Playbook to EditorPlaybook
            setPlaybook({
              ...found,
              trigger: '', // Default if missing
              actions: found.actions ? JSON.parse(found.actions) : []
            });
          } else {
            setError('Playbook not found');
          }
        } else {
          setPlaybook({
            id: `pb-${Math.floor(Math.random() * 1000)}`,
            name: 'New Playbook',
            trigger: '',
            actions: [],
            threatContext: 'General',
            score: 0
          });
        }
      } catch (err) {
        console.error("Failed to load", err);
        setError("Failed to load playbooks.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isNew]);

  const handleSave = async () => {
    try {
      // Convert EditorPlaybook back to API format
      const apiPlaybook = {
        ...playbook,
        id: isNew ? undefined : Number(playbook.id),
        actions: JSON.stringify(playbook.actions)
      };

      await savePolicyPlaybook(apiPlaybook);
      navigate('/playbooks');
    } catch (err) {
      console.error("Failed to save", err);
      setError("Failed to save playbook.");
    }
  };

  const addAction = () => {
    setPlaybook({
      ...playbook,
      actions: [...playbook.actions, { type: 'scan', params: { target: '{source_ip}' } }],
    });
  };

  const removeAction = (index: number) => {
    const newActions = [...playbook.actions];
    newActions.splice(index, 1);
    setPlaybook({ ...playbook, actions: newActions });
  };

  const updateAction = (index: number, field: keyof PlaybookAction, value: string) => {
    const newActions = [...playbook.actions];
    if (field === 'type') {
      newActions[index].type = value;
    }
    setPlaybook({ ...playbook, actions: newActions });
  };

  const updateActionParam = (index: number, paramKey: string, paramValue: string) => {
    const newActions = [...playbook.actions];
    newActions[index].params = { ...newActions[index].params, [paramKey]: paramValue };
    setPlaybook({ ...playbook, actions: newActions });
  }

  if (loading) return <Box p={3}>Loading...</Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/playbooks')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {isNew ? 'Create Playbook' : 'Edit Playbook'}
        </Typography>
        <Box flexGrow={1} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3, p: 2, bgcolor: '#0f172a', border: '1px dashed rgba(0, 209, 255, 0.3)' }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2, textAlign: 'center' }}>
          Automation Pipeline Visualization
        </Typography>
        <Stepper alternativeLabel>
          {/* Start Node */}
          <Step active={true} completed={true}>
            <StepLabel icon={<Radar color="primary" />}>Trigger: {playbook.trigger || 'Manual'}</StepLabel>
          </Step>

          {/* Dynamic Actions */}
          {playbook.actions.map((action, index) => (
            <Step key={index} active={true}>
              <StepLabel>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {action.type.replace('_', ' ')}
                </Typography>
              </StepLabel>
            </Step>
          ))}

          {/* End Node */}
          <Step active={false}>
            <StepLabel icon={<div style={{ width: 10, height: 10, borderRadius: '50%', background: '#666' }} />}>
              End
            </StepLabel>
          </Step>
        </Stepper>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'background.paper', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>General Info</Typography>
              <TextField
                label="Playbook ID"
                fullWidth
                value={playbook.id}
                disabled={!isNew}
                onChange={(e) => setPlaybook({ ...playbook, id: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Name"
                fullWidth
                value={playbook.name}
                onChange={(e) => setPlaybook({ ...playbook, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Trigger Condition (e.g. incident.severity == 'High')"
                fullWidth
                value={playbook.trigger}
                onChange={(e) => setPlaybook({ ...playbook, trigger: e.target.value })}
                sx={{ mb: 2 }}
                helperText="Leave empty for manual trigger only"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Actions</Typography>
                <Button startIcon={<AddIcon />} size="small" onClick={addAction}>
                  Add Action
                </Button>
              </Box>

              {playbook.actions.map((action, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Step {index + 1}</Typography>
                    <IconButton size="small" color="error" onClick={() => removeAction(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        select
                        label="Type"
                        fullWidth
                        size="small"
                        SelectProps={{ native: true }}
                        value={action.type}
                        onChange={(e) => updateAction(index, 'type', e.target.value)}
                      >
                        <option value="scan">Scan</option>
                        <option value="isolate">Isolate</option>
                        <option value="block">Block</option>
                        <option value="disable_user">Disable User</option>
                        <option value="kill_process">Kill Process</option>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      {/* Dynamic Params Editing - Simplified for now */}
                      {Object.entries(action.params).map(([key, value]) => (
                        <TextField
                          key={key}
                          label={`Param: ${key}`}
                          fullWidth
                          size="small"
                          value={value}
                          onChange={(e) => updateActionParam(index, key, e.target.value)}
                          sx={{ mb: 1 }}
                        />
                      ))}
                      {Object.keys(action.params).length === 0 && (
                        <Typography variant="caption" color="text.secondary">No parameters needed for this action.</Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {playbook.actions.length === 0 && (
                <Typography color="text.secondary" align="center" py={4}>
                  No actions defined. Click "Add Action" to start.
                </Typography>
              )}

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlaybookEditorPage;
