import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, TextField, MenuItem, Button, Card, Divider } from '@mui/material';
import api from '../../../services/api';
import { ComplaintStatusChart, ComplaintCategoryChart, ComplaintTrendChart, ResolutionChart } from '../../../components/analytics/Charts';
import { motion } from 'framer-motion';
import FilterListIcon from '@mui/icons-material/FilterList';

const ComplaintAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [resolutionData, setResolutionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    department: '',
    status: ''
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);

      const [complaintsRes, resolutionRes] = await Promise.all([
        api.get(`/admin/analytics/complaints?${params.toString()}`),
        api.get(`/admin/analytics/resolution`)
      ]);
      setAnalytics(complaintsRes.data);
      setResolutionData(resolutionRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading && !analytics) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!analytics) return <Typography>Error loading analytics.</Typography>;

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, textAlign: 'left' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>Complaint Analytics</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>Deep dive into complaint volumes, categories, and resolution times.</Typography>
      </Box>
      
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundImage: 'none' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FilterListIcon color="action" />
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mr: 2 }}>Filters:</Typography>
          
          <TextField select label="Category" name="category" value={filters.category} onChange={handleFilterChange} size="small" sx={{ minWidth: 150 }}>
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="Electricity">Electricity</MenuItem>
            <MenuItem value="Water">Water</MenuItem>
            <MenuItem value="Roads">Roads</MenuItem>
            <MenuItem value="Sanitation">Sanitation</MenuItem>
          </TextField>
          
          <TextField select label="Status" name="status" value={filters.status} onChange={handleFilterChange} size="small" sx={{ minWidth: 150 }}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Assigned">Assigned</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
          
          <Button variant="contained" onClick={fetchAnalytics} sx={{ borderRadius: 2 }}>
            Apply Filters
          </Button>
        </Box>
      </Card>

      <Divider sx={{ my: 4 }} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <ComplaintTrendChart data={analytics.byMonth} />
          </Grid>
          <Grid xs={12} md={6}>
            <ResolutionChart data={resolutionData?.monthlyTrends} />
          </Grid>
          <Grid xs={12} md={6}>
            <ComplaintStatusChart data={analytics.byStatus} />
          </Grid>
          <Grid xs={12} md={6}>
            <ComplaintCategoryChart data={analytics.byCategory} />
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default ComplaintAnalytics;
