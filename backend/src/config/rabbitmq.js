import amqp from 'amqplib';
import { logger } from '../utils/logger.js';
import { env } from './env.js';

let connection = null;
let channel = null;

const QUEUE_MAIL = 'mail_queue';

export const getChannel = () => channel;
export const getConnection = () => connection;

export const connectRabbitMQ = async () => {
  if (!env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL not set; mail queue disabled');
    return;
  }
  try {
    connection = await amqp.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_MAIL, { durable: true });
    connection.on('close', () => { logger.warn('RabbitMQ connection closed'); });
    connection.on('error', (err) => { logger.error('RabbitMQ error:', err); });
    logger.info('RabbitMQ connected');
  } catch (error) {
    logger.error('RabbitMQ connection error:', error.message);
  }
};

export const publishToMailQueue = async (payload) => {
  if (!channel) {
    logger.warn('RabbitMQ channel not available');
    return false;
  }
  try {
    channel.sendToQueue(QUEUE_MAIL, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
    return true;
  } catch (error) {
    logger.error('Publish to mail queue failed:', error.message);
    return false;
  }
};

export const getMailQueueName = () => QUEUE_MAIL;

export default { connectRabbitMQ, publishToMailQueue, getChannel, getMailQueueName };
