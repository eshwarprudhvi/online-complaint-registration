import React from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export const OfficerPerformanceTable = ({ officers }) => {
  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'totalAssigned', headerName: 'Assigned', width: 100, type: 'number' },
    { field: 'accepted', headerName: 'Accepted', width: 100, type: 'number' },
    { field: 'completed', headerName: 'Completed', width: 100, type: 'number' },
    { field: 'activeWorkload', headerName: 'Active Workload', width: 130, type: 'number' },
    { 
      field: 'averageResolutionTime', 
      headerName: 'Avg Resolution (hrs)', 
      width: 160,
      type: 'number',
      valueGetter: (params, row) => row.averageResolutionTime ? (row.averageResolutionTime / (1000 * 60 * 60)).toFixed(2) : null,
      valueFormatter: (value) => value ? value : 'N/A'
    }
  ];

  return (
    <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <DataGrid
        rows={officers || []}
        columns={columns}
        getRowId={(row) => row._id}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: { sortModel: [{ field: 'completed', sort: 'desc' }] },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        sx={{ border: 'none' }}
      />
    </Box>
  );
};
