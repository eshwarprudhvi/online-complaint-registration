import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { 
  Container, Typography, Box, Paper, Divider, Button, Chip, 
  Grid, Card, CardContent, Skeleton 
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { SnackbarContext } from '../context/SnackbarContext';
import { motion } from 'framer-motion';
import useComplaintUpdates from '../hooks/useComplaintUpdates';

import EventNoteIcon from '@mui/icons-material/EventNote';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StatusChip from '../components/StatusChip';

const ComplaintDetails = () => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const showSnackbar = useContext(SnackbarContext);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data);
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to fetch complaint details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  useComplaintUpdates(() => {
    fetchComplaint(); // refetch on any socket updates
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'In Progress': return 'primary';
      case 'Assigned': return 'info';
      case 'Rejected': return 'error';
      default: return 'warning';
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3, mb: 4 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (!complaint) return null;

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mt: 4, mb: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/my-complaints')}
            sx={{ mb: 2 }}
            color="inherit"
          >
            Back to Complaints
          </Button>

          <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'visible' }}>
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText', 
                p: 4, 
                borderTopLeftRadius: 12, 
                borderTopRightRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {complaint.title}
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                  <Chip 
                    icon={<CategoryIcon fontSize="small" />} 
                    label={complaint.category} 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }} 
                  />
                  <Chip 
                    icon={<EventNoteIcon fontSize="small" />} 
                    label={new Date(complaint.createdAt).toLocaleDateString()} 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }} 
                  />
                </Box>
              </Box>
              <StatusChip 
                status={complaint.status} 
                sx={{ px: 1, height: 32 }}
              />
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                Description
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, mb: 4 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {complaint.description}
                </Typography>
              </Paper>

              <Divider sx={{ mb: 4 }} />

              <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon /> Location Details
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                  <Typography variant="body1" fontWeight="medium">{complaint.address}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">City</Typography>
                  <Typography variant="body1" fontWeight="medium">{complaint.city}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">State</Typography>
                  <Typography variant="body1" fontWeight="medium">{complaint.state}</Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Pincode</Typography>
                  <Typography variant="body1" fontWeight="medium">{complaint.pincode}</Typography>
                </Grid>
              </Grid>

              <Box mt={5} display="flex" justifyContent="flex-end" gap={2}>
                {complaint.status === 'Pending' && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/complaints/edit/${complaint._id}`)}
                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                  >
                    Edit Complaint
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ComplaintDetails;
