import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import ChatMessage from './ChatMessage';

const ChatWindow = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {messages.map((msg) => (
        <ChatMessage 
          key={msg._id} 
          message={msg} 
          isSelf={msg.senderId?._id === currentUserId || msg.senderId === currentUserId} 
        />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
};

export default ChatWindow;
