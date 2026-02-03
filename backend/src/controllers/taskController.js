import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFound, Forbidden } from '../utils/ApiError.js';
import { uploadFromPath, uploadFromBuffer, isImageKitEnabled } from '../services/imagekitService.js';
import path from 'path';

const checkOwnership = (task, userId) => {
  if (task.createdBy.toString() !== userId.toString()) {
    throw new Forbidden('Not allowed to access this task');
  }
};

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, imageUrl } = req.body;
  const task = await Task.create({
    title,
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    imageUrl: imageUrl || null,
    createdBy: req.user._id,
  });
  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  });
});

export const listTasks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
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
  if (!task) throw new NotFound('Task not found');
  checkOwnership(task, req.user._id);
  res.json({
    success: true,
    data: { task },
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new NotFound('Task not found');
  checkOwnership(task, req.user._id);

  const { title, description, status, priority, dueDate, imageUrl } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;

  const updated = await Task.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({
    success: true,
    message: 'Task updated successfully',
    data: { task: updated },
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new NotFound('Task not found');
  checkOwnership(task, req.user._id);
  await Task.findByIdAndDelete(req.params.id);
  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});

export const uploadTaskImage = asyncHandler(async (req, res) => {
  if (!req.file && !req.file?.path) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided',
    });
  }
  const filePath = req.file.path;
  let imageUrl;
  if (isImageKitEnabled()) {
    imageUrl = await uploadFromPath(filePath, 'tasks');
  } else {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    imageUrl = `${protocol}://${host}/uploads/${path.basename(filePath)}`;
  }
  res.json({
    success: true,
    data: { imageUrl },
    message: 'Image uploaded. Use imageUrl in create/update task.',
  });
});

export const uploadTaskImageBase64 = asyncHandler(async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({
      success: false,
      message: 'No image (base64) provided. Send { image: "data:image/...;base64,..." }',
    });
  }
  const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({
      success: false,
      message: 'Invalid base64 image format',
    });
  }
  const buffer = Buffer.from(match[2], 'base64');
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const imageUrl = await uploadFromBuffer(buffer, `img.${ext}`, 'tasks');
  res.json({
    success: true,
    data: { imageUrl },
    message: 'Image uploaded. Use imageUrl in create/update task.',
  });
});

export default {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  uploadTaskImage,
  uploadTaskImageBase64,
};
