import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { connect } from './src/broker/broker.js';
import { startNotificationConsumers } from './src/broker/notification.consumer.js';
import { logger } from './src/utils/logger.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  await connect();
  await startNotificationConsumers();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

start().catch((err) => {
  logger.error('Startup error:', err);
  process.exit(1);
});

export default app;
