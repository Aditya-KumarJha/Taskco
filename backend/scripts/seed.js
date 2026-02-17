import 'dotenv/config';
import bcrypt from 'bcryptjs';
import User from '../src/models/user.model.js';
import Task from '../src/models/task.model.js';
import Notification from '../src/models/notification.model.js';
import { connectDB } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';

const SALT_ROUNDS = 12;

const sampleUsers = [
  {
    email: 'admin@taskco.com',
    username: 'admin',
    password: 'Admin@123456',
    fullName: {
      firstName: 'Admin',
      lastName: 'User',
    },
    provider: 'email',
    isVerified: true,
    role: 'admin',
    profilePic: 'https://i.pravatar.cc/150?img=68',
  },
  {
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'Password123',
    fullName: {
      firstName: 'John',
      lastName: 'Doe',
    },
    provider: 'email',
    isVerified: true,
    profilePic: 'https://i.pravatar.cc/150?img=1',
  },
  {
    email: 'jane.smith@example.com',
    username: 'janesmith',
    password: 'Password123',
    fullName: {
      firstName: 'Jane',
      lastName: 'Smith',
    },
    provider: 'email',
    isVerified: true,
    profilePic: 'https://i.pravatar.cc/150?img=5',
  },
  {
    email: 'mike.wilson@example.com',
    username: 'mikewilson',
    password: 'Password123',
    fullName: {
      firstName: 'Mike',
      lastName: 'Wilson',
    },
    provider: 'email',
    isVerified: true,
    profilePic: 'https://i.pravatar.cc/150?img=12',
  },
  {
    email: 'sarah.jones@gmail.com',
    username: 'sarahjones',
    fullName: {
      firstName: 'Sarah',
      lastName: 'Jones',
    },
    provider: 'google',
    googleId: 'google-mock-id-001',
    isVerified: true,
    profilePic: 'https://i.pravatar.cc/150?img=9',
  },
  {
    email: 'alex.github@example.com',
    username: 'alexdev',
    fullName: {
      firstName: 'Alex',
      lastName: 'Developer',
    },
    provider: 'github',
    githubId: 'github-mock-id-001',
    isVerified: true,
    profilePic: 'https://i.pravatar.cc/150?img=15',
  },
];

const sampleTasks = (userIds) => [
  {
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the Taskco API including all endpoints, authentication flows, and setup instructions.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 
    createdBy: userIds[0],
  },
  {
    title: 'Review pull requests',
    description: 'Review and merge pending pull requests from team members.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 
    createdBy: userIds[0],
  },
  {
    title: 'Fix authentication bug',
    description: 'Investigate and fix the OAuth callback issue reported by QA team.',
    status: 'done',
    priority: 'high',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 
    createdBy: userIds[0],
  },
  {
    title: 'Update dependencies',
    description: 'Update all npm packages to latest stable versions and test for compatibility.',
    status: 'todo',
    priority: 'low',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    createdBy: userIds[0],
  },
  {
    title: 'Design database schema for new features',
    description: 'Create MongoDB schemas for upcoming collaboration features.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
    createdBy: userIds[0],
  },

  {
    title: 'Prepare quarterly report',
    description: 'Compile data and create presentation for Q1 2026 performance review.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdBy: userIds[1],
  },
  {
    title: 'Schedule team meeting',
    description: 'Coordinate with team members to schedule sprint planning meeting.',
    status: 'done',
    priority: 'medium',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdBy: userIds[1],
  },
  {
    title: 'Research new tech stack',
    description: 'Investigate React 19, Next.js 15, and other modern frameworks for upcoming projects.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdBy: userIds[1],
  },
  {
    title: 'Client presentation preparation',
    description: 'Create demo and slides for client meeting next week.',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    createdBy: userIds[1],
  },

  {
    title: 'Optimize database queries',
    description: 'Analyze slow queries and add appropriate indexes to improve performance.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    createdBy: userIds[2],
  },
  {
    title: 'Write unit tests',
    description: 'Increase test coverage to 80% for all controller functions.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    createdBy: userIds[2],
  },
  {
    title: 'Deploy to staging',
    description: 'Deploy latest features to staging environment for QA testing.',
    status: 'done',
    priority: 'high',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdBy: userIds[2],
  },
  {
    title: 'Code review session',
    description: 'Conduct code review session with junior developers.',
    status: 'done',
    priority: 'medium',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdBy: userIds[2],
  },

  {
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdBy: userIds[3],
  },
  {
    title: 'Security audit',
    description: 'Perform security audit and fix any vulnerabilities found.',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: userIds[3],
  },

  {
    title: 'Refactor legacy code',
    description: 'Refactor old modules to use modern ES6+ syntax and best practices.',
    status: 'todo',
    priority: 'low',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdBy: userIds[4],
  },
  {
    title: 'Setup monitoring',
    description: 'Integrate application monitoring tools and alerting system.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    createdBy: userIds[4],
  },
];

