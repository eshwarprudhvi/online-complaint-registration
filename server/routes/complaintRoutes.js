const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');

router.route('/')
  .post(auth, createComplaint)
  .get(auth, getMyComplaints);

router.route('/:id')
  .get(auth, getComplaintById)
  .put(auth, updateComplaint)
  .delete(auth, deleteComplaint);

module.exports = router;
