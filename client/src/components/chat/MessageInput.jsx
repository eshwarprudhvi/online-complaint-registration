import React, { useState } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const MessageInput = ({ onSend, isSending }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !isSending) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'background.paper', display: 'flex', alignItems: 'center', gap: 1, borderTop: '1px solid #e0e0e0' }}>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="Type a message..."
        variant="outlined"
        size="small"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={isSending}
        inputProps={{ maxLength: 1000 }}
      />
      <IconButton 
        color="primary" 
        onClick={handleSend} 
        disabled={!text.trim() || isSending}
      >
        {isSending ? <CircularProgress size={24} /> : <SendIcon />}
      </IconButton>
    </Box>
  );
};

export default MessageInput;
