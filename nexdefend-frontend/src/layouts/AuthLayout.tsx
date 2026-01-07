import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
            NexDefend
          </Typography>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
