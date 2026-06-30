import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import { SnackbarContext } from '../context/SnackbarContext';
import api from '../services/api';
import { 
  Container, TextField, Button, Typography, Box, 
  Card, CardContent, Avatar, Grid, CircularProgress, Chip,
  Divider, List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';
import { motion } from 'framer-motion';

import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const showSnackbar = useContext(SnackbarContext);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
      // Fetch mock or actual stats for activity summary
      const fetchStats = async () => {
        try {
          // If we had a specific profile stats endpoint, we'd call it.
          // For now, we simulate a fast response to fill out the UI
          setStats({
            complaints: user.role === 'Admin' ? 120 : (user.role === 'Agent' ? 45 : 12),
            messages: 34,
            resolved: user.role === 'Agent' ? 28 : (user.role === 'Admin' ? 95 : 8)
          });
        } catch (e) {
          console.error(e);
        }
      };
      fetchStats();
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      const res = await api.put('/auth/profile', {
        name: data.name,
        phone: data.phone,
      });
      setUser(res.data);
      showSnackbar('Profile updated successfully', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">My Profile</Typography>
        <Typography color="text.secondary">Manage your personal information and security settings.</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Avatar & Quick Stats */}
        <Grid xs={12} md={4}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3, mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 120, height: 120, mx: 'auto', mb: 2, 
                  bgcolor: 'primary.main', fontSize: '3.5rem', boxShadow: 3 
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight="bold">{user.name}</Typography>
              <Typography color="text.secondary" gutterBottom>{user.email}</Typography>
              
              <Box mt={2}>
                <Chip 
                  label={`Role: ${user.role === 'Ordinary' ? 'Citizen' : user.role}`} 
                  color="primary" 
                  sx={{ fontWeight: 'bold', mr: 1 }} 
                />
                {user.role === 'Agent' && (
                  <Chip 
                    label={user.approvalStatus} 
                    color={user.approvalStatus === 'Approved' ? 'success' : 'warning'} 
                  />
                )}
              </Box>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                  <AssessmentIcon color="action" /> Profile Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText primary="Total Complaints" secondary={user.role === 'Admin' ? "Managed" : "Filed / Assigned"} />
                    <Typography variant="h6" fontWeight="bold">{stats?.complaints || 0}</Typography>
                  </ListItem>
                  <Divider component="li" />
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText primary="Successfully Resolved" />
                    <Typography variant="h6" fontWeight="bold" color="success.main">{stats?.resolved || 0}</Typography>
                  </ListItem>
                  <Divider component="li" />
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText primary="Messages Sent" />
                    <Typography variant="h6" fontWeight="bold">{stats?.messages || 0}</Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Right Column: Edit Forms & Security */}
        <Grid xs={12} md={8}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                  <PersonIcon color="action" /> Personal Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    <Grid xs={12} sm={6}>
                      <TextField
                        fullWidth label="Full Name" variant="outlined"
                        {...register('name', { required: 'Name is required' })}
                        error={!!errors.name} helperText={errors.name?.message}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TextField
                        fullWidth label="Phone Number" variant="outlined"
                        {...register('phone', { required: 'Phone Number is required' })}
                        error={!!errors.phone} helperText={errors.phone?.message}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <TextField
                        fullWidth label="Email Address" variant="outlined"
                        InputProps={{ readOnly: true }} {...register('email')}
                        helperText="Email cannot be changed for security reasons." disabled
                      />
                    </Grid>
                  </Grid>

                  <Box display="flex" justifyContent="flex-end" mt={3}>
                    <Button
                      type="submit" variant="contained" disabled={updating}
                      startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                  <SecurityIcon color="action" /> Security Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body2" color="text.secondary" mb={2}>
                  To update your password or configure two-factor authentication, please contact your system administrator or use the dedicated security portal.
                </Typography>
                <Button variant="outlined" color="primary" sx={{ borderRadius: 2 }}>
                  Request Password Reset
                </Button>
              </CardContent>
            </Card>

          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
