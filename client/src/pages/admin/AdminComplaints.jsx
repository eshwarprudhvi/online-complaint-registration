import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { Typography, Box, Card, Button, TextField, MenuItem, InputAdornment } from '@mui/material';
import StatusChip from '../../components/StatusChip';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { SnackbarContext } from '../../context/SnackbarContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import useComplaintUpdates from '../../hooks/useComplaintUpdates';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PendingIcon from '@mui/icons-material/Pending';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { cleanDataGridSx } from '../../utils/dataGridStyles';

const CustomNoRowsOverlay = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary', p: 4 }}>
    <InboxIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>No complaints found</Typography>
    <Typography variant="body2">It looks like the platform is currently empty.</Typography>
  </Box>
);

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();
  const showSnackbar = useContext(SnackbarContext);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/admin/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints', err);
      showSnackbar('Failed to load complaints', 'error');
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

  const filteredComplaints = complaints.filter(c => {
    const term = search.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(term) ||
                          c.category.toLowerCase().includes(term) ||
                          (c.userId?.name || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { field: '_id', headerName: 'ID', width: 100 },
    { 
      field: 'userName', 
      headerName: 'User Name', 
      width: 150,
      valueGetter: (params, row) => row.userId?.name || 'Unknown' 
    },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => <StatusChip status={params.value} />
    },
    { 
      field: 'createdAt', 
      headerName: 'Date Created', 
      width: 150,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/admin/complaints/${params.row._id}`)}
          sx={{ textTransform: 'none' }}
        >
          View
        </Button>
      )
    }
  ];

  const stats = [
    { title: 'Total Complaints', value: complaints.length, icon: <ReportProblemIcon />, color: '#1976d2' },
    { title: 'Pending Review', value: complaints.filter(c => c.status === 'Pending').length, icon: <PendingIcon />, color: '#ff9800' },
    { title: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length, icon: <AutorenewIcon />, color: '#2196f3' },
    { title: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length, icon: <CheckCircleIcon />, color: '#4caf50' },
  ];

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, textAlign: 'left' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>Complaint Monitoring</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>View all complaints submitted across the platform.</Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {stats.map((stat, idx) => (
          <Card key={idx} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, backgroundImage: 'none' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </Box>
            <Box>
              <Typography color="text.secondary" sx={{ fontSize: '13px', fontWeight: 600, mb: 0.5 }}>{stat.title}</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color, lineHeight: 1 }}>{stat.value}</Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* DataGrid */}
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', backgroundImage: 'none' }}>
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            placeholder="Search complaints..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 300, flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>) } }}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Assigned">Assigned</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchComplaints} sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none', px: 3 }}>Refresh</Button>
          </Box>
        </Box>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredComplaints}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] } }}
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

export default AdminComplaints;
