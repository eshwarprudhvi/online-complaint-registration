const Complaint = require('../models/Complaint');
const Assignment = require('../models/Assignment');
const ActionNote = require('../models/ActionNote');
const ComplaintAttachment = require('../models/ComplaintAttachment');

// @route   GET /api/officer/complaints
// @desc    Get assigned complaints for officer
exports.getAssignedComplaints = async (req, res) => {
  try {
    const assignments = await Assignment.find({ agentId: req.user.id })
      .populate({
        path: 'complaintId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ assignedAt: -1 });
    
    // Map the response to flatten it a bit for the frontend
    const mapped = assignments.map(a => ({
      _id: a.complaintId._id, // returning complaint ID as primary
      assignmentId: a._id,
      title: a.complaintId.title,
      category: a.complaintId.category,
      address: a.complaintId.address,
      citizenName: a.complaintId.userId?.name,
      complaintStatus: a.complaintId.status,
      assignmentStatus: a.assignmentStatus,
      assignedAt: a.assignedAt
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/officer/complaints/:id
// @desc    Get complaint details including notes and attachments
exports.getComplaintDetails = async (req, res) => {
  try {
    const complaintId = req.params.id;
    
    // Validate assignment
    const assignment = await Assignment.findOne({ complaintId, agentId: req.user.id });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this complaint' });
    }

    const complaint = await Complaint.findById(complaintId).populate('userId', 'name email phone');
    const notes = await ActionNote.find({ complaintId }).sort({ createdAt: 1 }).populate('officerId', 'name');
    const attachments = await ComplaintAttachment.find({ complaintId }).sort({ uploadedAt: 1 }).populate('uploadedBy', 'name');

    res.json({
      complaint,
      assignment,
      notes,
      attachments
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Complaint not found' });
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/officer/complaints/:id/accept
// @desc    Accept an assigned complaint
exports.acceptComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    
    const assignment = await Assignment.findOne({ complaintId, agentId: req.user.id });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this complaint' });
    }

    if (assignment.assignmentStatus !== 'Assigned') {
      return res.status(400).json({ message: `Cannot accept complaint currently marked as ${assignment.assignmentStatus}` });
    }

    assignment.assignmentStatus = 'Accepted';
    await assignment.save();

    const { createNotification } = require('../services/notificationService');
    const complaint = await Complaint.findById(complaintId);
    
    createNotification({
      userId: complaint.userId,
      complaintId: complaint._id,
      title: 'Complaint Accepted',
      message: `Your complaint "${complaint.title}" has been accepted by the assigned officer.`,
      type: 'ComplaintAccepted',
    });

    const SocketService = require('../socket/SocketService');
    SocketService.emitComplaintUpdate(complaint, assignment);

    res.json({ message: 'Complaint accepted', assignment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/officer/complaints/:id/start
// @desc    Start work on a complaint
exports.startWork = async (req, res) => {
  try {
    const complaintId = req.params.id;
    
    const assignment = await Assignment.findOne({ complaintId, agentId: req.user.id });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this complaint' });
    }

    if (assignment.assignmentStatus !== 'Accepted') {
      return res.status(400).json({ message: 'You must accept the complaint before starting work' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (complaint.status !== 'Assigned') {
      return res.status(400).json({ message: `Invalid complaint status: ${complaint.status}` });
    }

    complaint.status = 'In Progress';
    await complaint.save();

    assignment.assignmentStatus = 'In Progress';
    await assignment.save();

    const { createNotification } = require('../services/notificationService');
    
    createNotification({
      userId: complaint.userId,
      complaintId: complaint._id,
      title: 'Complaint In Progress',
      message: `Work has started on your complaint "${complaint.title}".`,
      type: 'ComplaintInProgress',
    });

    const SocketService = require('../socket/SocketService');
    SocketService.emitComplaintUpdate(complaint, assignment);

    res.json({ message: 'Work started on complaint', complaint, assignment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/officer/complaints/:id/resolve
// @desc    Resolve a complaint
exports.resolveComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    
    const assignment = await Assignment.findOne({ complaintId, agentId: req.user.id });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this complaint' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (complaint.status !== 'In Progress') {
      return res.status(400).json({ message: 'Only complaints that are In Progress can be resolved' });
    }

    // Require at least one action note
    const notesCount = await ActionNote.countDocuments({ complaintId });
    if (notesCount === 0) {
      return res.status(400).json({ message: 'You must add at least one Action Note before resolving the complaint' });
    }

    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    await complaint.save();

    assignment.assignmentStatus = 'Completed';
    await assignment.save();

    const { createNotification } = require('../services/notificationService');
    
    createNotification({
      userId: complaint.userId,
      complaintId: complaint._id,
      title: 'Complaint Resolved',
      message: `Your complaint "${complaint.title}" has been successfully resolved.`,
      type: 'ComplaintResolved',
    });

    const SocketService = require('../socket/SocketService');
    SocketService.emitComplaintUpdate(complaint, assignment);

    res.json({ message: 'Complaint resolved', complaint, assignment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/officer/complaints/:id/reject
// @desc    Reject a complaint
exports.rejectComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    
    const assignment = await Assignment.findOne({ complaintId, agentId: req.user.id });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this complaint' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (complaint.status !== 'Assigned') {
      return res.status(400).json({ message: 'You can only reject complaints before work has started (status must be Assigned)' });
    }

    complaint.status = 'Rejected';
    await complaint.save();

    assignment.assignmentStatus = 'Reassigned'; // Or could be some other status, we'll use Reassigned or leave it as whatever mapped value makes sense. 'Reassigned' suggests the admin needs to assign it again. 
    // Wait, the prompt says: ComplaintAssignment Status Assigned -> Accepted -> Completed. Doesn't explicitly give a rejected status for assignment. I'll just change complaint status to Rejected. Let's update assignmentStatus to 'Reassigned' so it drops from active pending queue for this agent potentially, or just leave it. 
    // Wait, the prompt specifically says "Complaint status -> Rejected". Let's do that.
    
    const { createNotification } = require('../services/notificationService');
    
    createNotification({
      userId: complaint.userId,
      complaintId: complaint._id,
      title: 'Complaint Rejected',
      message: `Your complaint "${complaint.title}" has been rejected.`,
      type: 'ComplaintRejected',
    });

    const SocketService = require('../socket/SocketService');
    SocketService.emitComplaintUpdate(complaint, assignment);

    res.json({ message: 'Complaint rejected', complaint });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST /api/officer/complaints/:id/notes
// @desc    Add an action note
exports.addActionNote = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { note } = req.body;

    if (!note) return res.status(400).json({ message: 'Note content is required' });
    
    const assignment = await Assignment.findOne({ complaintId, agentId: req.user.id });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this complaint' });
    }

    const actionNote = new ActionNote({
      complaintId,
      officerId: req.user.id,
      note
    });

    await actionNote.save();
    
    // Populate officer name for immediate UI return
    await actionNote.populate('officerId', 'name');

    res.status(201).json(actionNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST /api/officer/complaints/:id/upload
// @desc    Upload resolution evidence
exports.uploadEvidence = async (req, res) => {
  try {
    const complaintId = req.params.id;
    
    const assignment = await Assignment.findOne({ complaintId, agentId: req.user.id });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this complaint' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment = new ComplaintAttachment({
      complaintId,
      uploadedBy: req.user.id,
      originalFileName: req.file.originalname,
      storedFileName: req.file.filename,
      filePath: `/uploads/complaints/${req.file.filename}`, // Assuming all files go directly to uploads for simplicity, or we organize by ID
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    await attachment.save();
    await attachment.populate('uploadedBy', 'name');

    res.status(201).json(attachment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
