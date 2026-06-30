import React, { useEffect, useState } from 'react';
import { Typography, Box, TextField, CircularProgress, Card } from '@mui/material';
import api from '../../services/api';
import ConversationCard from '../../components/chat/ConversationCard';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await api.get('/messages');
        setConversations(res.data);
      } catch (err) {
        console.error('Failed to fetch conversation summaries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  const filteredConversations = conversations.filter(c => 
    c.complaintId.toLowerCase().includes(search.toLowerCase()) ||
    c.complaintTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Conversations
        </Typography>
        <Typography color="text.secondary">
          Chat with assigned officers or citizens regarding active complaints.
        </Typography>
      </Box>
      
      <Card sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <TextField 
          label="Search Conversations" 
          variant="outlined" 
          fullWidth 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {filteredConversations.length === 0 ? (
            <Box textAlign="center" mt={4}>
              <Typography color="text.secondary">No conversations found.</Typography>
            </Box>
          ) : (
            filteredConversations.map(conv => (
              <ConversationCard key={conv.complaintId} conversation={conv} />
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default Conversations;
