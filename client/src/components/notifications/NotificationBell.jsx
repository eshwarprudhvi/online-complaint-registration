import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import api from '../../services/api';
import NotificationDropdown from './NotificationDropdown';
import useNotifications from '../../hooks/useNotifications';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread');
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread notifications', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useNotifications(() => {
    setUnreadCount(prev => prev + 1);
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    fetchUnreadCount(); // Refresh count on close
  };

  return (
    <Box>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <NotificationDropdown 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleClose} 
        refreshCount={fetchUnreadCount}
      />
    </Box>
  );
};

export default NotificationBell;
