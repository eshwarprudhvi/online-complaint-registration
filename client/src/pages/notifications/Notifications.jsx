import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Button, Checkbox, FormControlLabel, TextField, Card, InputAdornment } from '@mui/material';
import api from '../../services/api';
import NotificationCard from '../../components/notifications/NotificationCard';
import SearchIcon from '@mui/icons-material/Search';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (showUnreadOnly && n.isRead) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Notification Center</Typography>
          <Typography color="text.secondary">Stay updated with your latest alerts and messages.</Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<DoneAllIcon />} 
          onClick={handleMarkAllRead}
          sx={{ borderRadius: 2 }}
        >
          Mark All as Read
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 4, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField 
            label="Search notifications..." 
            variant="outlined" 
            size="small" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '250px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={<Checkbox checked={showUnreadOnly} onChange={(e) => setShowUnreadOnly(e.target.checked)} color="primary" />}
            label="Unread Only"
            sx={{ m: 0 }}
          />
        </Box>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredNotifications.length === 0 ? (
        <Box textAlign="center" mt={6} p={4} sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary">All caught up!</Typography>
          <Typography color="text.disabled">No notifications match your criteria.</Typography>
        </Box>
      ) : (
        <Box>
          {filteredNotifications.map(notif => (
            <NotificationCard 
              key={notif._id} 
              notification={notif} 
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Notifications;
