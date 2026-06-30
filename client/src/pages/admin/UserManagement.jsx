import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { Typography, TextField, MenuItem, Box, Card, Chip, Button, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { SnackbarContext } from '../../context/SnackbarContext';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { cleanDataGridSx } from '../../utils/dataGridStyles';

const CustomNoRowsOverlay = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary', p: 4 }}>
    <InboxIcon sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
    <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>No users found</Typography>
    <Typography variant="body2">No users match the current filters.</Typography>
  </Box>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const showSnackbar = useContext(SnackbarContext);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      showSnackbar('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.email.toLowerCase().includes(search.toLowerCase()) ||
                          user.phone.includes(search);
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Phone Number', width: 150 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 130,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'Admin') color = 'error';
        if (params.value === 'Agent') color = 'primary';
        if (params.value === 'Ordinary') color = 'success';
        return <Chip label={params.value === 'Ordinary' ? 'Citizen' : params.value} color={color} size="small" />;
      }
    },
    { 
      field: 'approvalStatus', 
      headerName: 'Approval Status', 
      width: 150,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'Approved') color = 'success';
        if (params.value === 'Pending') color = 'warning';
        if (params.value === 'Rejected') color = 'error';
        return <Chip label={params.value} color={color} size="small" variant="outlined" />;
      }
    }
  ];

  const stats = [
    { title: 'Total Users', value: users.length, icon: <PeopleIcon />, color: '#1976d2' },
    { title: 'Citizens', value: users.filter(u => u.role === 'Ordinary').length, icon: <PersonIcon />, color: '#4caf50' },
    { title: 'Officers', value: users.filter(u => u.role === 'Agent').length, icon: <SecurityIcon />, color: '#2196f3' },
    { title: 'Admins', value: users.filter(u => u.role === 'Admin').length, icon: <AdminPanelSettingsIcon />, color: '#f44336' },
  ];

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, textAlign: 'left' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>User Management</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>View and filter all registered users across the platform.</Typography>
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
            placeholder="Search users..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 300, flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>) } }}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField select size="small" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="Ordinary">Citizen</MenuItem>
              <MenuItem value="Agent">Officer</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchUsers} sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none', px: 3 }}>Refresh</Button>
          </Box>
        </Box>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
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

export default UserManagement;
