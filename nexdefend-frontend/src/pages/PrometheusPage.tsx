import React from 'react';
import { Box, Typography } from '@mui/material';

const PrometheusPage: React.FC = () => {
  const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL || 'http://localhost:9090';

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Prometheus
      </Typography>
      <Box
        component="iframe"
        src={prometheusUrl}
        sx={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 2,
          bgcolor: '#222'
        }}
        title="Prometheus"
      />
    </Box>
  );
};

export default PrometheusPage;
