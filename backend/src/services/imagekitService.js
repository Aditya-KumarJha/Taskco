import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import getImageKit, { isImageKitEnabled } from '../config/imagekit.js';
import { BadRequest } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadFromPath = async (filePath, folder = 'tasks') => {
  if (!isImageKitEnabled()) {
    throw new BadRequest('Image upload is not configured');
  }
  const imagekit = getImageKit();
  const fileName = path.basename(filePath);
  const file = fs.readFileSync(filePath);
  try {
    const result = await imagekit.upload({
      file,
      fileName: `${folder}/${Date.now()}-${fileName}`,
      useUniqueFileName: true,
    });
    return result.url;
  } catch (err) {
    logger.error('ImageKit upload error:', err.message);
    throw new BadRequest('Image upload failed');
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch {}
  }
};

export const uploadFromBuffer = async (buffer, originalName, folder = 'tasks') => {
  if (!isImageKitEnabled()) {
    throw new BadRequest('Image upload is not configured');
  }
  const imagekit = getImageKit();
  const ext = path.extname(originalName) || '.jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  try {
    const result = await imagekit.upload({
      file: buffer,
      fileName,
      useUniqueFileName: true,
    });
    return result.url;
  } catch (err) {
    logger.error('ImageKit upload error:', err.message);
    throw new BadRequest('Image upload failed');
  }
};

export const deleteByUrl = async (url) => {
  if (!isImageKitEnabled()) return;
  const imagekit = getImageKit();
  try {
    const id = url.split('/').pop()?.split('-').pop()?.split('.')[0];
    if (id) await imagekit.deleteFile(id);
  } catch (err) {
    logger.warn('ImageKit delete error:', err.message);
  }
};

export default { uploadFromPath, uploadFromBuffer, deleteByUrl, isImageKitEnabled };
