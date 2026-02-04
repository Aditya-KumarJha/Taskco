import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

let transporter = null;

if (process.env.EMAIL_USER) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
  transporter.verify((err) => {
    if (err) {
      logger.error('Email server verify error:', err.message || 'Unknown error');
      logger.error('Error code:', err.code);
      logger.error('Error command:', err.command);
      if (err.response) {
        logger.error('SMTP Response:', err.response);
      }
      logger.error('Stack:', err.stack);
    } else {
      logger.info('Email server ready');
    }
  });
}

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    logger.warn('Email not configured; skipping send');
    return null;
  }
  const noRecipients = !to || (typeof to === 'string' && !to.trim());
  if (noRecipients) {
    logger.warn('sendEmail: no recipients, subject:', subject);
    return null;
  }
  try {
    const info = await transporter.sendMail({
      from: `"Taskco" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html,
      html: html || text,
    });
    logger.info('Email sent:', info.messageId);
    return info;
  } catch (error) {
    logger.error('Send email error:', error.message);
    logger.error('Error code:', error.code);
    logger.error('Error response:', error.response);
    return null;
  }
};

export default sendEmail;
