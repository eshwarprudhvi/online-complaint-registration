import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { Typography, Box, Card, TextField, Chip, Avatar, InputAdornment, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { SnackbarContext } from '../../context/SnackbarContext';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { cleanDataGridSx } from '../../utils/dataGridStyles';

const CustomNoRowsOverlay = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary', p: 4 }}>
    <InboxIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>No assignment records</Typography>
    <Typography variant="body2">No assignments have been made yet.</Typography>
  </Box>
);

const AssignmentHistory = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const showSnackbar = useContext(SnackbarContext);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error('Failed to fetch assignments', err);
      showSnackbar('Failed to load assignment history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    const term = search.toLowerCase();
    return (
      a.complaintId?.title?.toLowerCase().includes(term) ||
      a.agentId?.name?.toLowerCase().includes(term) ||
      a.userId?.name?.toLowerCase().includes(term)
    );
  });

  const columns = [
    { 
      field: 'complaintTitle', 
      headerName: 'Complaint', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params) => {
        const title = params.row.complaintId?.title || 'Unknown';
        const id = params.row.complaintId?._id?.substring(0,6) || '---';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="body2" fontWeight="bold">{title}</Typography>
            <Typography variant="caption" color="text.secondary">ID: #{id}</Typography>
          </Box>
        );
      }
    },
    { 
      field: 'userName', 
      headerName: 'User', 
      width: 180,
      renderCell: (params) => {
        const name = params.row.userId?.name || 'Unknown';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', fontSize: '0.8rem' }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">{name}</Typography>
          </Box>
        );
      }
    },
    { 
      field: 'agentName', 
      headerName: 'Assigned Agent', 
      width: 180,
      renderCell: (params) => {
        const name = params.row.agentId?.name || 'Unknown';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.light', fontSize: '0.8rem' }}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">{name}</Typography>
          </Box>
        );
      }
    },
    { 
      field: 'assignedBy', 
      headerName: 'Assigned By', 
      width: 150,
      valueGetter: (params, row) => row.assignedBy?.name || 'Unknown'
    },
    { 
      field: 'assignedAt', 
      headerName: 'Assignment Date', 
      width: 180,
      valueFormatter: (value) => value ? new Date(value).toLocaleString() : 'N/A'
    },
    { 
      field: 'assignmentStatus', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'Active') color = 'primary';
        if (params.value === 'Completed') color = 'success';
        if (params.value === 'Revoked') color = 'error';
        return <Chip label={params.value} color={color} size="small" />;
      }
    }
  ];

  const stats = [
    { title: 'Total Assignments', value: assignments.length, icon: <AssignmentIcon />, color: '#1976d2' },
    { title: 'Active', value: assignments.filter(a => a.assignmentStatus === 'Active').length, icon: <PlayArrowIcon />, color: '#2196f3' },
    { title: 'Completed', value: assignments.filter(a => a.assignmentStatus === 'Completed').length, icon: <CheckCircleIcon />, color: '#4caf50' },
    { title: 'Revoked', value: assignments.filter(a => a.assignmentStatus === 'Revoked').length, icon: <CancelIcon />, color: '#f44336' },
  ];

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, textAlign: 'left' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>Assignment History</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>View historical records of all complaint assignments.</Typography>
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
            placeholder="Search by complaint, agent, or user..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 300, flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>) } }}
          />
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchAssignments} sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none', px: 3 }}>Refresh</Button>
        </Box>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredAssignments}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'assignedAt', sort: 'desc' }] } }}
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

export default AssignmentHistory;
