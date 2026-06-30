import React from 'react';
import { Card, CardContent, Typography, Box, Badge, Chip, CardActionArea, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';

const ConversationCard = ({ conversation }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    if (status === 'Resolved') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'In Progress') return 'primary';
    return 'default';
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', transition: '0.2s', '&:hover': { boxShadow: 4, borderColor: 'primary.main' } }}>
      <CardActionArea onClick={() => navigate(`/messages/${conversation.complaintId}`)} sx={{ p: 1 }}>
        <CardContent>
          <Box display="flex" alignItems="flex-start" gap={2}>
            
            <Badge badgeContent={conversation.unreadCount} color="error" overlap="circular">
              <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                <ChatBubbleOutlineIcon />
              </Avatar>
            </Badge>

            <Box flex={1}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                <Typography variant="h6" fontWeight="bold" noWrap sx={{ maxWidth: '400px' }}>
                  {conversation.complaintTitle}
                </Typography>
                <Chip label={conversation.complaintStatus} size="small" color={getStatusColor(conversation.complaintStatus)} variant="outlined" sx={{ fontWeight: 'bold' }} />
              </Box>
              
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                ID: {conversation.complaintId} • With: {conversation.participantName} ({conversation.participantRole})
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color={conversation.unreadCount > 0 ? 'text.primary' : 'text.secondary'} fontWeight={conversation.unreadCount > 0 ? 'bold' : 'normal'} noWrap sx={{ maxWidth: '75%' }}>
                  {conversation.lastMessage}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {conversation.lastMessageTime ? new Date(conversation.lastMessageTime).toLocaleDateString() : ''}
                </Typography>
              </Box>
            </Box>

          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ConversationCard;
