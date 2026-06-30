import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { Typography, Card, CardContent, Button, Box, Skeleton, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import useComplaintUpdates from '../../hooks/useComplaintUpdates';
import { SnackbarContext } from '../../context/SnackbarContext';
import { motion } from 'framer-motion';
import StatusChip from '../../components/StatusChip';
import InboxIcon from '@mui/icons-material/Inbox';

import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { cleanDataGridSx } from '../../utils/dataGridStyles';

const CustomNoRowsOverlay = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary', p: 4 }}>
    <InboxIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>No assigned complaints</Typography>
    <Typography variant="body2">You don't have any complaints assigned yet.</Typography>
  </Box>
);

const OfficerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showSnackbar = useContext(SnackbarContext);
  const theme = useTheme();

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/officer/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch assigned complaints', err);
      showSnackbar('Failed to fetch assigned complaints', 'error');
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

  const handleAccept = async (id) => {
    try {
      await api.put(`/officer/complaints/${id}/accept`);
      showSnackbar('Complaint accepted successfully!', 'success');
      fetchComplaints();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to accept complaint', 'error');
    }
  };

  const assignedCount = complaints.filter(c => c.assignmentStatus === 'Assigned').length;
  const acceptedCount = complaints.filter(c => c.assignmentStatus === 'Accepted').length;
  const inProgressCount = complaints.filter(c => c.assignmentStatus === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.assignmentStatus === 'Completed').length;

  const statCards = [
    { title: 'New Assignments', value: assignedCount, icon: <AssignmentLateIcon />, color: theme.palette.warning.main },
    { title: 'Accepted', value: acceptedCount, icon: <AssignmentTurnedInIcon />, color: theme.palette.info.main },
    { title: 'In Progress', value: inProgressCount, icon: <AutorenewIcon />, color: theme.palette.primary.main },
    { title: 'Resolved', value: resolvedCount, icon: <CheckCircleIcon />, color: theme.palette.success.main },
  ];

  const columns = [
    { field: '_id', headerName: 'ID', width: 100 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { field: 'category', headerName: 'Category', width: 150 },
    { 
      field: 'complaintStatus', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => <StatusChip status={params.value} />
    },
    { 
      field: 'assignedAt', 
      headerName: 'Assigned Date', 
      width: 150,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/officer/complaints/${params.row._id}`)}
            sx={{ textTransform: 'none' }}
          >
            View
          </Button>
          {params.row.assignmentStatus === 'Assigned' && (
            <Button 
              variant="contained" 
              color="success" 
              size="small" 
              startIcon={<PlayArrowIcon />}
              onClick={() => handleAccept(params.row._id)}
              sx={{ textTransform: 'none' }}
            >
              Accept
            </Button>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, textAlign: 'left' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>Officer Dashboard</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>Manage your assigned complaints and track progress.</Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ y: -3 }}
          >
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundImage: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary" sx={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {stat.title}
                </Typography>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stat.icon}
                </Box>
              </Box>
              <Typography sx={{ fontSize: '38px', fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                {loading ? <Skeleton width={50} height={40} /> : stat.value}
              </Typography>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* DataGrid */}
      <Typography sx={{ fontSize: '28px', fontWeight: 'bold', mb: 3 }}>Assigned Complaints</Typography>
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', backgroundImage: 'none' }}>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={complaints}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            slots={{ noRowsOverlay: CustomNoRowsOverlay, noResultsOverlay: CustomNoRowsOverlay }}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={cleanDataGridSx}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default OfficerDashboard;
