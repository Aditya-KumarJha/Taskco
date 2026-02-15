import amqplib from 'amqplib';
import { logger } from '../utils/logger.js';

let publishChannel = null;
let consumeChannel = null;
let connection = null;

export async function connect() {
  if (connection) return connection;
  if (!process.env.RABBITMQ_URL) {
    logger.warn('RABBITMQ_URL not set; broker disabled');
    return null;
  }
  try {
    connection = await amqplib.connect(process.env.RABBITMQ_URL);
    
    publishChannel = await connection.createChannel();
    consumeChannel = await connection.createChannel();
    
    await consumeChannel.prefetch(1);
    
    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
      connection = null;
      publishChannel = null;
      consumeChannel = null;
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
  if (!publishChannel && !connection) {
    await connect();
  }
  if (!publishChannel) {
    logger.warn('Broker not available; message not sent:', queueName);
    return;
  }
  try {
    await publishChannel.assertQueue(queueName, { durable: true });
    publishChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
    logger.info(`📤 Message published to ${queueName}`);
  } catch (error) {
    logger.error('Publish to queue error:', error.message);
  }
}

export async function subscribeToQueue(queueName, callback) {
  if (!consumeChannel && !connection) {
    await connect();
  }
  if (!consumeChannel) {
    logger.warn('Broker not available; consumer not started:', queueName);
    return;
  }
  try {
    const q = await consumeChannel.assertQueue(queueName, { durable: true });
    logger.info(`Queue ${queueName} has ${q.messageCount} messages waiting`);
    
    const consumerInfo = await consumeChannel.consume(
      queueName,
      async (msg) => {
        if (msg === null) {
          logger.warn(`Consumer ${queueName} cancelled by server`);
          return;
        }
        
        logger.info(`📥 Message received from ${queueName}`);
        
        try {
          const data = JSON.parse(msg.content.toString());
          await callback(data);
          consumeChannel.ack(msg);
          logger.info(`✅ Message acknowledged for ${queueName}`);
        } catch (err) {
          logger.error(`❌ Consumer ${queueName} error:`, err.message);
          logger.error('Full error:', err);
          consumeChannel.nack(msg, false, true);
        }
      },
      { 
        noAck: false,
        consumerTag: `taskco-${queueName}-${Date.now()}`
      }
    );
    
    logger.info(`Consumer started: ${queueName} (tag: ${consumerInfo.consumerTag})`);
  } catch (error) {
    logger.error(`Subscribe error for ${queueName}:`, error.message);
  }
}

export { publishChannel, consumeChannel, connection };
