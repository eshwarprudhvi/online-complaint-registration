const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const mongoose = require('mongoose');

// @route   GET /api/admin/unassigned-complaints
// @desc    Get all unassigned (Pending) complaints
exports.getUnassignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: 'Pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/admin/approved-agents
// @desc    Get all approved agents with their active assignment count
exports.getApprovedAgents = async (req, res) => {
  try {
    // We want agents that are Approved. We also want to know how many active assignments they have.
    const agents = await User.aggregate([
      { $match: { role: 'Agent', approvalStatus: 'Approved' } },
      {
        $lookup: {
          from: 'assignments', // MongoDB collection name for Assignment
          localField: '_id',
          foreignField: 'agentId',
          as: 'assignments'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          activeAssignments: {
            $size: {
              $filter: {
                input: '$assignments',
                as: 'assignment',
                cond: { $in: ['$$assignment.assignmentStatus', ['Assigned', 'Accepted', 'In Progress']] }
              }
            }
          }
        }
      }
    ]);

    res.json(agents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST /api/admin/assign-complaint
// @desc    Assign a complaint to an agent
exports.assignComplaint = async (req, res) => {
  try {
    const { complaintId, agentId } = req.body;

    if (!complaintId || !agentId) {
      return res.status(400).json({ message: 'Please provide both complaint and agent' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    if (complaint.status !== 'Pending') {
      return res.status(400).json({ message: 'Only Pending complaints can be assigned' });
    }

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'Agent' || agent.approvalStatus !== 'Approved') {
      return res.status(400).json({ message: 'Invalid agent selected. Must be an approved agent.' });
    }

    // Check if there is already an active assignment (belt and suspenders)
    const existingAssignment = await Assignment.findOne({
      complaintId,
      assignmentStatus: { $in: ['Assigned', 'Accepted', 'In Progress'] }
    });
    
    if (existingAssignment) {
      return res.status(400).json({ message: 'This complaint is already assigned' });
    }

    const assignment = new Assignment({
      complaintId,
      userId: complaint.userId,
      agentId,
      assignedBy: req.user.id,
    });

    await assignment.save();

    complaint.status = 'Assigned';
    await complaint.save();

    // Trigger Notifications
    const { createNotification } = require('../services/notificationService');
    
    // Notify Citizen
    createNotification({
      userId: complaint.userId,
      complaintId: complaint._id,
      title: 'Complaint Assigned',
      message: `Your complaint "${complaint.title}" has been assigned to an officer.`,
      type: 'ComplaintAssigned',
    });

    // Notify Officer
    createNotification({
      userId: agentId,
      complaintId: complaint._id,
      title: 'New Complaint Assignment',
      message: `You have been assigned a new complaint: "${complaint.title}".`,
      type: 'ComplaintAssigned',
    });

    const SocketService = require('../socket/SocketService');
    SocketService.emitComplaintAssignment(complaint, assignment);

    res.status(201).json({ message: 'Complaint assigned successfully', assignment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/admin/assignments
// @desc    Get assignment history
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('complaintId', 'title category')
      .populate('agentId', 'name email')
      .populate('assignedBy', 'name')
      .populate('userId', 'name')
      .sort({ assignedAt: -1 });
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/admin/assignments/:id
// @desc    Get assignment details by id
exports.getAssignmentDetails = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('complaintId')
      .populate('agentId', 'name email phone')
      .populate('userId', 'name email phone')
      .populate('assignedBy', 'name');
      
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   GET /api/admin/complaints/:id/assignment
// @desc    Get active assignment by complaint id
exports.getAssignmentByComplaintId = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ 
      complaintId: req.params.id,
      assignmentStatus: { $in: ['Assigned', 'Accepted', 'In Progress'] }
    })
      .populate('agentId', 'name email phone')
      .populate('assignedBy', 'name');
      
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
