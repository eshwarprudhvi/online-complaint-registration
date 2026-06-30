import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { 
  Box, Typography, Grid, Card, CardContent, CardActions, Button, 
  Chip, IconButton, Tooltip, CircularProgress, Skeleton, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useComplaintUpdates from '../hooks/useComplaintUpdates';
import { SnackbarContext } from '../context/SnackbarContext';
import { DialogContext } from '../context/DialogContext';
import { AuthContext } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { motion } from 'framer-motion';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showSnackbar = useContext(SnackbarContext);
  const showDialog = useContext(DialogContext);
  const { user } = useContext(AuthContext);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to fetch complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useComplaintUpdates(() => {
    fetchComplaints();
  });

  const handleCancel = (id) => {
    showDialog({
      title: 'Cancel Complaint',
      message: 'Are you sure you want to cancel this complaint? This action cannot be undone.',
      confirmText: 'Yes, Cancel',
      confirmColor: 'error',
      onConfirm: async () => {
        try {
          await api.delete(`/complaints/${id}`);
          showSnackbar('Complaint cancelled successfully', 'success');
          fetchComplaints();
        } catch (err) {
          showSnackbar(err.response?.data?.message || 'Failed to cancel complaint', 'error');
        }
      }
    });
  };

  const getStatusProps = (status) => {
    switch (status) {
      case 'Pending': return { color: 'warning', icon: <HourglassEmptyIcon fontSize="small" /> };
      case 'Assigned': return { color: 'info', icon: <AssignmentIndIcon fontSize="small" /> };
      case 'In Progress': return { color: 'primary', icon: <HourglassEmptyIcon fontSize="small" /> };
      case 'Resolved': return { color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
      case 'Rejected': return { color: 'error', icon: <DeleteIcon fontSize="small" /> };
      case 'Cancelled': return { color: 'default', icon: <DeleteIcon fontSize="small" /> };
      default: return { color: 'default', icon: null };
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Welcome, {user?.name}</Typography>
          <Typography color="text.secondary">Here is an overview of your complaints.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => navigate('/lodge-complaint')}
          sx={{ borderRadius: 2 }}
        >
          New Complaint
        </Button>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={4} mb={6}>
        {[
          { title: 'Total Complaints', value: stats.total, color: 'primary.main' },
          { title: 'Pending Review', value: stats.pending, color: 'warning.main' },
          { title: 'Successfully Resolved', value: stats.resolved, color: 'success.main' },
        ].map((stat, idx) => (
          <Grid xs={12} md={4} key={idx}>
            <motion.div whileHover={{ y: -5 }}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <Typography color="text.secondary" variant="subtitle2" textTransform="uppercase" sx={{ mb: 1 }}>{stat.title}</Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, mt: 1 }}>
                  {loading ? <Skeleton width={60} sx={{ mx: 'auto' }} /> : stat.value}
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight="bold" mb={4}>Recent Complaints</Typography>

      {loading ? (
        <Grid container spacing={4}>
          {[1, 2, 3].map(i => (
            <Grid xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : complaints.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', backgroundColor: 'transparent', border: '1px dashed grey' }}>
          <Typography color="text.secondary">You haven't submitted any complaints yet.</Typography>
          <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate('/lodge-complaint')}>
            Lodge your first complaint
          </Button>
        </Card>
      ) : (
        <Grid container spacing={4}>
          {complaints.map((c, index) => {
            const statusProps = getStatusProps(c.status);
            return (
              <Grid xs={12} md={6} lg={4} key={c._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip 
                          label={c.status} 
                          color={statusProps.color} 
                          icon={statusProps.icon}
                          size="small" 
                          sx={{ fontWeight: 'bold' }} 
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" noWrap gutterBottom>
                        {c.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {c.category}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/complaints/${c._id}`)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {c.status === 'Pending' && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="info" onClick={() => navigate(`/complaints/edit/${c._id}`)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton size="small" color="error" onClick={() => handleCancel(c._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default MyComplaints;