const sampleNotifications = (userIds, taskIds) => [
  {
    userId: userIds[0],
    type: 'task_created',
    title: 'Task created',
    message: 'Task "Complete project documentation" has been created.',
    data: { taskId: taskIds[0], title: 'Complete project documentation' },
    read: false,
  },
  {
    userId: userIds[0],
    type: 'task_updated',
    title: 'Task updated',
    message: 'Task "Review pull requests" has been updated.',
    data: { taskId: taskIds[1], title: 'Review pull requests' },
    read: false,
  },
  {
    userId: userIds[0],
    type: 'task_deleted',
    title: 'Task deleted',
    message: 'Task "Old task" has been deleted.',
    data: { taskId: taskIds[2], title: 'Old task' },
    read: true,
  },

  {
    userId: userIds[1],
    type: 'task_created',
    title: 'Task created',
    message: 'Task "Prepare quarterly report" has been created.',
    data: { taskId: taskIds[5], title: 'Prepare quarterly report' },
    read: false,
  },
  {
    userId: userIds[1],
    type: 'task_updated',
    title: 'Task updated',
    message: 'Task "Schedule team meeting" status changed to done.',
    data: { taskId: taskIds[6], title: 'Schedule team meeting' },
    read: true,
  },

  {
    userId: userIds[2],
    type: 'task_created',
    title: 'Task created',
    message: 'Task "Optimize database queries" has been created.',
    data: { taskId: taskIds[9], title: 'Optimize database queries' },
    read: false,
  },
  {
    userId: userIds[2],
    type: 'task_updated',
    title: 'Task updated',
    message: 'Task "Deploy to staging" has been completed.',
    data: { taskId: taskIds[11], title: 'Deploy to staging' },
    read: false,
  },

  {
    userId: userIds[3],
    type: 'task_created',
    title: 'Task created',
    message: 'Task "Setup CI/CD pipeline" has been created.',
    data: { taskId: taskIds[13], title: 'Setup CI/CD pipeline' },
    read: false,
  },

  {
    userId: userIds[4],
    type: 'task_created',
    title: 'Task created',
    message: 'Task "Refactor legacy code" has been created.',
    data: { taskId: taskIds[15], title: 'Refactor legacy code' },
    read: false,
  },
  {
    userId: userIds[4],
    type: 'task_updated',
    title: 'Task updated',
    message: 'Task "Setup monitoring" status changed to in_progress.',
    data: { taskId: taskIds[16], title: 'Setup monitoring' },
    read: false,
  },
];

