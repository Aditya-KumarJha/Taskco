import amqplib from 'amqplib';
import { logger } from '../utils/logger.js';

let channel = null;
let connection = null;

export async function connect() {
  if (connection) return connection;
  if (!process.env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL not set; broker disabled');
    return null;
  }
  try {
    connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
      connection = null;
      channel = null;
    });
    connection.on('error', (err) => {
      logger.error('RabbitMQ error:', err);
    });
    logger.info('Connected to RabbitMQ');
    return connection;
  } catch (error) {
    logger.error('RabbitMQ connect error:', error.message);
    return null;
  }
}

export async function publishToQueue(queueName, data = {}) {
  if (!channel && !connection) {
    await connect();
  }
  if (!channel) {
    logger.warn('Broker not available; message not sent:', queueName);
    return;
  }
  try {
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
  } catch (error) {
    logger.error('Publish to queue error:', error.message);
  }
}

export async function subscribeToQueue(queueName, callback) {
  if (!channel && !connection) {
    await connect();
  }
  if (!channel) {
    logger.warn('Broker not available; consumer not started:', queueName);
    return;
  }
  try {
    const q = await channel.assertQueue(queueName, { durable: true });
    logger.info(`Queue ${queueName} has ${q.messageCount} messages waiting`);
    
    channel.prefetch(1);
    
    const testMsg = await channel.get(queueName, { noAck: false });
    if (testMsg) {
      logger.info(`🧪 TEST: Found message in queue ${queueName}, processing manually`);
      try {
        const data = JSON.parse(testMsg.content.toString());
        await callback(data);
        channel.ack(testMsg);
        logger.info(`✅ TEST message processed for ${queueName}`);
      } catch (err) {
        logger.error(`TEST message error:`, err);
        channel.nack(testMsg, false, true);
      }
    }
    
    const consumerTag = await channel.consume(queueName, async (msg) => {
      if (msg === null) {
        logger.warn(`Consumer ${queueName} cancelled by server`);
        return;
      }
      logger.info(`📥 Message received from ${queueName}`);
      try {
        const data = JSON.parse(msg.content.toString());
        await callback(data);
        channel.ack(msg);
        logger.info(`✅ Message acknowledged for ${queueName}`);
      } catch (err) {
        logger.error(`Consumer ${queueName} error:`, err.message);
        logger.error('Full error:', err);
        channel.nack(msg, false, true);
      }
    }, { noAck: false });
    logger.info(`Consumer started: ${queueName} (tag: ${consumerTag.consumerTag})`);
  } catch (error) {
    logger.error('Subscribe error:', error.message);
  }
}

export { channel, connection };
