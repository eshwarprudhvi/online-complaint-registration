import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, TextField, MenuItem, Card } from '@mui/material';
import api from '../../../services/api';
import { OfficerPerformanceTable } from '../../../components/analytics/OfficerPerformanceTable';
import SortIcon from '@mui/icons-material/Sort';

const OfficerPerformance = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('highestCompleted');

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/analytics/officers?sort=${sort}`);
        setOfficers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [sort]);

  if (loading && officers.length === 0) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, textAlign: 'left' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>Officer Performance</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>Monitor and evaluate the efficiency and workload of your agents.</Typography>
      </Box>
      
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundImage: 'none', display: 'flex', gap: 2, alignItems: 'center' }}>
        <SortIcon color="action" />
        <Typography variant="subtitle1" fontWeight="medium">Sort By:</Typography>
        <TextField select value={sort} onChange={(e) => setSort(e.target.value)} size="small" sx={{ minWidth: 250 }}>
          <MenuItem value="highestCompleted">Highest Completed</MenuItem>
          <MenuItem value="lowestPending">Lowest Pending (Active)</MenuItem>
          <MenuItem value="fastestResolution">Fastest Resolution Time</MenuItem>
        </TextField>
      </Card>

      <OfficerPerformanceTable officers={officers} />
    </Box>
  );
};

export default OfficerPerformance;
