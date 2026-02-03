import './config/env.js';
import app from './app.js';
import { connectDB } from './config/db.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { startMailConsumer } from './services/mailService.js';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';

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
