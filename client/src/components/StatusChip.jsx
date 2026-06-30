import React from 'react';
import { Chip } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';

export const getStatusConfig = (status) => {
  switch (status) {
    case 'Pending':
      return { bgcolor: '#ffb300', color: '#fff', icon: <HourglassEmptyIcon fontSize="small" /> }; // Amber
    case 'Assigned':
      return { bgcolor: '#2196f3', color: '#fff', icon: <AssignmentIndIcon fontSize="small" /> }; // Blue
    case 'In Progress':
      return { bgcolor: '#9c27b0', color: '#fff', icon: <AutorenewIcon fontSize="small" /> }; // Purple
    case 'Resolved':
      return { bgcolor: '#4caf50', color: '#fff', icon: <CheckCircleIcon fontSize="small" /> }; // Green
    case 'Rejected':
      return { bgcolor: '#f44336', color: '#fff', icon: <CancelIcon fontSize="small" /> }; // Red
    case 'Cancelled':
      return { bgcolor: '#9e9e9e', color: '#fff', icon: <BlockIcon fontSize="small" /> }; // Gray
    default:
      return { bgcolor: '#e0e0e0', color: '#000', icon: null };
  }
};

const StatusChip = ({ status, ...props }) => {
  const config = getStatusConfig(status);

  return (
    <Chip
      label={status}
      icon={config.icon}
      size="small"
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 'bold',
        '& .MuiChip-icon': {
          color: 'inherit'
        },
        ...props.sx
      }}
      {...props}
    />
  );
};

export default StatusChip;
