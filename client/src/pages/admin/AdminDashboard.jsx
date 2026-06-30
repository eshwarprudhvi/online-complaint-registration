import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Box, Typography, Grid, Card, CardContent, Skeleton, useTheme, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import useComplaintUpdates from '../../hooks/useComplaintUpdates';
import { motion } from 'framer-motion';

import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { ComplaintTrendChart, ComplaintStatusChart } from '../../components/analytics/Charts';
import { OfficerPerformanceTable } from '../../components/analytics/OfficerPerformanceTable';
import StatusChip from '../../components/StatusChip';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [analytics, setAnalytics] = useState({ byMonth: [], byStatus: [] });
  const [officers, setOfficers] = useState([]);
  
  const theme = useTheme();

  const fetchData = async () => {
    try {
      const [dashRes, compRes, analyticsRes, officersRes] = await Promise.all([
        api.get('/admin/dashboard').catch(() => ({ data: null })),
        api.get('/admin/complaints').catch(() => ({ data: [] })),
        api.get('/admin/analytics/complaints').catch(() => ({ data: { byMonth: [], byStatus: [] } })),
        api.get('/admin/analytics/officers?sort=highestCompleted').catch(() => ({ data: [] }))
      ]);
      
      setStats(dashRes.data);
      setRecentComplaints(compRes.data.slice(0, 5));
      setAnalytics(analyticsRes.data);
      setOfficers(officersRes.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useComplaintUpdates(() => {
    fetchData();
  });

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers, icon: <PeopleIcon fontSize="medium" />, color: theme.palette.info.main },
    { title: 'Total Officers', value: stats?.totalAgents, icon: <SecurityIcon fontSize="medium" />, color: theme.palette.primary.main },
    { title: 'Pending Approvals', value: stats?.pendingAgentRequests, icon: <HowToRegIcon fontSize="medium" />, color: theme.palette.warning.main },
    { title: 'Total Complaints', value: stats?.totalComplaints, icon: <ReportProblemIcon fontSize="medium" />, color: theme.palette.secondary.main },
    { title: 'Pending Complaints', value: stats?.pendingComplaints, icon: <ReportProblemIcon fontSize="medium" />, color: theme.palette.warning.main },
    { title: 'Assigned', value: stats?.assignedComplaints, icon: <AssignmentIcon fontSize="medium" />, color: theme.palette.info.main },
    { title: 'In Progress', value: stats?.inProgressComplaints, icon: <AutorenewIcon fontSize="medium" />, color: theme.palette.primary.main },
    { title: 'Resolved', value: stats?.resolvedComplaints, icon: <CheckCircleIcon fontSize="medium" />, color: theme.palette.success.main },
  ];

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, px: { xs: 2, md: 0 }, textAlign: 'left' }}>
      
      {/* Header */}
      <Box mb={5}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>Admin Dashboard</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>Platform-wide overview, analytics, and performance monitoring.</Typography>
      </Box>
      
      {/* Section 1: KPI Cards */}
      <Box mb={7}>
        <Grid container spacing={3}>
          {statCards.map((stat, index) => (
            <Grid xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -4 }}
                style={{ height: '100%' }}
              >
                <Card sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography color="text.secondary" sx={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {stat.title}
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: `${stat.color}15`, 
                        color: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '38px', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                    {stats === null ? <Skeleton width={60} height={40} /> : stat.value}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Section 2: Recent Activity (7:5 Layout) */}
      <Box mb={7}>
        <Typography sx={{ fontSize: '28px', fontWeight: 'bold', mb: 3 }}>Recent Activity</Typography>
        <Grid container spacing={3} alignItems="stretch">
          
          {/* 7 Columns: Recent Complaints */}
          <Grid xs={12} md={7} sx={{ display: 'flex' }}>
            <Card sx={{ p: 3, width: '100%', borderRadius: 3, boxShadow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, mb: 2 }}>Recent Complaints</Typography>
              <List disablePadding sx={{ flexGrow: 1 }}>
                {recentComplaints.length === 0 ? <Typography variant="body2" color="text.secondary">No recent complaints.</Typography> : recentComplaints.map((c, i) => (
                  <React.Fragment key={c._id}>
                    <ListItem alignItems="center" disablePadding sx={{ py: 2 }}>
                      <ListItemText 
                        primary={<Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{c.title}</Typography>}
                        secondary={<Typography color="text.secondary" sx={{ fontSize: '13px', mt: 0.5 }}>{c.category} - {new Date(c.createdAt).toLocaleDateString()}</Typography>}
                      />
                      <StatusChip status={c.status} size="small" />
                    </ListItem>
                    {i < recentComplaints.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>

          {/* 5 Columns: Activity Timeline */}
          <Grid xs={12} md={5} sx={{ display: 'flex' }}>
            <Card sx={{ p: 3, width: '100%', borderRadius: 3, boxShadow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontSize: '18px', fontWeight: 700, mb: 2 }}>System Timeline</Typography>
              <List disablePadding sx={{ flexGrow: 1 }}>
                {[
                  { text: 'System backup completed', time: '10 mins ago', color: 'success' },
                  { text: 'New officer registered', time: '1 hour ago', color: 'info' },
                  { text: 'High severity complaint logged', time: '2 hours ago', color: 'error' },
                  { text: 'Server health check passed', time: '5 hours ago', color: 'success' },
                  { text: 'Database index optimized', time: '12 hours ago', color: 'primary' }
                ].map((item, i) => (
                  <React.Fragment key={i}>
                    <ListItem alignItems="flex-start" disablePadding sx={{ py: 2 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${item.color}.main`, mr: 2, mt: 0.5 }} />
                      <ListItemText 
                        primary={<Typography sx={{ fontSize: '15px', fontWeight: 500 }}>{item.text}</Typography>}
                        secondary={<Typography color="text.secondary" sx={{ fontSize: '13px', mt: 0.5 }}>{item.time}</Typography>}
                      />
                    </ListItem>
                    {i < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>
          
        </Grid>
      </Box>

      {/* Section 3: Analytics (6:6 Layout) */}
      <Box mb={7}>
        <Typography sx={{ fontSize: '28px', fontWeight: 'bold', mb: 3 }}>Analytics Overview</Typography>
        <Grid container spacing={3} alignItems="stretch">
          <Grid xs={12} md={6} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%' }}>
              <ComplaintTrendChart data={analytics.byMonth} />
            </Box>
          </Grid>
          <Grid xs={12} md={6} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%' }}>
              <ComplaintStatusChart data={analytics.byStatus} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Section 4: Officer Performance */}
      <Box mb={4}>
        <Typography sx={{ fontSize: '28px', fontWeight: 'bold', mb: 3 }}>Officer Performance</Typography>
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
          <Box sx={{ height: 450, width: '100%' }}>
            <OfficerPerformanceTable officers={officers} />
          </Box>
        </Card>
      </Box>
      
    </Box>
  );
};

export default AdminDashboard;
