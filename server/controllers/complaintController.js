const Complaint = require('../models/Complaint');

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private (Ordinary User)
exports.createComplaint = async (req, res) => {
  try {
    const { category, title, address, city, state, pincode, description } = req.body;

    if (req.user.role !== 'Ordinary') {
      return res.status(403).json({ message: 'Only ordinary users can lodge complaints' });
    }

    // Validation for numeric pincode
    if (!/^\d+$/.test(pincode)) {
      return res.status(400).json({ message: 'Pincode must be numeric' });
    }

    const complaint = new Complaint({
      userId: req.user.id,
      category,
      title,
      address,
      city,
      state,
      pincode,
      description,
    });

    await complaint.save();

    // Trigger Notification
    const { createNotification } = require('../services/notificationService');
    createNotification({
      userId: req.user.id,
      complaintId: complaint._id,
      title: 'Complaint Submitted Successfully',
      message: `Your complaint "${complaint.title}" has been registered and is pending assignment.`,
      type: 'ComplaintSubmitted',
    });

    res.status(201).json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/complaints
// @desc    Get all complaints for logged-in user
// @access  Private
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/complaints/:id
// @desc    Get a single complaint by ID
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ensure user owns the complaint
    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to view this complaint' });
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

// @route   PUT /api/complaints/:id
// @desc    Update a complaint
// @access  Private
exports.updateComplaint = async (req, res) => {
  try {
    const { category, title, address, city, state, pincode, description } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ensure user owns the complaint
    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to edit this complaint' });
    }

    // Ensure complaint is still Pending
    if (complaint.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot edit a complaint that is no longer Pending' });
    }

    // Validation for numeric pincode
    if (pincode && !/^\d+$/.test(pincode)) {
      return res.status(400).json({ message: 'Pincode must be numeric' });
    }

    const updateFields = {};
    if (category) updateFields.category = category;
    if (title) updateFields.title = title;
    if (address) updateFields.address = address;
    if (city) updateFields.city = city;
    if (state) updateFields.state = state;
    if (pincode) updateFields.pincode = pincode;
    if (description) updateFields.description = description;

    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   DELETE /api/complaints/:id
// @desc    Delete/Cancel a complaint
// @access  Private
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ensure user owns the complaint
    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this complaint' });
    }

    // Ensure complaint is still Pending
    if (complaint.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot cancel a complaint that is no longer Pending' });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({ message: 'Complaint cancelled successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(500).send('Server error');
  }
};
