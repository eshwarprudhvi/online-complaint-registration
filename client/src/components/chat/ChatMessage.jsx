import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const ChatMessage = ({ message, isSelf }) => {
  const align = isSelf ? 'flex-end' : 'flex-start';
  const bgColor = isSelf ? '#1976d2' : '#ffffff';
  const textColor = isSelf ? '#ffffff' : '#000000';

  return (
    <Box display="flex" flexDirection="column" alignItems={align}>
      <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, mx: 1 }}>
        {message.senderId?.name || 'Unknown Sender'}
      </Typography>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1.5, 
          maxWidth: '70%', 
          backgroundColor: bgColor, 
          color: textColor,
          borderRadius: isSelf ? '20px 20px 4px 20px' : '20px 20px 20px 4px'
        }}
      >
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {message.message}
        </Typography>
        <Box display="flex" justifyContent="flex-end" alignItems="center" mt={0.5} gap={0.5}>
          <Typography variant="caption" sx={{ color: isSelf ? '#bbdefb' : 'text.secondary', fontSize: '0.7rem' }}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          {isSelf && (
            message.isRead ? 
              <DoneAllIcon sx={{ fontSize: 16, color: '#4caf50' }} /> : 
              <CheckIcon sx={{ fontSize: 16, color: '#bbdefb' }} />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatMessage;
