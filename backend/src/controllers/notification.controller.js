import Notification from '../models/notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFound } from '../utils/ApiError.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 20, 1);
  const skip = (page - 1) * limit;

  const [total, notifications] = await Promise.all([
    Notification.countDocuments({ userId: req.user._id }),
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });

  return res.status(200).json({
    success: true,
    data: { notifications },
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      unreadCount,
    },
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!notification) {
    throw NotFound('Notification not found');
  }

  notification.read = true;
  await notification.save();

  return res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, read: false },
    { $set: { read: true } }
  );

  return res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    userId: req.user._id,
  });

  if (!notification) {
    throw NotFound('Notification not found');
  }

  return res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
  });
});
