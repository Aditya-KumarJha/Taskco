import Task from '../models/task.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import { publishToQueue } from '../broker/broker.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFound, Forbidden } from '../utils/ApiError.js';
import { uploadFromBuffer, isImageKitEnabled } from '../services/imagekit.service.js';

const checkOwnership = (task, userId) => {
  if (task.createdBy.toString() !== userId.toString()) {
    throw Forbidden('Not allowed to access this task');
  }
};

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  
  let imageUrl = null;
  if (req.file && req.file.buffer) {
    try {
      if (isImageKitEnabled()) {
        imageUrl = await uploadFromBuffer(req.file.buffer, req.file.originalname, 'tasks');
      }
    } catch (err) {
    }
  }
  
  const task = await Task.create({
    title,
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    imageUrl,
    createdBy: req.user._id,
  });
  const user = await User.findById(req.user._id).select('email fullName username').lean();
  await Notification.create({
    userId: req.user._id,
    type: 'task_created',
    title: 'Task created',
    message: `Task "${task.title}" has been created.`,
    data: { taskId: task._id, title: task.title },
  });
  await publishToQueue('TASK_NOTIFICATION.TASK_CREATED', {
    email: user?.email,
    fullName: user?.fullName,
    username: user?.username,
    taskTitle: task.title,
  });
  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  });
});

export const listTasks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 100));
  const skip = (page - 1) * limit;
  const { search, status, priority, sort = 'createdAt', order = 'desc' } = req.query;

  const filter = { createdBy: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search && search.trim()) {
    filter.$or = [
      { title: new RegExp(search.trim(), 'i') },
      { description: new RegExp(search.trim(), 'i') },
    ];
  }

  const sortOpt = { [sort]: order === 'asc' ? 1 : -1 };
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sortOpt).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw NotFound('Task not found');
  checkOwnership(task, req.user._id);
  res.json({
    success: true,
    data: { task },
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw NotFound('Task not found');
  checkOwnership(task, req.user._id);

  const { title, description, status, priority, dueDate } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  
  if (req.file && req.file.buffer) {
    try {
      if (isImageKitEnabled()) {
        updates.imageUrl = await uploadFromBuffer(req.file.buffer, req.file.originalname, 'tasks');
      }
    } catch (err) {
      
    }
  }

  const updated = await Task.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  const user = await User.findById(req.user._id).select('email fullName username').lean();
  await Notification.create({
    userId: req.user._id,
    type: 'task_updated',
    title: 'Task updated',
    message: `Task "${updated.title}" has been updated.`,
    data: { taskId: updated._id, title: updated.title },
  });
  await publishToQueue('TASK_NOTIFICATION.TASK_UPDATED', {
    email: user?.email,
    fullName: user?.fullName,
    username: user?.username,
    taskTitle: updated.title,
  });
  res.json({
    success: true,
    message: 'Task updated successfully',
    data: { task: updated },
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw NotFound('Task not found');
  checkOwnership(task, req.user._id);
  const title = task.title;
  await Task.findByIdAndDelete(req.params.id);
  const user = await User.findById(req.user._id).select('email fullName username').lean();
  await Notification.create({
    userId: req.user._id,
    type: 'task_deleted',
    title: 'Task deleted',
    message: `Task "${title}" has been deleted.`,
    data: { taskId: task._id, title },
  });
  await publishToQueue('TASK_NOTIFICATION.TASK_DELETED', {
    email: user?.email,
    fullName: user?.fullName,
    username: user?.username,
    taskTitle: title,
  });
  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});



export default {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
};
