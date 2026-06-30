const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(auth);

router.get('/', getNotifications);
router.get('/unread', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
