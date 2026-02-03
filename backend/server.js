import dotenv from 'dotenv';
dotenv.config();
import './src/config/env.js';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { connectRabbitMQ } from './src/config/rabbitmq.js';
import { startMailConsumer } from './src/services/mail.service.js';
import { logger } from './src/utils/logger.js';

const PORT = env.PORT;

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  await startMailConsumer();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} (${env.NODE_ENV})`);
  });
};

start().catch((err) => {
  logger.error('Startup error:', err);
  process.exit(1);
});

export default app;
