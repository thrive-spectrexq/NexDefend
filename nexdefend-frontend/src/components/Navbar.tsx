import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import ShieldIcon from '@mui/icons-material/Shield';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'rgba(10, 25, 41, 0.8)', backdropFilter: 'blur(10px)', boxShadow: 'none', borderBottom: '1px solid rgba(0, 163, 255, 0.1)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <ShieldIcon sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: '0.05em', color: 'text.primary' }}>
              NEXDEFEND
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