const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seeding...');

    await connectDB();

    logger.info('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});
    logger.info('✅ Existing data cleared');

    logger.info('👥 Seeding users...');
    const usersToCreate = await Promise.all(
      sampleUsers.map(async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
        return user;
      })
    );

    const createdUsers = await User.insertMany(usersToCreate);
    const userIds = createdUsers.map((user) => user._id);
    logger.info(`✅ Created ${createdUsers.length} users`);

    logger.info('\n' + '='.repeat(80));
    logger.info('📋 TEST USER CREDENTIALS & IDs');
    logger.info('='.repeat(80));
    createdUsers.forEach((user, index) => {
      const originalUser = sampleUsers[index];
      logger.info(`\n${index + 1}. ${user.fullName.firstName} ${user.fullName.lastName} ${user.role === 'admin' ? '(ADMIN)' : ''}`);
      logger.info(`   User ID: ${user._id}`);
      logger.info(`   Email: ${user.email}`);
      if (originalUser.provider === 'email') {
        logger.info(`   Password: ${originalUser.password}`);
      } else {
        logger.info(`   Provider: ${originalUser.provider} (OAuth user)`);
      }
      logger.info(`   Username: ${user.username}`);
    });

    logger.info('\n📝 Seeding tasks...');
    const tasksToCreate = sampleTasks(userIds);
    const createdTasks = await Task.insertMany(tasksToCreate);
    const taskIds = createdTasks.map((task) => task._id);
    logger.info(`✅ Created ${createdTasks.length} tasks`);

    logger.info('\n' + '='.repeat(80));
    logger.info('📝 SAMPLE TASK IDs (First 5 tasks)');
    logger.info('='.repeat(80));
    createdTasks.slice(0, 5).forEach((task, index) => {
      logger.info(`${index + 1}. "${task.title}"`);
      logger.info(`   Task ID: ${task._id}`);
      logger.info(`   Status: ${task.status} | Priority: ${task.priority}`);
      logger.info(`   Created by: ${task.createdBy}`);
    });

    logger.info('🔔 Seeding notifications...');
    const notificationsToCreate = sampleNotifications(userIds, taskIds);
    const createdNotifications = await Notification.insertMany(notificationsToCreate);
    logger.info(`✅ Created ${createdNotifications.length} notifications`);

    logger.info('\n' + '='.repeat(80));
    logger.info('🔔 SAMPLE NOTIFICATION IDs (First 3 notifications)');
    logger.info('='.repeat(80));
    createdNotifications.slice(0, 3).forEach((notif, index) => {
      logger.info(`${index + 1}. ${notif.title}`);
      logger.info(`   Notification ID: ${notif._id}`);
      logger.info(`   Type: ${notif.type} | Read: ${notif.read}`);
      logger.info(`   User ID: ${notif.userId}`);
    });

    logger.info('\n📊 Seeding Summary:');
    logger.info(`   👥 Users: ${createdUsers.length}`);
    logger.info(`   📝 Tasks: ${createdTasks.length}`);
    logger.info(`   🔔 Notifications: ${createdNotifications.length}`);

    const todoCount = await Task.countDocuments({ status: 'todo' });
    const inProgressCount = await Task.countDocuments({ status: 'in_progress' });
    const doneCount = await Task.countDocuments({ status: 'done' });

    logger.info('\n📈 Task Status Distribution:');
    logger.info(`   📋 Todo: ${todoCount}`);
    logger.info(`   🔄 In Progress: ${inProgressCount}`);
    logger.info(`   ✅ Done: ${doneCount}`);

    const highPriority = await Task.countDocuments({ priority: 'high' });
    const mediumPriority = await Task.countDocuments({ priority: 'medium' });
    const lowPriority = await Task.countDocuments({ priority: 'low' });

    logger.info('\n⚡ Task Priority Distribution:');
    logger.info(`   🔴 High: ${highPriority}`);
    logger.info(`   🟡 Medium: ${mediumPriority}`);
    logger.info(`   🟢 Low: ${lowPriority}`);

    logger.info('\n' + '='.repeat(80));
    logger.info('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    logger.info('='.repeat(80));
    
    logger.info('\n💡 QUICK START GUIDE:');
    logger.info('   1. Login with admin user to get JWT token:');
    logger.info('      POST /api/auth/login');
    logger.info(`      Body: { "email": "${createdUsers[0].email}", "password": "Admin@123456" }`);
    logger.info('\n   2. Use the JWT token in Authorization header for protected routes:');
    logger.info('      Authorization: Bearer <your_jwt_token>');
    logger.info('\n   3. See POSTMAN.md for complete API documentation with examples');
    logger.info('\n' + '='.repeat(80));
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
