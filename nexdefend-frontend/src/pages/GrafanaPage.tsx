import React from 'react';
import { Box, Typography } from '@mui/material';

const GrafanaPage: React.FC = () => {
  const grafanaUrl = import.meta.env.VITE_GRAFANA_URL || 'http://localhost:3001';

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Grafana Dashboard
      </Typography>
      <Box
        component="iframe"
        src={grafanaUrl}
        sx={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 2,
          bgcolor: '#181b1f' // Matches Grafana dark theme roughly
        }}
        title="Grafana"
      />
    </Box>
  );
};

export default GrafanaPage;
