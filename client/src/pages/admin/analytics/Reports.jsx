import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, CircularProgress, Card } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../../services/api';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { cleanDataGridSx } from '../../../utils/dataGridStyles';

const Reports = () => {
  const [type, setType] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/analytics/report?type=${type}`);
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.data.length) return;
    
    const headers = ['Title', 'Category', 'Status', 'Created At', 'Resolved At'];
    const rows = reportData.data.map(row => [
      `"${(row.title || '').replace(/"/g, '""')}"`,
      `"${(row.category || '').replace(/"/g, '""')}"`,
      `"${(row.status || '').replace(/"/g, '""')}"`,
      row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
      row.resolvedAt ? new Date(row.resolvedAt).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system_report_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!reportData || !reportData.data.length) return;
    
    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>System Report - ${type.toUpperCase()}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #333; }
            h1 { margin-bottom: 5px; font-weight: bold; }
            .meta { color: #666; margin-bottom: 25px; font-size: 14px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 14px; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
          </style>
        </head>
        <body>
          <h1>System Report Summary</h1>
          <div class="meta">
            Generated At: ${new Date(reportData.generatedAt).toLocaleString()} | Report Type: ${type.toUpperCase()}
          </div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Resolved At</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.data.map(row => `
                <tr>
                  <td>${row.title || 'N/A'}</td>
                  <td>${row.category || 'N/A'}</td>
                  <td>${row.status || 'N/A'}</td>
                  <td>${row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>${row.resolvedAt ? new Date(row.resolvedAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'status', headerName: 'Status', width: 130 },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      width: 150,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      field: 'resolvedAt', 
      headerName: 'Resolved At', 
      width: 150,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  const CustomNoRowsOverlay = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary', p: 4 }}>
      <img src="https://illustrations.popsy.co/amber/freelancer.svg" alt="No Data" style={{ width: 200, opacity: 0.8 }} />
      <Typography variant="h6" color="text.secondary" mt={2}>No report data available.</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>Select a timeframe and generate a report.</Typography>
    </Box>
  );

  return (
    <Box sx={{ width: '92%', mx: 'auto', py: 4, textAlign: 'left' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '42px' }, fontWeight: 'bold', mb: 1 }}>System Reports</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '16px' }}>Generate and export comprehensive reports for audits and reviews.</Typography>
      </Box>
      
      <Card sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3, 
        border: '1px solid', 
        borderColor: 'divider', 
        backgroundImage: 'none', 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        flexWrap: 'wrap',
        '& .MuiTextField-root': { mb: 0 } // Reset global TextField margin in toolbar
      }}>
        <AssessmentIcon color="action" />
        <Typography variant="subtitle1" fontWeight="medium">Configuration:</Typography>
        
        <TextField select label="Report Timeframe" value={type} onChange={(e) => setType(e.target.value)} size="small" sx={{ minWidth: 200 }}>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
        </TextField>
        
        <Button 
          variant="contained" 
          onClick={fetchReport} 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          sx={{ borderRadius: 2, boxShadow: 'none', textTransform: 'none' }}
        >
          Generate Report
        </Button>
      </Card>

      {reportData && (
        <Box>
          <Card sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'primary.main', bgcolor: 'primary.light', color: 'primary.contrastText', boxShadow: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">Report Summary</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Generated At: {new Date(reportData.generatedAt).toLocaleString()} | Type: {reportData.reportType.toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" color="inherit" startIcon={<DownloadIcon />} onClick={exportToCSV} sx={{ textTransform: 'none' }}>
                  Export CSV
                </Button>
                <Button variant="outlined" color="inherit" startIcon={<PictureAsPdfIcon />} onClick={exportToPDF} sx={{ textTransform: 'none' }}>
                  Export PDF
                </Button>
              </Box>
            </Box>
          </Card>

          <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <DataGrid
              rows={reportData.data || []}
              columns={columns}
              getRowId={(row) => row.id}
              slots={{ 
                noRowsOverlay: CustomNoRowsOverlay,
                noResultsOverlay: CustomNoRowsOverlay,
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              disableColumnMenu
              sx={cleanDataGridSx}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Reports;
