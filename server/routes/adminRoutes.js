const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { adminAuth } = require('../middleware/roleMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  getAllOfficers,
  getPendingOfficers,
  approveOfficer,
  rejectOfficer,
  getAllComplaints,
  getComplaintDetails,
} = require('../controllers/adminController');

const {
  getUnassignedComplaints,
  getApprovedAgents,
  assignComplaint,
  getAssignments,
  getAssignmentDetails,
  getAssignmentByComplaintId,
} = require('../controllers/assignmentController');

// Apply both middlewares to all routes in this file
router.use(auth, adminAuth);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/officers', getAllOfficers);
router.get('/officers/pending', getPendingOfficers);
router.put('/officers/:id/approve', approveOfficer);
router.put('/officers/:id/reject', rejectOfficer);
router.get('/complaints', getAllComplaints);
router.get('/complaints/:id', getComplaintDetails);

// Assignment Routes
router.get('/unassigned-complaints', getUnassignedComplaints);
router.get('/approved-agents', getApprovedAgents);
router.post('/assign-complaint', assignComplaint);
router.get('/assignments', getAssignments);
router.get('/assignments/:id', getAssignmentDetails);
router.get('/complaints/:id/assignment', getAssignmentByComplaintId);

module.exports = router;
