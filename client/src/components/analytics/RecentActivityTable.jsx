import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';

export const RecentActivityTable = ({ title, data, columns }) => {
  return (
    <Box mt={3} height="100%">
      <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: 'calc(100% - 40px)' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              {columns.map((col, i) => (
                <TableCell key={i} sx={{ fontWeight: 'bold', py: 1.5 }}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((row, i) => (
                <TableRow key={i} hover>
                  {columns.map((col, j) => (
                    <TableCell key={j} sx={{ py: 1.5 }}>
                      {col.render ? col.render(row) : row[col.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3, color: 'text.secondary' }}>No recent activity</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
