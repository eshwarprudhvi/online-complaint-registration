import React, { useState, useContext } from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery,
  Avatar, Menu, MenuItem, Divider, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import NotificationBell from '../components/notifications/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumbs, Link as MuiLink } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const drawerWidth = 220;

const MainLayout = ({ menuItems, title }) => {
  const { user, logout } = useContext(AuthContext);
  const { mode, toggleTheme } = useContext(ThemeContext);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: muiTheme.palette.primary.main,
        color: 'white',
        py: 2, // Increase Toolbar height for better header spacing
      }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          {title}
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ overflowY: 'auto', flexGrow: 1, py: 3, px: 2 }}>
        <List>
          {menuItems.map((item, index) => {
            if (item.isDivider) {
              return (
                <Box key={index} sx={{ mt: 2, mb: 1 }}>
                  <Divider sx={{ my: 1 }} />
                  {item.label && (
                    <Typography variant="overline" sx={{ px: 2, color: 'text.secondary', fontWeight: 'bold' }}>
                      {item.label}
                    </Typography>
                  )}
                </Box>
              );
            }
            
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <ListItemButton 
                key={index} 
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  mx: 0,
                  my: 1, // Increase spacing between nav items
                  py: 1.5, // Increase padding inside nav item
                  borderRadius: 2,
                  width: '100%',
                  backgroundColor: isActive ? muiTheme.palette.primary.light + '22' : 'transparent',
                  color: isActive ? muiTheme.palette.primary.main : 'text.primary',
                  '&:hover': {
                    backgroundColor: muiTheme.palette.primary.light + '44',
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? muiTheme.palette.primary.main : 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontWeight: isActive ? 'bold' : 'normal', fontSize: '1rem' }}>{item.label}</Typography>} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          width: { md: `calc(100% - ${drawerWidth}px)` }, 
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
              <Typography color="text.primary" variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}>
                {location.pathname.split('/')[1] || 'Dashboard'}
              </Typography>
              {location.pathname.split('/')[2] && (
                <Typography color="text.secondary" variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {location.pathname.split('/')[2].replace(/-/g, ' ')}
                </Typography>
              )}
            </Breadcrumbs>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Tooltip title="Toggle Theme">
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            
            <NotificationBell />
            
            <IconButton onClick={handleProfileMenuOpen} color="inherit" sx={{ ml: 1 }}>
              <Avatar sx={{ bgcolor: muiTheme.palette.primary.main, width: 36, height: 36 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, minWidth: 240, borderRadius: 3 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }} sx={{ py: 1.5, px: 3 }}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5, px: 3 }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
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
          px: { xs: 2, md: 3 }, 
          py: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          overflowX: 'hidden'
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default MainLayout;
