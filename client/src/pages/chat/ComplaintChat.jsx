import React, { useEffect, useState, useContext } from 'react';
import { Box, Paper, Typography, Button, IconButton, Card, Badge, Avatar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { SnackbarContext } from '../../context/SnackbarContext';
import ChatWindow from '../../components/chat/ChatWindow';
import MessageInput from '../../components/chat/MessageInput';
import useSocket from '../../hooks/useSocket';
import usePresence from '../../hooks/usePresence';

const ComplaintChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const showSnackbar = useContext(SnackbarContext);
  const { isUserOnline } = usePresence();

  const [messages, setMessages] = useState([]);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${id}`);
      setMessages(res.data);
      const hasUnread = res.data.some(m => !m.isRead && m.receiverId?._id === user.id);
      if (hasUnread) {
        await api.put(`/messages/${id}/read`);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const fetchComplaintDetails = async () => {
    try {
      const res = await api.get('/messages');
      const current = res.data.find(c => c.complaintId === id);
      if (current) setComplaintDetails(current);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
    fetchMessages();
  }, [id]);

  const handleIncomingMessage = (message) => {
    if (message.complaintId === id) {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      if (message.receiverId === user.id || message.receiverId?._id === user.id) {
        api.put(`/messages/${id}/read`).catch(console.error);
      }
    }
  };

  useSocket('MESSAGE_RECEIVED', handleIncomingMessage);

  const handleSendMessage = async (text) => {
    setIsSending(true);
    try {
      const res = await api.post('/messages', {
        complaintId: id,
        message: text
      });
      setMessages(prev => {
        if (prev.some(m => m._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const participantOnline = complaintDetails?.participantId ? isUserOnline(complaintDetails.participantId) : false;

  return (
    <Card elevation={4} sx={{ height: '85vh', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ 
        p: 2, 
        backgroundColor: 'primary.main', 
        color: 'primary.contrastText', 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: 2,
        zIndex: 1
      }}>
        <IconButton color="inherit" onClick={() => navigate('/messages')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          color={participantOnline ? 'success' : 'error'}
          sx={{ mr: 2 }}
        >
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            {complaintDetails?.participantName?.charAt(0) || 'U'}
          </Avatar>
        </Badge>
        
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
            {complaintDetails?.complaintTitle || 'Loading Chat...'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {complaintDetails?.participantName} ({complaintDetails?.participantRole}) • {complaintDetails?.complaintStatus}
          </Typography>
        </Box>
      </Box>

      {/* Chat Messages */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
        <ChatWindow messages={messages} currentUserId={user.id} />
      </Box>

      {/* Input */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <MessageInput onSend={handleSendMessage} isSending={isSending} />
      </Box>
    </Card>
  );
};

export default ComplaintChat;
