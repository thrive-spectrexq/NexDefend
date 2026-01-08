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
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  NotificationsActive as AlertIcon,
  BugReport as BugIcon,
  Computer as ComputerIcon,
  Rule as RuleIcon,
  Assessment as AssessmentIcon,
  BarChart as ChartIcon,
  Hub as HubIcon,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
  IntegrationInstructions as IntegrationIcon,
  Shield as ShieldIcon,
  NetworkCheck as NetworkIcon,
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

  // Navigation Items Structure
  const menuItems = [
    {
      header: 'Overview',
      items: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Console', icon: <TerminalIcon />, path: '/console' },
        { text: 'Security Overview', icon: <ShieldIcon />, path: '/security-overview' },
      ],
    },
    {
      header: 'Monitoring',
      items: [
        { text: 'Alerts', icon: <AlertIcon />, path: '/alerts' },
        { text: 'Incidents', icon: <BugIcon />, path: '/incidents' },
      ],
    },
    {
      header: 'Management',
      items: [
        { text: 'Agents', icon: <ComputerIcon />, path: '/agents' },
        { text: 'Vulnerabilities', icon: <BugIcon />, path: '/vulnerabilities' }, // Reusing BugIcon or find better
        { text: 'Process Explorer', icon: <AssessmentIcon />, path: '/processes' },
        { text: 'Rules', icon: <RuleIcon />, path: '/rules' },
      ],
    },
    {
      header: 'Analytics',
      items: [
        { text: 'Data Explorer', icon: <ChartIcon />, path: '/data-explorer' },
        { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
      ],
    },
     {
      header: 'Operations',
      items: [
        { text: 'Integrations', icon: <IntegrationIcon />, path: '/integrations' },
        { text: 'Mission Control', icon: <SecurityIcon />, path: '/mission-control' },
      ],
    },
    {
      header: 'Network',
      items: [
        { text: 'Network Topology', icon: <HubIcon />, path: '/topology' },
        { text: 'Network Dashboard', icon: <NetworkIcon />, path: '/network-dashboard' },
      ],
    },
    {
      header: 'Settings',
      items: [
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      ],
    },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main', letterSpacing: 1 }}>
          NEXDEFEND
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((section, index) => (
          <React.Fragment key={index}>
            <ListItem sx={{ py: 1, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                {section.header}
              </Typography>
            </ListItem>
            {section.items.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      borderRight: '3px solid',
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(0, 209, 255, 0.08)',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem' }} />
                </ListItemButton>
              </ListItem>
            ))}
            {index < menuItems.length - 1 && <Divider sx={{ my: 1, opacity: 0.2 }} />}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Admin User" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
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
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
