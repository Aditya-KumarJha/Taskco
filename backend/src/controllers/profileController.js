import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFound } from '../utils/ApiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) throw new NotFound('User not found');
  res.json({
    success: true,
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...(name !== undefined && { name }), ...(avatar !== undefined && { avatar }) },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) throw new NotFound('User not found');
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

export default { getProfile, updateProfile };
