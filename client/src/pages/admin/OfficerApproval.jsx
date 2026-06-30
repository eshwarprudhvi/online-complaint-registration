import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { Typography, Box, Card, Button, Chip, TextField, MenuItem, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { SnackbarContext } from '../../context/SnackbarContext';

import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';

const CustomNoRowsOverlay = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary', p: 4 }}>
    <InboxIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>No pending approvals</Typography>
    <Typography variant="body2">There are no officer registration requests to review.</Typography>
  </Box>
);

const OfficerApproval = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const showSnackbar = useContext(SnackbarContext);

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/officers/pending');
      setOfficers(res.data);
    } catch (err) {
      console.error('Failed to fetch pending officers', err);
      showSnackbar('Failed to fetch pending officers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/officers/${id}/approve`);
      showSnackbar('Officer approved successfully', 'success');
      fetchOfficers();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to approve officer', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/officers/${id}/reject`);
      showSnackbar('Officer rejected successfully', 'success');
      fetchOfficers();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to reject officer', 'error');
    }
  };

  const filteredOfficers = officers.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.email.toLowerCase().includes(search.toLowerCase()) || 
    o.phone.includes(search)
  );

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Phone Number', width: 150 },
    { 
      field: 'createdAt', 
      headerName: 'Registration Date', 
      width: 150,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      field: 'approvalStatus', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => <Chip label={params.value} color="warning" size="small" />
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
          <Button variant="contained" color="success" size="small" onClick={() => handleApprove(params.row._id)} sx={{ textTransform: 'none' }}>
            Approve
          </Button>
          <Button variant="contained" color="error" size="small" onClick={() => handleReject(params.row._id)} sx={{ textTransform: 'none' }}>
            Reject
          </Button>
        </Box>
      )
    }
  ];

  const stats = [
    { title: 'Pending Approval', value: officers.length, icon: <PersonIcon />, color: '#ff9800' },
    { title: 'Approved Today', value: '0', icon: <CheckCircleIcon />, color: '#4caf50' },
    { title: 'Rejected Today', value: '0', icon: <CancelIcon />, color: '#f44336' },
    { title: 'Total Officers', value: '1', icon: <GroupIcon />, color: '#2196f3' },
    { title: 'Registered Today', value: '0', icon: <CalendarMonthIcon />, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, px: { xs: 2, md: 0 }, textAlign: 'left' }}>
      
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>Officer Approval</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>Review and approve pending officer registrations.</Typography>
      </Box>

      {/* KPI Cards (5 per row) */}
      <Box 
        sx={{ 
          mb: 4,
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, 
          gap: 3 
        }}
      >
        {stats.map((stat, idx) => (
          <Card key={idx} sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, backgroundImage: 'none' }}>
            <Box 
              sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: `${stat.color}15`,
                color: stat.color
              }}
            >
              {stat.icon}
            </Box>
            <Box>
              <Typography color="text.secondary" sx={{ fontSize: '13px', fontWeight: 600, mb: 0.5 }}>
                {stat.title}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* DataGrid Container */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider', overflow: 'hidden', backgroundImage: 'none' }}>
        
        {/* Custom Toolbar */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <TextField
            placeholder="Search by name, email or phone..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ 
              minWidth: 300, 
              flexGrow: 1,
              '& .MuiOutlinedInput-root': { borderRadius: 2 }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                )
              }
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField select size="small" value="All Status" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <MenuItem value="All Status">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </TextField>
            
            <TextField select size="small" value="Select Date Range" sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <MenuItem value="Select Date Range">Select Date Range</MenuItem>
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="This Week">This Week</MenuItem>
            </TextField>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<RefreshIcon />}
              onClick={fetchOfficers}
              sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none', px: 3 }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredOfficers}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            slots={{ 
              noRowsOverlay: CustomNoRowsOverlay,
              noResultsOverlay: CustomNoRowsOverlay,
            }}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={{ 
              border: 'none',
              '& .MuiDataGrid-columnSeparator': { display: 'none !important' },
              '& [class*="columnSeparator"]': { display: 'none !important' },
              '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none !important' },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none !important' },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid', borderColor: 'divider' },
              '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid', borderColor: 'divider' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid', borderColor: 'divider' },
            }}
          />
        </Box>
      </Card>
      
    </Box>
  );
};

export default OfficerApproval;
