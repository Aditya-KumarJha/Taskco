import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { getMailQueueName, getChannel } from '../config/rabbitmq.js';

let transporter = null;

if (env.EMAIL_USER) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_APP_PASSWORD || '',
    },
  });
}

const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    logger.warn('Mail transporter not configured');
    return;
  }
  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to,
      subject,
      text: text || html,
      html: html || text,
    });
    logger.info(`Mail sent to ${to}`);
  } catch (err) {
    logger.error('Send mail error:', err.message);
    throw err;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const payload = {
    to: email,
    subject: 'Welcome to Taskco',
    html: `<h2>Welcome${name ? `, ${name}` : ''}!</h2><p>Your account has been created.</p>`,
  };
  const channel = getChannel();
  if (channel) {
    const { publishToMailQueue } = await import('../config/rabbitmq.js');
    await publishToMailQueue(payload);
  } else {
    await sendMail(payload);
  }
};

export const startMailConsumer = async () => {
  if (!env.RABBITMQ_URL) return;
  try {
    const conn = await amqp.connect(env.RABBITMQ_URL);
    const ch = await conn.createChannel();
    const queue = getMailQueueName();
    await ch.assertQueue(queue, { durable: true });
    ch.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        await sendMail(payload);
        ch.ack(msg);
      } catch (err) {
        logger.error('Mail consumer error:', err.message);
        ch.nack(msg, false, true);
      }
    }, { noAck: false });
    logger.info('Mail queue consumer started');
  } catch (err) {
    logger.error('Mail consumer start error:', err.message);
  }
};

export default { sendMail, sendWelcomeEmail, startMailConsumer };
