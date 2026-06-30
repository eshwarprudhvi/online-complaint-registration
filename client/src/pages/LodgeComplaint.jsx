import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SnackbarContext } from '../context/SnackbarContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, TextField, Button, Typography, MenuItem, 
  Grid, Card, CardContent, CircularProgress, Divider 
} from '@mui/material';
import { motion } from 'framer-motion';

import CategoryIcon from '@mui/icons-material/Category';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';

const categories = [
  'Infrastructure',
  'Sanitation',
  'Water Supply',
  'Electricity',
  'Public Transport',
  'Other'
];

const LodgeComplaint = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user } = useContext(AuthContext);
  const showSnackbar = useContext(SnackbarContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/complaints', data);
      showSnackbar('Complaint registered successfully!', 'success');
      navigate('/my-complaints');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to register complaint', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'Ordinary') {
    return (
      <Box sx={{ mt: 8 }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">Access Denied</Typography>
          <Typography color="text.secondary">Only citizens can lodge complaints.</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card sx={{ mt: 4, mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 3, px: 4 }}>
            <Typography component="h1" variant="h4" fontWeight="bold">
              Lodge a Complaint
            </Typography>
            <Typography variant="subtitle1">
              Please provide detailed information to help us resolve the issue quickly.
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
              
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" /> Basic Details
              </Typography>
              <Grid container spacing={3} mb={4}>
                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    defaultValue=""
                    {...register('category', { required: 'Category is required' })}
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    {categories.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Complaint Title"
                    {...register('title', { required: 'Title is required' })}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Detailed Description"
                    multiline
                    rows={5}
                    placeholder="Describe the issue, location details, and any other relevant information..."
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: { value: 20, message: 'Description must be at least 20 characters long' }
                    })}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 4 }} />

              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="primary" /> Location Details
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address / Landmark"
                    {...register('address', { required: 'Address is required' })}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="City"
                    {...register('city', { required: 'City is required' })}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="State"
                    {...register('state', { required: 'State is required' })}
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    {...register('pincode', { 
                      required: 'Pincode is required',
                      pattern: { value: /^\d+$/, message: 'Pincode must be numeric' }
                    })}
                    error={!!errors.pincode}
                    helperText={errors.pincode?.message}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={() => navigate('/my-complaints')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{ px: 4 }}
                >
                  Submit Complaint
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default LodgeComplaint;
