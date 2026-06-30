import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Typography, Box, Paper, Divider, Button, Chip, 
  Grid, TextField, List, ListItem, ListItemText 
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const OfficerComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [notes, setNotes] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/officer/complaints/${id}`);
      setComplaint(res.data.complaint);
      setAssignment(res.data.assignment);
      setNotes(res.data.notes);
      setAttachments(res.data.attachments);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch details');
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusAction = async (actionUrl) => {
    try {
      await api.put(`/officer/complaints/${id}/${actionUrl}`);
      alert(`Successfully updated status`);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddNote = async () => {
    if (!newNote) return;
    try {
      await api.post(`/officer/complaints/${id}/notes`, { note: newNote });
      setNewNote('');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add note');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post(`/officer/complaints/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSelectedFile(null);
      // Reset file input value
      document.getElementById('evidence-upload').value = '';
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload evidence');
    }
  };

  if (!complaint) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Complaint Details: {complaint.title}</Typography>
        <Button variant="outlined" onClick={() => navigate('/officer/dashboard')}>Back to Dashboard</Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Details & Status */}
        <Grid xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Overview</Typography>
              <Box>
                <Chip label={`Complaint: ${complaint.status}`} sx={{ mr: 1 }} color={complaint.status === 'Resolved' ? 'success' : 'primary'} />
                <Chip label={`Assignment: ${assignment.assignmentStatus}`} variant="outlined" />
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2"><strong>Category:</strong> {complaint.category}</Typography>
            <Typography variant="body2"><strong>Citizen:</strong> {complaint.userId?.name} ({complaint.userId?.email} - {complaint.userId?.phone})</Typography>
            <Typography variant="body2"><strong>Location:</strong> {complaint.address}, {complaint.city}, {complaint.state} - {complaint.pincode}</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}><strong>Description:</strong></Typography>
            <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {complaint.description}
            </Typography>
          </Paper>

          {/* Status Management Panel */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Status Management</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" gap={2}>
              {assignment.assignmentStatus === 'Assigned' && (
                <>
                  <Button variant="contained" color="success" onClick={() => handleStatusAction('accept')}>Accept Complaint</Button>
                  <Button variant="outlined" color="error" onClick={() => handleStatusAction('reject')}>Reject Complaint</Button>
                </>
              )}
              {assignment.assignmentStatus === 'Accepted' && (
                <Button variant="contained" color="primary" onClick={() => handleStatusAction('start')}>Start Work (In Progress)</Button>
              )}
              {assignment.assignmentStatus === 'In Progress' && (
                <Button variant="contained" color="success" onClick={() => handleStatusAction('resolve')}>Resolve Complaint</Button>
              )}
              {assignment.assignmentStatus === 'Completed' && (
                <Typography color="success.main">Complaint is marked as Resolved.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Notes & Evidence */}
        <Grid xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Action Notes</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ maxHeight: '200px', overflowY: 'auto', mb: 2, bgcolor: '#f9f9f9', p: 1, borderRadius: 1 }}>
              {notes.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No notes added yet.</Typography>
              ) : (
                <List dense>
                  {notes.map(note => (
                    <ListItem key={note._id} alignItems="flex-start" sx={{ bgcolor: 'white', mb: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                      <ListItemText 
                        primary={note.note} 
                        secondary={`${note.officerId?.name} - ${new Date(note.createdAt).toLocaleString()}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <TextField 
                label="Add a new note..." 
                multiline 
                rows={2} 
                value={newNote} 
                onChange={(e) => setNewNote(e.target.value)} 
                fullWidth
              />
              <Button variant="contained" onClick={handleAddNote} disabled={!newNote}>Submit Note</Button>
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Resolution Evidence</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box mb={2}>
              {attachments.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No evidence uploaded yet.</Typography>
              ) : (
                <List dense>
                  {attachments.map(att => (
                    <ListItem key={att._id}>
                      <ListItemText 
                        primary={<a href={`http://localhost:5000${att.filePath}`} target="_blank" rel="noreferrer">{att.originalFileName}</a>} 
                        secondary={new Date(att.uploadedAt).toLocaleString()} 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <input 
                type="file" 
                id="evidence-upload"
                accept=".jpg,.jpeg,.png,.pdf" 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
              />
              <Button variant="outlined" onClick={handleFileUpload} disabled={!selectedFile}>
                Upload File
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfficerComplaintDetails;
