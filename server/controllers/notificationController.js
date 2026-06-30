const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all active notifications for the current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.user.id, 
      deletedAt: null 
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET /api/notifications/unread
// @desc    Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false,
      deletedAt: null
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/notifications/:id/read
// @desc    Mark a specific notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, deletedAt: null },
      { $set: { isRead: true, readAt: Date.now() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT /api/notifications/read-all
// @desc    Mark all unread notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false, deletedAt: null },
      { $set: { isRead: true, readAt: Date.now() } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   DELETE /api/notifications/:id
// @desc    Soft delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, deletedAt: null },
      { $set: { deletedAt: Date.now() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
