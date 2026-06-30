const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAgents = await User.countDocuments({ role: 'Agent' });
    const pendingAgentRequests = await User.countDocuments({ role: 'Agent', approvalStatus: 'Pending' });
    const approvedAgents = await User.countDocuments({ role: 'Agent', approvalStatus: 'Approved' });
    const rejectedAgents = await User.countDocuments({ role: 'Agent', approvalStatus: 'Rejected' });

    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const assignedComplaints = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const cancelledComplaints = await Complaint.countDocuments({ status: 'Rejected' }); // assuming Rejected implies cancelled in this context, or we can use another mapping. The prompt said 'Cancelled Complaints' but Complaint model status has 'Rejected'

    res.json({
      totalUsers,
      totalAgents,
      pendingAgentRequests,
      approvedAgents,
      rejectedAgents,
      totalComplaints,
      pendingComplaints,
      assignedComplaints,
      inProgressComplaints,
      resolvedComplaints,
      cancelledComplaints
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/admin/users
// @desc    Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/admin/officers
// @desc    Get all officers
exports.getAllOfficers = async (req, res) => {
  try {
    const officers = await User.find({ role: 'Agent' }).select('-password').sort({ createdAt: -1 });
    res.json(officers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/admin/officers/pending
// @desc    Get pending officer requests
exports.getPendingOfficers = async (req, res) => {
  try {
    const pendingOfficers = await User.find({ role: 'Agent', approvalStatus: 'Pending' }).select('-password').sort({ createdAt: -1 });
    res.json(pendingOfficers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/admin/officers/:id/approve
// @desc    Approve an officer
exports.approveOfficer = async (req, res) => {
  try {
    const officer = await User.findById(req.params.id);

    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }
    if (officer.role !== 'Agent') {
      return res.status(400).json({ message: 'User is not an officer' });
    }
    if (officer.approvalStatus === 'Approved') {
      return res.status(400).json({ message: 'Officer is already approved' });
    }

    officer.approvalStatus = 'Approved';
    officer.approvedBy = req.user.id;
    officer.approvedAt = Date.now();
    await officer.save();

    res.json({ message: 'Officer approved successfully', officer });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Officer not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/admin/officers/:id/reject
// @desc    Reject an officer
exports.rejectOfficer = async (req, res) => {
  try {
    const officer = await User.findById(req.params.id);

    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }
    if (officer.role !== 'Agent') {
      return res.status(400).json({ message: 'User is not an officer' });
    }
    if (officer.approvalStatus === 'Rejected') {
      return res.status(400).json({ message: 'Officer is already rejected' });
    }

    officer.approvalStatus = 'Rejected';
    await officer.save();

    res.json({ message: 'Officer rejected successfully', officer });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Officer not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   GET /api/admin/complaints
// @desc    Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/admin/complaints/:id
// @desc    Get a specific complaint
exports.getComplaintDetails = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('userId', 'name email phone');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(500).send('Server error');
  }
};
