import React from 'react';
import { AppBar, Toolbar, Button, Box, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'rgba(10, 25, 41, 0.8)', backdropFilter: 'blur(10px)', boxShadow: 'none', borderBottom: '1px solid rgba(0, 163, 255, 0.1)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 1 }}>
              NexDefend
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {isAuthenticated ? (
              <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="outlined" color="primary" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
