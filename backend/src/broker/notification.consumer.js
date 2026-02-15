import { subscribeToQueue } from './broker.js';
import { sendEmail } from '../services/email.service.js';
import { logger } from '../utils/logger.js';

const getCustomerName = (data = {}) => {
  if (data.fullName && typeof data.fullName === 'object') {
    const first = data.fullName.firstName || '';
    const last = data.fullName.lastName || '';
    const name = `${first} ${last}`.trim();
    if (name) return name;
  }
  if (typeof data.fullName === 'string' && data.fullName.trim()) return data.fullName;
  if (data.username && data.username.trim()) return data.username;
  return 'there';
};

const emailLayout = ({ title, body }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
    <h2 style="color: #2c3e50;">${title}</h2>
    ${body}
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
    <p style="font-size: 12px; color: #888;">
      This is an automated email from Taskco. Please do not share OTPs or sensitive information.
    </p>
  </div>
`;

const otpBlock = (otp, color = '#3498db') => `
  <div style="font-size: 26px; font-weight: bold; color: ${color}; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px; margin: 20px 0;">
    ${otp}
  </div>
`;

const footerSignature = `
  <p style="margin-top: 30px;">
    Best regards,<br/>
    <strong>The Taskco Team</strong>
  </p>
`;

const send = async (data, { subject, title, body, text }) => {
  logger.info('📨 Attempting to send email:', { email: data?.email, subject });
  
  if (!data?.email) {
    logger.warn('⚠️ Email skipped: no recipient email in payload', JSON.stringify(data));
    return;
  }

  const html = emailLayout({ title, body });

  try {
    const result = await sendEmail({
      to: data.email,
      subject,
      text: text || undefined,
      html,
    });

    if (!result) {
      logger.warn('Email not sent to:', data.email);
    }
  } catch (error) {
    logger.error('Notification email failed', error);
  }
};

export async function startNotificationConsumers() {
  const register = (queue, handler) => {
    subscribeToQueue(queue, async (data) => {
      await handler(data);
    });
  };

  register('AUTH_NOTIFICATION.REGISTER_OTP', async (data) => {
    const name = getCustomerName(data);
    await send(data, {
      subject: 'Verify your email – Taskco',
      title: 'Welcome to Taskco',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for registering. Please verify your email using the OTP below.</p>
        ${otpBlock(data.otpCode)}
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not create this account, please ignore this email.</p>
        ${footerSignature}
      `,
      text: `Your OTP is ${data.otpCode}. It expires in 10 minutes.`,
    });
  });

  register('AUTH_NOTIFICATION.RESEND_OTP', async (data) => {
    const name = getCustomerName(data);
    await send(data, {
      subject: 'Your New OTP – Taskco',
      title: 'Your New OTP',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>You requested a new OTP. Please use the OTP below:</p>
        ${otpBlock(data.otpCode)}
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        ${footerSignature}
      `,
      text: `Your new OTP is ${data.otpCode}.`,
    });
  });

  register('AUTH_NOTIFICATION.LOGIN_OTP', async (data) => {
    const name = getCustomerName(data);
    await send(data, {
      subject: 'Login Verification – Taskco',
      title: 'Login Verification',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>We detected a login attempt. If this was you, please verify using the OTP below:</p>
        ${otpBlock(data.otpCode)}
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        ${footerSignature}
      `,
      text: `Your login OTP is ${data.otpCode}.`,
    });
  });

  register('AUTH_NOTIFICATION.FORGOT_PASSWORD_OTP', async (data) => {
    const name = getCustomerName(data);
    await send(data, {
      subject: 'Reset Your Password – Taskco',
      title: 'Reset Your Password',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Please use the OTP below:</p>
        ${otpBlock(data.otpCode, '#e74c3c')}
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        ${footerSignature}
      `,
      text: `Your password reset OTP is ${data.otpCode}.`,
    });
  });

  register('AUTH_NOTIFICATION.WELCOME_USER', async (data) => {
    const name = getCustomerName(data);
    await send(data, {
      subject: 'Welcome to Taskco!',
      title: 'Welcome to Taskco!',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your email has been verified and your Taskco account is now active.</p>
        <p>You can create and manage tasks, stay organized, and get things done.</p>
        ${footerSignature}
      `,
      text: 'Your Taskco account is now active.',
    });
  });

  register('AUTH_NOTIFICATION.LOGIN_SUCCESS', async (data) => {
    const name = getCustomerName(data);
    await send(data, {
      subject: 'Successful Login – Taskco',
      title: 'Successful Login',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>You have successfully logged in to your Taskco account.</p>
        ${footerSignature}
      `,
      text: 'You have successfully logged in.',
    });
  });

  register('AUTH_NOTIFICATION.OAUTH_WELCOME', async (data) => {
    const name = getCustomerName(data);
    await send(data, {
      subject: 'Welcome to Taskco!',
      title: 'Welcome to Taskco!',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your account has been created with ${data.provider || 'OAuth'}.</p>
        ${footerSignature}
      `,
      text: 'Your Taskco account is ready.',
    });
  });

  register('AUTH_NOTIFICATION.PASSWORD_UPDATED', async (data) => {
    const name = getCustomerName(data);
    await send(data, {
      subject: 'Password Updated – Taskco',
      title: 'Password Updated',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your Taskco account password has been successfully updated.</p>
        ${footerSignature}
      `,
      text: 'Your password has been updated.',
    });
  });

  register('TASK_NOTIFICATION.TASK_CREATED', async (data) => {
    await send(data, {
      subject: 'Task created – Taskco',
      title: 'Task created',
      body: `
        <p>Hi <strong>${getCustomerName(data)}</strong>,</p>
        <p>Your task "<strong>${data.taskTitle || 'Untitled'}</strong>" has been created.</p>
        ${footerSignature}
      `,
      text: `Task "${data.taskTitle || 'Untitled'}" created.`,
    });
  });

  register('TASK_NOTIFICATION.TASK_UPDATED', async (data) => {
    await send(data, {
      subject: 'Task updated – Taskco',
      title: 'Task updated',
      body: `
        <p>Hi <strong>${getCustomerName(data)}</strong>,</p>
        <p>Your task "<strong>${data.taskTitle || 'Untitled'}</strong>" has been updated.</p>
        ${footerSignature}
      `,
      text: `Task "${data.taskTitle || 'Untitled'}" updated.`,
    });
  });

  register('TASK_NOTIFICATION.TASK_DELETED', async (data) => {
    await send(data, {
      subject: 'Task deleted – Taskco',
      title: 'Task deleted',
      body: `
        <p>Hi <strong>${getCustomerName(data)}</strong>,</p>
        <p>Your task "<strong>${data.taskTitle || 'Untitled'}</strong>" has been deleted.</p>
        ${footerSignature}
      `,
      text: `Task "${data.taskTitle || 'Untitled'}" deleted.`,
    });
  });

  logger.info('All notification consumers started');
}
