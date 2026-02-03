const nodemailer = require('nodemailer');
require("dotenv").config();

// Create transporter - support two modes:
// 1) provider `service` (e.g. 'gmail') with auth
// 2) explicit SMTP via EMAIL_HOST/EMAIL_PORT/EMAIL_SECURE
const auth = {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD,
};
console.log(process.env.EMAIL_USER);
//console.log(pass);


let transportOptions;
if (process.env.EMAIL_HOST) {
  transportOptions = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: (process.env.EMAIL_SECURE === 'true') || false,
    auth,
  };
} else {
  // Fallback to named service (gmail, etc.)
  transportOptions = {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth,
  };
}
console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE);
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);

const transporter = nodemailer.createTransport(transportOptions);

// Test connection (optional but helpful for debugging)
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.warn('Email service not configured properly:', error.message);
    } else {
      console.log('Email service ready');
    }
  });
}

exports.sendTaskAssignmentEmail = async (recipientEmail, recipientName, taskTitle, taskId, assignerName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `New Task Assigned: ${taskTitle}`,
      html: `
        <h2>New Task Assignment</h2>
        <p>Hi ${recipientName},</p>
        <p><strong>${assignerName}</strong> has assigned a new task to you:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0;">${taskTitle}</h3>
          <p>Task ID: <code>${taskId}</code></p>
        </div>
        <p>Please log in to the platform to view the task details and start working on it.</p>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskId}" 
             style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Task
          </a>
        </p>
        <p>Best regards,<br>Task Management Team</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (err) {
    console.error('Error sending email:', err.message);
    // Don't throw - email failure shouldn't break task creation
    return null;
  }
};

exports.sendTaskUpdateEmail = async (recipientEmail, recipientName, taskTitle, taskId, updateMessage) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Task Updated: ${taskTitle}`,
      html: `
        <h2>Task Update</h2>
        <p>Hi ${recipientName},</p>
        <p>A task you're assigned to has been updated:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0;">${taskTitle}</h3>
          <p>${updateMessage}</p>
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${taskId}" 
             style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Task
          </a>
        </p>
        <p>Best regards,<br>Task Management Team</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Update email sent successfully:', result.messageId);
    return result;
  } catch (err) {
    console.error('Error sending update email:', err.message);
    return null;
  }
};
