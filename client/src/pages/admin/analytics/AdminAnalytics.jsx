import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Divider } from '@mui/material';
import api from '../../../services/api';
import { SummaryCards } from '../../../components/analytics/SummaryCards';
import { RecentActivityTable } from '../../../components/analytics/RecentActivityTable';
import { RoleDistributionChart } from '../../../components/analytics/Charts';
import { motion } from 'framer-motion';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, activityRes, userRes] = await Promise.all([
          api.get('/admin/analytics/dashboard'),
          api.get('/admin/analytics/activity'),
          api.get('/admin/analytics/users')
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
        setUserAnalytics(userRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!stats) return <Typography>Error loading analytics.</Typography>;

  const recentComplaintsColumns = [
    { label: 'Title', field: 'title' },
    { label: 'Category', field: 'category' },
    { label: 'Citizen', field: 'citizenName', render: (row) => row.userId?.name || 'N/A' },
    { label: 'Status', field: 'status' },
    { label: 'Date', field: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, textAlign: 'left' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>Platform Overview</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>High-level insights into user activity, complaints, and assignments.</Typography>
      </Box>
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom mt={4}>User Statistics</Typography>
        <SummaryCards stats={stats.users} color="primary.main" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom mt={4}>Complaint Overview</Typography>
        <SummaryCards stats={stats.complaints} color="secondary.main" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom mt={4}>Assignments & Messaging</Typography>
        <SummaryCards stats={{ ...stats.assignments, ...stats.messaging }} color="success.main" />
      </motion.div>

      <Divider sx={{ my: 4 }} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <Grid container spacing={3}>
          <Grid xs={12} md={5}>
            {userAnalytics && <RoleDistributionChart data={userAnalytics.roleDistribution} />}
          </Grid>
          <Grid xs={12} md={7}>
            <RecentActivityTable 
              title="Recent Complaints" 
              data={activity.recentComplaints} 
              columns={recentComplaintsColumns} 
            />
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default AdminAnalytics;
