const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  sendMessage,
  getConversation,
  markMessagesAsRead,
  getConversationsSummary
} = require('../controllers/messageController');

// All messaging routes require authentication
router.use(auth);

router.post('/', sendMessage);
router.get('/', getConversationsSummary);
router.get('/:complaintId', getConversation);
router.put('/:complaintId/read', markMessagesAsRead);

module.exports = router;
