import React, { useEffect, useState } from 'react';
import { Menu, MenuItem, Typography, Box, Button, Divider, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

import useNotifications from '../../hooks/useNotifications';

const NotificationDropdown = ({ anchorEl, open, onClose, refreshCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useNotifications((notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 5));
  });

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.slice(0, 5)); // Show only top 5 in dropdown
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
      refreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif._id}/read`);
        refreshCount();
      } catch (err) {}
    }
    onClose();
    if (notif.complaintId) {
      // Depending on user role, it might be /complaints/:id or /officer/complaints/:id
      // We will let the user navigate manually from the central page, or just try /complaints/:id
      // For a universal approach, maybe redirect to a generic view or just the notifications page
      navigate('/notifications');
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { 
          maxHeight: 400, 
          width: '380px', 
          borderRadius: 3, 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'none',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Notifications</Typography>
        <Button size="small" onClick={async () => {
          await api.put('/notifications/read-all');
          fetchNotifications();
          refreshCount();
        }}>Mark all as read</Button>
      </Box>
      <Divider />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : notifications.length === 0 ? (
        <MenuItem disabled>No notifications</MenuItem>
      ) : (
        notifications.map((notif) => (
          <MenuItem 
            key={notif._id} 
            onClick={() => handleNotificationClick(notif)}
            sx={{ 
              backgroundColor: notif.isRead ? 'transparent' : 'action.hover',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 1.5,
              whiteSpace: 'normal',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
              {notif.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}>
              {notif.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(notif.createdAt).toLocaleDateString()}
            </Typography>
          </MenuItem>
        ))
      )}
      
      <Divider />
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Button fullWidth onClick={handleViewAll}>View All Notifications</Button>
      </Box>
    </Menu>
  );
};

export default NotificationDropdown;
