import 'dotenv/config';
import { connectDB } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';
import User from '../src/models/user.model.js';
import Task from '../src/models/task.model.js';
import Notification from '../src/models/notification.model.js';

const clearDatabase = async () => {
  try {
    logger.info('🔌 Connecting to database...');
    await connectDB();

    logger.info('🗑️  Clearing collections...');
    const results = {};

    results.users = await User.deleteMany({});
    results.tasks = await Task.deleteMany({});
    results.notifications = await Notification.deleteMany({});

    logger.info('✅ Collections cleared:');
    logger.info(`   users: ${results.users.deletedCount}`);
    logger.info(`   tasks: ${results.tasks.deletedCount}`);
    logger.info(`   notifications: ${results.notifications.deletedCount}`);

    logger.info('🎉 Database cleared successfully');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Failed to clear database:', err);
    process.exit(1);
  }
};

clearDatabase();
