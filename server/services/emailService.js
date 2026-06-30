const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
});

/**
 * Send an email using standard configured transporter
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html = '') => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Complaint System'}" <${process.env.EMAIL_FROM || 'no-reply@example.com'}>`,
      to,
      subject,
      text,
      html: html || text,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Depending on business requirements, we might want to throw error or just log it
    // For a notification service, typically we don't want to crash the main transaction if an email fails
  }
};

module.exports = {
  sendEmail,
};
