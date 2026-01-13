import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Box, Container, Typography, useScrollTrigger, Slide, Stack, IconButton, Menu, MenuItem, Avatar, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import BoltIcon from '@mui/icons-material/Bolt';
import { logout } from '@/store/authSlice';
import type { RootState } from '@/store';

interface Props {
  window?: () => Window;
}

const HideOnScroll = (props: { children: React.ReactElement; window?: () => Window }) => {
  const { children, window } = props;
  const trigger = useScrollTrigger({ target: window ? window() : undefined });
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const Navbar: React.FC<Props> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // User Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // State for changing navbar appearance on scroll
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const isHomePage = location.pathname === '/';

  return (
    <HideOnScroll {...props}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled || !isHomePage ? 'rgba(15, 23, 42, 0.8)' : 'transparent',
          backdropFilter: scrolled || !isHomePage ? 'blur(16px)' : 'none',
          borderBottom: scrolled || !isHomePage ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
          transition: 'all 0.3s ease-in-out',
          py: 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo Section */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexGrow: 1,
                    cursor: 'pointer',
                    '&:hover .logo-icon': { color: '#00D1FF', transform: 'scale(1.1)' }
                }}
                onClick={() => navigate('/')}
            >
              <BoltIcon className="logo-icon" sx={{ mr: 1, fontSize: 32, color: 'white', transition: 'all 0.3s ease' }} />
              <Typography
                variant="h5"
                sx={{
                    fontWeight: 800,
                    letterSpacing: -0.5,
                    background: 'linear-gradient(90deg, #fff 0%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
              >
                NexDefend
              </Typography>
            </Box>

            {/* Desktop Menu */}
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                {!isAuthenticated && (
                    <>
                        <Button color="inherit" onClick={() => navigate('/')} sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>Product</Button>
                        <Button color="inherit" onClick={() => navigate('/')} sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>Solutions</Button>
                        <Button color="inherit" onClick={() => navigate('/')} sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>Pricing</Button>

                        <Box sx={{ width: 1, height: 24, bgcolor: 'rgba(255,255,255,0.2)', mx: 2 }} />

                        <Button
                            color="inherit"
                            onClick={() => navigate('/login')}
                            sx={{ fontWeight: 600 }}
                        >
                            Sign In
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/register')}
                            sx={{
                                borderRadius: '50px',
                                px: 3,
                                boxShadow: '0 0 15px rgba(0, 209, 255, 0.3)',
                                '&:hover': { boxShadow: '0 0 25px rgba(0, 209, 255, 0.5)' }
                            }}
                        >
                            Get Started
                        </Button>
                    </>
                )}

                {isAuthenticated && (
                    <>
                        <Button
                            variant="text"
                            color="inherit"
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </Button>
                        <Tooltip title="Account Settings">
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '1rem' }}>
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                            slotProps={{ paper: { sx: { bgcolor: '#0f172a', border: '1px solid #1e293b' } } }}
                        >
                            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>Profile</MenuItem>
                            <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>Settings</MenuItem>
                            <MenuItem onClick={() => {
                                setAnchorEl(null);
                                dispatch(logout());
                                navigate('/');
                            }}>
                                Logout
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Stack>

            {/* Mobile Menu Icon */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              sx={{ display: { xs: 'flex', md: 'none' }, ml: 2 }}
            >
              <MenuIcon />
            </IconButton>

          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;
