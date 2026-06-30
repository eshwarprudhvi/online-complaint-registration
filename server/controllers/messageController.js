const Message = require('../models/Message');
const Complaint = require('../models/Complaint');
const Assignment = require('../models/Assignment');

// Helper to determine the receiver based on sender and complaint assignment
const determineParticipants = async (complaintId, userId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) return null;

  const assignment = await Assignment.findOne({ complaintId });

  const ownerId = complaint.userId.toString();
  const officerId = assignment ? assignment.agentId.toString() : null;

  if (userId === ownerId) {
    return {
      senderRole: 'Citizen',
      receiverId: officerId,
      complaint
    };
  } else if (userId === officerId) {
    return {
      senderRole: 'Agent',
      receiverId: ownerId,
      complaint
    };
  }

  return null;
};

// @route   POST /api/messages
// @desc    Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { complaintId, message } = req.body;

    if (!complaintId || !message) {
      return res.status(400).json({ message: 'Complaint ID and message are required' });
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({ message: 'Message cannot exceed 1000 characters' });
    }

    const participants = await determineParticipants(complaintId, req.user.id);
    if (!participants) {
      return res.status(403).json({ message: 'You are not authorized to participate in this conversation' });
    }

    if (!participants.receiverId) {
      return res.status(400).json({ message: 'Complaint is not currently assigned to an officer. You cannot send a message yet.' });
    }

    // Optional: prevent rapid submissions logic could go here by checking if last message was < 1 sec ago
    const lastMessage = await Message.findOne({ complaintId, senderId: req.user.id }).sort({ createdAt: -1 });
    if (lastMessage && (Date.now() - new Date(lastMessage.createdAt).getTime()) < 1000) {
      return res.status(429).json({ message: 'You are sending messages too quickly' });
    }

    const newMessage = new Message({
      complaintId,
      senderId: req.user.id,
      receiverId: participants.receiverId,
      message: trimmedMessage,
    });

    await newMessage.save();

    // Populate sender info for the immediate return
    await newMessage.populate('senderId', 'name');

    // Broadcast the message using SocketService
    const SocketService = require('../socket/SocketService');
    SocketService.emitMessage({
      ...newMessage.toObject(),
      senderId: { _id: newMessage.senderId._id, name: newMessage.senderId.name }
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/messages/:complaintId
// @desc    Get full conversation
exports.getConversation = async (req, res) => {
  try {
    const complaintId = req.params.complaintId;
    const participants = await determineParticipants(complaintId, req.user.id);
    if (!participants) {
      return res.status(403).json({ message: 'You are not authorized to view this conversation' });
    }

    const messages = await Message.find({ complaintId })
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/messages/:complaintId/read
// @desc    Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const complaintId = req.params.complaintId;
    const participants = await determineParticipants(complaintId, req.user.id);
    if (!participants) {
      return res.status(403).json({ message: 'You are not authorized to update this conversation' });
    }

    // Find messages sent TO the current user and not read
    await Message.updateMany(
      { complaintId, receiverId: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: Date.now() } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/messages
// @desc    Get conversation summaries for the user
exports.getConversationsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    let relevantComplaints = [];

    // If Ordinary user (Citizen)
    if (req.user.role === 'Ordinary') {
      relevantComplaints = await Complaint.find({ userId });
    } 
    // If Agent (Officer)
    else if (req.user.role === 'Agent') {
      const assignments = await Assignment.find({ agentId: userId }).populate('complaintId');
      relevantComplaints = assignments.map(a => a.complaintId);
    } 
    // Unlikely case, admins shouldn't chat based on requirements
    else {
      return res.status(403).json({ message: 'Role not supported for messaging' });
    }

    const summaries = await Promise.all(
      relevantComplaints.map(async (complaint) => {
        if (!complaint) return null;
        
        // Find last message
        const lastMessage = await Message.findOne({ complaintId: complaint._id }).sort({ createdAt: -1 }).populate('senderId', 'name');
        
        // Find unread count for the current user
        const unreadCount = await Message.countDocuments({ complaintId: complaint._id, receiverId: userId, isRead: false });

        // Determine participant
        const assignment = await Assignment.findOne({ complaintId: complaint._id })
          .populate('agentId', 'name')
          .populate('userId', 'name'); // The citizen
          
        let participantName = 'Unassigned';
        let participantRole = 'Unknown';
        let participantId = null;
        
        if (req.user.role === 'Ordinary') {
          // Citizen sees Officer
          if (assignment && assignment.agentId) {
            participantName = assignment.agentId.name;
            participantId = assignment.agentId._id || assignment.agentId;
            participantRole = 'Officer';
          }
        } else {
          // Officer sees Citizen
          if (assignment && assignment.userId) {
            participantName = assignment.userId.name;
            participantId = assignment.userId._id || assignment.userId;
          } else {
             const c = await Complaint.findById(complaint._id).populate('userId', 'name');
             participantName = c.userId?.name;
             participantId = c.userId?._id;
          }
          participantRole = 'Citizen';
        }

        return {
          complaintId: complaint._id,
          complaintTitle: complaint.title,
          complaintStatus: complaint.status,
          participantName,
          participantRole,
          participantId,
          lastMessage: lastMessage ? lastMessage.message : 'No messages yet',
          lastMessageTime: lastMessage ? lastMessage.createdAt : null,
          unreadCount,
        };
      })
    );

    // Filter out nulls and optionally sort by lastMessageTime
    const validSummaries = summaries.filter(s => s !== null);
    validSummaries.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.json(validSummaries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
