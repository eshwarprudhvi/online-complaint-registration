import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { 
  Typography, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, Box, Card, Chip, TextField, InputAdornment 
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { SnackbarContext } from '../../context/SnackbarContext';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import PendingIcon from '@mui/icons-material/Pending';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useComplaintUpdates from '../../hooks/useComplaintUpdates';
import { cleanDataGridSx } from '../../utils/dataGridStyles';

const CustomNoRowsOverlay = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary', p: 4 }}>
    <InboxIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>No unassigned complaints</Typography>
    <Typography variant="body2">All complaints have been assigned to officers.</Typography>
  </Box>
);

const AssignComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [search, setSearch] = useState('');
  const showSnackbar = useContext(SnackbarContext);

  const fetchUnassignedComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/unassigned-complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch unassigned complaints', err);
      showSnackbar('Failed to load pending complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await api.get('/admin/approved-agents');
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to fetch approved agents', err);
      showSnackbar('Failed to load agents', 'error');
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    fetchUnassignedComplaints();
    fetchApprovedAgents();
  }, []);

  useComplaintUpdates(() => {
    fetchUnassignedComplaints();
  });

  const handleOpenAssignDialog = (complaint) => {
    setSelectedComplaint(complaint);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedComplaint(null);
  };

  const handleAssign = async (agentId) => {
    if (!selectedComplaint) return;
    try {
      await api.post('/admin/assign-complaint', {
        complaintId: selectedComplaint._id,
        agentId
      });
      showSnackbar('Complaint assigned successfully', 'success');
      handleClose();
      fetchUnassignedComplaints();
      fetchApprovedAgents();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to assign complaint', 'error');
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    (c.userId?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const complaintColumns = [
    { field: '_id', headerName: 'ID', width: 90 },
    { 
      field: 'userName', 
      headerName: 'User Name', 
      width: 150,
      valueGetter: (params, row) => row.userId?.name || 'Unknown' 
    },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { 
      field: 'createdAt', 
      headerName: 'Date Created', 
      width: 130,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 120,
      renderCell: (params) => (
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AssignmentIndIcon />}
          onClick={() => handleOpenAssignDialog(params.row)}
          sx={{ textTransform: 'none' }}
        >
          Assign
        </Button>
      )
    }
  ];

  const agentColumns = [
    { field: 'name', headerName: 'Agent Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { 
      field: 'activeAssignments', 
      headerName: 'Active Assignments', 
      width: 160,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value > 5 ? 'warning' : 'primary'} 
          size="small" 
          variant={params.value > 0 ? "filled" : "outlined"} 
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 120,
      renderCell: (params) => (
        <Button 
          variant="outlined" 
          size="small"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => handleAssign(params.row._id)}
          sx={{ textTransform: 'none' }}
        >
          Select
        </Button>
      )
    }
  ];

  const stats = [
    { title: 'Pending Complaints', value: complaints.length, icon: <PendingIcon />, color: '#ff9800' },
    { title: 'Total Officers', value: agents.length, icon: <GroupIcon />, color: '#2196f3' },
    { title: 'Available Officers', value: agents.filter(a => a.activeAssignments < 5).length, icon: <CheckCircleIcon />, color: '#4caf50' },
  ];

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, textAlign: 'left' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>Assign Complaints</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>Review pending complaints and assign them to active officers.</Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
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
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchUnassignedComplaints} sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none', px: 3 }}>Refresh</Button>
        </Box>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredComplaints}
            columns={complaintColumns}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          Assign Complaint to Officer
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedComplaint && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedComplaint.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip label={selectedComplaint.category} size="small" />
                <Chip label={`ID: ${selectedComplaint._id.substring(0, 8)}...`} size="small" variant="outlined" />
              </Box>
            </Box>
          )}
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={agents}
              columns={agentColumns}
              getRowId={(row) => row._id}
              loading={loadingAgents}
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'activeAssignments', sort: 'asc' }] } }}
              disableRowSelectionOnClick
              disableColumnMenu
              sx={{ ...cleanDataGridSx, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleClose} color="inherit" variant="outlined" sx={{ textTransform: 'none' }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignComplaint;
