import React from 'react';
import {
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Avatar,
  Menu,
  MenuItem,
  InputBase,
  Button,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  NotificationsActive as AlertIcon,
  BugReport as BugIcon,
  Computer as ComputerIcon,
  BarChart as ChartIcon,
  Hub as HubIcon,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
  Search as SearchIcon,
  Notifications as BellIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';

const drawerWidth = 260;

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleCloseUserMenu();
    navigate('/login');
  };

  // Restored Security Navigation
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Cloud Monitoring', icon: <CloudIcon />, path: '/cloud-monitoring' },
    { text: 'Alerts', icon: <AlertIcon />, path: '/alerts' },
    { text: 'Incidents', icon: <BugIcon />, path: '/incidents' },
    { text: 'Agents', icon: <ComputerIcon />, path: '/agents' },
    { text: 'Network Topology', icon: <HubIcon />, path: '/topology' },
    { text: 'Data Explorer', icon: <ChartIcon />, path: '/data-explorer' },
    { text: 'Console', icon: <TerminalIcon />, path: '/console' },
  ];

  const monitoringItems = [
    { text: 'Grafana', icon: <SpeedIcon />, path: '/grafana' },
    { text: 'Prometheus', icon: <StorageIcon />, path: '/prometheus' },
  ];

  const secondaryMenuItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#050505' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 1, color: 'text.primary' }}>
          NexDefend
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
      </Box>

      {/* Primary Navigation */}
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'text.primary',
                  '& .MuiListItemIcon-root': { color: 'text.primary' },
                },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1, mx: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Monitoring Navigation */}
      <Typography variant="caption" sx={{ px: 3, color: 'text.secondary', fontWeight: 'bold' }}>
        MONITORING
      </Typography>
      <List sx={{ px: 2 }}>
        {monitoringItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'text.primary',
                  '& .MuiListItemIcon-root': { color: 'text.primary' },
                },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1, mx: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Secondary Navigation */}
      <List sx={{ px: 2 }}>
        {secondaryMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* System Status Card */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Card sx={{ bgcolor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.primary' }}>
               <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: '#4caf50' }} />
               <Typography variant="subtitle2" fontWeight="bold">System Status</Typography>
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Services</Typography>
                <Chip label="Healthy" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }} />
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Agents</Typography>
                <Typography variant="caption" fontWeight="bold">Active</Typography>
             </Box>
          </CardContent>
        </Card>
      </Box>

      {/* User Profile */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          alt="Admin User"
          src="/static/images/avatar/2.jpg"
          sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
        />
        <Box sx={{ flexGrow: 1 }}>
           <Typography variant="subtitle2" fontWeight="bold">Admin User</Typography>
           <Typography variant="caption" color="text.secondary">admin@nexdefend.com</Typography>
        </Box>
        <IconButton size="small" onClick={handleOpenUserMenu}>
          <MoreIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Menu
          sx={{ mt: '-45px', ml: '60px' }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <MenuItem onClick={handleCloseUserMenu}>Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.default',
          borderBottom: 'none',
          color: 'text.primary',
          pt: 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Dashboard &gt; <Typography component="span" variant="body2" color="text.primary">Overview</Typography>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <Box
               sx={{
                 display: 'flex',
                 alignItems: 'center',
                 bgcolor: '#09090b',
                 borderRadius: 1,
                 border: '1px solid rgba(255,255,255,0.1)',
                 px: 1,
                 py: 0.5,
                 width: 250
               }}
             >
               <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
               <InputBase
                 placeholder="Search assets, IP, logs..."
                 sx={{ color: 'text.primary', fontSize: '0.875rem', width: '100%' }}
               />
             </Box>

             <Button
               variant="outlined"
               startIcon={<CalendarIcon />}
               sx={{
                 borderColor: 'rgba(255,255,255,0.1)',
                 color: 'text.primary',
                 textTransform: 'none',
                 bgcolor: '#09090b',
                 height: 36,
                 '&:hover': { borderColor: 'rgba(255,255,255,0.2)', bgcolor: '#09090b' }
               }}
             >
               {new Date().toLocaleDateString()}
             </Button>

             <IconButton
                sx={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: '#09090b',
                  borderRadius: 1,
                  width: 36,
                  height: 36
                }}
             >
               <BellIcon fontSize="small" />
             </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255,255,255,0.08)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
