import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Divider,
  IconButton,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPlaybooks, savePlaybooks, Playbook, PlaybookAction } from '@/api/soar';

const PlaybookEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const [playbook, setPlaybook] = useState<Playbook>({
    id: '',
    name: '',
    trigger: '',
    actions: [],
  });
  const [allPlaybooks, setAllPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPlaybooks();
        setAllPlaybooks(data);

        if (!isNew && id) {
          const found = data.find((p) => p.id === id);
          if (found) {
            setPlaybook(found);
          } else {
            setError('Playbook not found');
          }
        } else {
             // Generate a random ID for new playbooks for now
             setPlaybook({
                 id: `pb-${Math.floor(Math.random() * 1000)}`,
                 name: 'New Playbook',
                 trigger: '',
                 actions: []
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
      let updatedList = [...allPlaybooks];
      if (isNew) {
        updatedList.push(playbook);
      } else {
        updatedList = updatedList.map((p) => (p.id === playbook.id ? playbook : p));
      }

      await savePlaybooks(updatedList);
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

  const updateAction = (index: number, field: keyof PlaybookAction, value: any) => {
    const newActions = [...playbook.actions];
    // @ts-ignore
    newActions[index][field] = value;
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
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

        <Grid item xs={12} md={8}>
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
                    <Grid item xs={12} sm={4}>
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
                    <Grid item xs={12} sm={8}>
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
