import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Box, Typography, Paper, Button, Divider, CircularProgress } from '@mui/material';
import StatusChip from '../../components/StatusChip';
import { useParams, useNavigate } from 'react-router-dom';

const AdminComplaintDetails = () => {
  const [complaint, setComplaint] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const compRes = await api.get(`/admin/complaints/${id}`);
        setComplaint(compRes.data);

        if (compRes.data.status !== 'Pending') {
          const assignRes = await api.get(`/admin/complaints/${id}/assignment`);
          setAssignment(assignRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!complaint) return <Typography>Complaint not found.</Typography>;

  return (
    <Box>
      <Button variant="outlined" onClick={() => navigate('/admin/complaints')} sx={{ mb: 2 }}>
        Back to Complaints
      </Button>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold">{complaint.title}</Typography>
          <StatusChip status={complaint.status} />
        </Box>
        <Typography color="text.secondary" gutterBottom>
          Category: {complaint.category} | Submitted: {new Date(complaint.createdAt).toLocaleString()}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ mt: 2, mb: 4, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
          {complaint.description}
        </Typography>

        <Typography variant="h6" fontWeight="bold" gutterBottom>Location</Typography>
        <Typography mb={3}>{complaint.address}, {complaint.city}, {complaint.state} {complaint.pincode}</Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight="bold" gutterBottom>Citizen Information</Typography>
        <Typography>Name: {complaint.userId?.name}</Typography>
        <Typography>Email: {complaint.userId?.email}</Typography>

        <Divider sx={{ my: 3 }} />

        {assignment ? (
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Assignment Details</Typography>
            <Typography>Officer: {assignment.agentId?.name}</Typography>
            <Typography>Assigned At: {new Date(assignment.assignedAt).toLocaleString()}</Typography>
            <Typography>Status: {assignment.assignmentStatus}</Typography>
          </Box>
        ) : (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography color="error">This complaint has not been assigned to any officer yet.</Typography>
            <Button variant="contained" onClick={() => navigate(`/admin/assign-complaint?complaintId=${complaint._id}`)}>
              Assign Officer Now
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminComplaintDetails;
