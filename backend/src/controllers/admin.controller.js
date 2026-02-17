import User from '../models/user.model.js';
import Task from '../models/task.model.js';
import Notification from '../models/notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFound, BadRequest } from '../utils/ApiError.js';
import { getCache, setCache, invalidateAdminCache, generateKey, TTL } from '../utils/cache.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, isVerified, provider, search } = req.query;
  
  const filter = {};
  if (role) filter.role = role;
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
  if (provider) filter.provider = provider;
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { 'fullName.firstName': { $regex: search, $options: 'i' } },
      { 'fullName.lastName': { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const users = await User.find(filter)
    .select('-password -otp')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw NotFound('User not found');
  }

  const taskStats = await Task.aggregate([
    { $match: { createdBy: user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = {
    todo: 0,
    in_progress: 0,
    done: 0,
    total: 0,
  };

  taskStats.forEach(({ _id, count }) => {
    stats[_id] = count;
    stats.total += count;
  });

  res.json({
    success: true,
    data: {
      user,
      taskStats: stats,
    },
  });
});

export const getAllTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, priority, userId, search, sort = '-createdAt' } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (userId) filter.createdBy = userId;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const tasks = await Task.find(filter)
    .populate('createdBy', 'email username fullName profilePic')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Task.countDocuments(filter);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    throw BadRequest('You cannot delete your own admin account');
  }

  const user = await User.findById(id);
  if (!user) {
    throw NotFound('User not found');
  }

  await Task.deleteMany({ createdBy: id });
  
  await Notification.deleteMany({ userId: id });

  await User.findByIdAndDelete(id);
  
  await invalidateAdminCache();

  res.json({
    success: true,
    message: 'User and associated data deleted successfully',
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    throw NotFound('Task not found');
  }

  await Task.findByIdAndDelete(id);
  
  await invalidateAdminCache();

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    throw BadRequest('Invalid role. Must be "user" or "admin"');
  }

  if (id === req.user._id.toString()) {
    throw BadRequest('You cannot change your own role');
  }

  const user = await User.findById(id);
  if (!user) {
    throw NotFound('User not found');
  }

  user.role = role;
  await user.save();
  
  await invalidateAdminCache();

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const cacheKey = 'admin:stats';
  
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json({
      success: true,
      data: cached,
      cached: true,
    });
  }
  
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const usersByProvider = await User.aggregate([
    {
      $group: {
        _id: '$provider',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalTasks = await Task.countDocuments();
  const tasksByStatus = await Task.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const tasksByPriority = await Task.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const newTasksThisWeek = await Task.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const topUsers = await Task.aggregate([
    {
      $group: {
        _id: '$createdBy',
        taskCount: { $sum: 1 },
      },
    },
    { $sort: { taskCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        taskCount: 1,
        email: '$user.email',
        username: '$user.username',
        fullName: '$user.fullName',
      },
    },
  ]);

  const statsData = {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      admins: adminUsers,
      newThisWeek: newUsersThisWeek,
      byProvider: usersByProvider.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
    },
    tasks: {
      total: totalTasks,
      newThisWeek: newTasksThisWeek,
      byStatus: tasksByStatus.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      byPriority: tasksByPriority.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
    },
    topUsers,
  };
  
  await setCache(cacheKey, statsData, TTL.SHORT * 2);

  res.json({
    success: true,
    data: statsData,
  });
});

export const toggleUserVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw NotFound('User not found');
  }

  user.isVerified = !user.isVerified;
  await user.save();
  
  await invalidateAdminCache();

  res.json({
    success: true,
    message: `User verification ${user.isVerified ? 'enabled' : 'disabled'}`,
    data: {
      userId: user._id,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
});

export const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw BadRequest('userIds must be a non-empty array');
  }

  if (userIds.includes(req.user._id.toString())) {
    throw BadRequest('You cannot delete your own admin account');
  }

  await Task.deleteMany({ createdBy: { $in: userIds } });
  
  await Notification.deleteMany({ userId: { $in: userIds } });

  const result = await User.deleteMany({ _id: { $in: userIds } });
  
  await invalidateAdminCache();

  res.json({
    success: true,
    message: `${result.deletedCount} user(s) deleted successfully`,
    data: {
      deletedCount: result.deletedCount,
    },
  });
});

export const bulkDeleteTasks = asyncHandler(async (req, res) => {
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw BadRequest('taskIds must be a non-empty array');
  }

  const result = await Task.deleteMany({ _id: { $in: taskIds } });
  
  await invalidateAdminCache();

  res.json({
    success: true,
    message: `${result.deletedCount} task(s) deleted successfully`,
    data: {
      deletedCount: result.deletedCount,
    },
  });
});
