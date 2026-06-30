import React from 'react';
import { Card, CardContent, Typography, Box, Button, IconButton, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  return (
    <Card sx={{ 
      mb: 2, 
      backgroundColor: notification.isRead ? 'background.paper' : 'primary.light', 
      borderLeft: notification.isRead ? 'none' : '4px solid',
      borderLeftColor: 'primary.main',
      borderRadius: 3,
      boxShadow: notification.isRead ? 'none' : 2,
      border: notification.isRead ? '1px solid' : 'none',
      borderColor: 'divider',
      transition: 'all 0.3s ease'
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          
          <Avatar sx={{ bgcolor: notification.isRead ? 'grey.300' : 'primary.main', color: notification.isRead ? 'grey.600' : 'primary.contrastText' }}>
            <NotificationsActiveIcon fontSize="small" />
          </Avatar>
          
          <Box flex={1}>
            <Typography variant="h6" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold', color: notification.isRead ? 'text.secondary' : 'text.primary', fontSize: '1rem' }}>
              {notification.title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: notification.isRead ? 'text.secondary' : 'text.primary' }}>
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
              {new Date(notification.createdAt).toLocaleString()}
            </Typography>
          </Box>
          
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            {!notification.isRead && (
              <Button 
                startIcon={<CheckCircleOutlinedIcon />} 
                size="small" 
                variant="contained"
                color="primary"
                onClick={() => onMarkAsRead(notification._id)}
                sx={{ borderRadius: 2 }}
              >
                Mark Read
              </Button>
            )}
            <IconButton color="error" size="small" onClick={() => onDelete(notification._id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
