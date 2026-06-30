const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');
const User = require('../models/User');

/**
 * Create a centralized notification
 * 
 * @param {Object} data 
 * @param {ObjectId} data.userId - The user receiving the notification
 * @param {ObjectId} [data.complaintId] - Associated complaint (if any)
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification body
 * @param {string} data.type - NotificationType Enum value
 * @param {boolean} [data.sendEmailFlag=true] - Whether to send an email concurrently
 * @returns {Promise<Notification>}
 */
const createNotification = async ({
  userId,
  complaintId = null,
  title,
  message,
  type = 'System',
  sendEmailFlag = true,
  metadata = {}
}) => {
  try {
    // 1. Create In-App Notification Record
    const notification = new Notification({
      userId,
      complaintId,
      title,
      message,
      notificationType: type,
      metadata
    });
    await notification.save();

    // 1.5 Emit live socket event
    const SocketService = require('../socket/SocketService');
    SocketService.emitNotification(notification);

    // 2. Conditionally Send Email
    if (sendEmailFlag) {
      // Look up user email
      const user = await User.findById(userId);
      if (user && user.email) {
        // Construct HTML email template basic wrapper
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1976d2;">${title}</h2>
            <p style="font-size: 16px;">Hello ${user.name},</p>
            <p style="font-size: 16px; background: #f5f5f5; padding: 15px; border-left: 4px solid #1976d2;">
              ${message}
            </p>
            <p style="font-size: 14px; color: #777;">You can log in to your dashboard to view more details.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;" />
            <p style="font-size: 12px; color: #aaa;">This is an automated message from the Online Complaint Registration System.</p>
          </div>
        `;

        // Don't await email so it doesn't block the API response
        sendEmail(user.email, title, message, html).catch(err => {
          console.error(`Failed to send email to ${user.email}:`, err);
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't crash main execution, just log it. (Fire and forget style)
  }
};

module.exports = {
  createNotification,
};
