import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error('Error connecting to email server:', error);
  } else {
    logger.info('Email server is ready to send messages');
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const noRecipients =
      !to ||
      (Array.isArray(to) && to.length === 0) ||
      (typeof to === 'string' && to.trim() === '');

    if (noRecipients) {
      logger.warn('sendEmail: no recipients provided — skipping email (subject:', subject, ')');
      return null;
    }

    const info = await transporter.sendMail({
      from: `"Taskco" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info('Message sent:', info.messageId);
  } catch (error) {
    logger.error('Error sending email:', error);
    return null;
  }
};
