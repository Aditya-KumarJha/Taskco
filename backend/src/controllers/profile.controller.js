import { getProfileUser, updateProfileUser } from '../services/auth.service.js';
import { uploadImage } from '../services/imagekit.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFound } from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { getCache, setCache, deleteCache, generateKey, TTL } from '../utils/cache.js';

export const getProfile = asyncHandler(async (req, res) => {
  const cacheKey = generateKey('profile', req.user._id);
  
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json({
      success: true,
      data: { user: cached },
      cached: true,
    });
  }
  
  const user = await User.findById(req.user._id).select('-password');
  if (!user) throw NotFound('User not found');
  
  const profileData = getProfileUser(user);
  
  await setCache(cacheKey, profileData, TTL.MEDIUM);
  
  return res.json({
    success: true,
    data: { user: profileData },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const payload = {};

  if (req.body.username) payload.username = req.body.username;

  if (req.body.fullName) {
    payload.fullName = {
      firstName: req.body.fullName.firstName,
      lastName: req.body.fullName.lastName,
    };
  }

  if (req.body.currentPassword && req.body.newPassword) {
    payload.currentPassword = req.body.currentPassword;
    payload.newPassword = req.body.newPassword;
  }

  if (req.file?.buffer) {
    const uploaded = await uploadImage({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
    });
    if (uploaded?.url) payload.profilePic = uploaded.url;
  }

  const user = await updateProfileUser(userId, payload);
  
  const cacheKey = generateKey('profile', userId);
  await deleteCache(cacheKey);

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: getProfileUser(user) },
  });
});

export default { getProfile, updateProfile };
