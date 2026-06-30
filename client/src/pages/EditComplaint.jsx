import React, { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { SnackbarContext } from '../context/SnackbarContext';
import { 
  Box, TextField, Button, Typography, Paper, 
  MenuItem, CircularProgress 
} from '@mui/material';
import { motion } from 'framer-motion';

const EditComplaint = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const showSnackbar = useContext(SnackbarContext);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        const data = res.data;
        if (data.status !== 'Pending') {
          showSnackbar('You can only edit pending complaints', 'error');
          navigate('/my-complaints');
          return;
        }
        reset({
          title: data.title,
          category: data.category,
          description: data.description,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode
        });
      } catch (err) {
        showSnackbar('Failed to fetch complaint details', 'error');
        navigate('/my-complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id, reset, navigate, showSnackbar]);

  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      await api.put(`/complaints/${id}`, data);
      showSnackbar('Complaint updated successfully', 'success');
      navigate('/my-complaints');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update complaint', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
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
        <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Edit Complaint
          </Typography>
          <Typography color="text.secondary" mb={4}>
            You can modify the details of your complaint before it gets assigned to an officer.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
              {...register('title', { required: 'Title is required' })}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <TextField
              fullWidth
              select
              label="Category"
              margin="normal"
              {...register('category', { required: 'Category is required' })}
              error={!!errors.category}
              helperText={errors.category?.message}
            >
              <MenuItem value="Electricity">Electricity</MenuItem>
              <MenuItem value="Water">Water</MenuItem>
              <MenuItem value="Roads">Roads</MenuItem>
              <MenuItem value="Sanitation">Sanitation</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={4}
              {...register('description', { required: 'Description is required' })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            <Typography variant="h6" fontWeight="bold" mt={3} mb={2}>Location Details</Typography>
            <TextField
              fullWidth
              label="Address"
              margin="normal"
              {...register('address', { required: 'Address is required' })}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="City"
                margin="normal"
                {...register('city', { required: 'City is required' })}
                error={!!errors.city}
                helperText={errors.city?.message}
              />
              <TextField
                fullWidth
                label="State"
                margin="normal"
                {...register('state', { required: 'State is required' })}
                error={!!errors.state}
                helperText={errors.state?.message}
              />
              <TextField
                fullWidth
                label="Pincode"
                margin="normal"
                {...register('pincode', { required: 'Pincode is required' })}
                error={!!errors.pincode}
                helperText={errors.pincode?.message}
              />
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
              <Button variant="outlined" onClick={() => navigate('/my-complaints')} sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
              <Button variant="contained" type="submit" disabled={updating} sx={{ borderRadius: 2, minWidth: 150 }}>
                {updating ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default EditComplaint;
