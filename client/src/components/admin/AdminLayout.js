import React, { useState, useContext } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
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
  Container,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  VideoLibrary as VideoIcon,
  LocalOffer as TagIcon,
  Business as StudioIcon,
  People as UserIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import SettingsContext from '../../context/SettingsContext';

const drawerWidth = 240;

const AdminLayout = () => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useContext(SettingsContext);
  
  // User menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openUserMenu = Boolean(anchorEl);
  
  // Set drawer closed by default on mobile
  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };
  
  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/profile');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Videos', icon: <VideoIcon />, path: '/admin/videos' },
    { text: 'Tags', icon: <TagIcon />, path: '/admin/tags' },
    { text: 'Studios', icon: <StudioIcon />, path: '/admin/studios' },
    { text: 'Users', icon: <UserIcon />, path: '/admin/users' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          width: '100%' // Always take full width
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            {settings.siteName} Admin
          </Typography>
          
          {/* User menu */}
          <Box>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={openUserMenu ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openUserMenu ? 'true' : undefined}
              >
                {user?.name ? (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={openUserMenu}
              onClose={handleUserMenuClose}
              onClick={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            mt: '64px', // Height of AppBar
          },
        }}
      >
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ mt: 2, mb: 2 }} />
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/">
                <ListItemIcon><VideoIcon /></ListItemIcon>
                <ListItemText primary="Back to Site" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mt: 8,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout; 