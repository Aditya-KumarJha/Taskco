import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import getImageKit, { isImageKitEnabled } from '../config/imagekit.js';
import { BadRequest } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadToImageKitDirect = async (base64Data, fileName) => {
  const authString = Buffer.from(
    `${process.env.IMAGEKIT_PRIVATE_KEY}:`
  ).toString('base64');
  
  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('fileName', fileName);
  formData.append('useUniqueFileName', 'true');
  
  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    logger.error('ImageKit upload failed:', errorText);
    throw new Error('ImageKit upload failed');
  }
  
  const result = await response.json();
  return result;
};

export const uploadFromPath = async (filePath, folder = 'tasks') => {
  if (!isImageKitEnabled()) {
    throw BadRequest('Image upload is not configured');
  }
  
  const fileName = path.basename(filePath);
  
  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (err) {
    logger.error('Image read error:', err.message || err);
    throw BadRequest('Unable to read uploaded file');
  }

  try {
    const ext = path.extname(fileName).replace('.', '').toLowerCase();
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/${mime};base64,${base64}`;
    
    const result = await uploadToImageKitDirect(
      dataUri,
      `${folder}/${Date.now()}-${fileName}`
    );
    
    if (!result || !result.url) {
      throw new Error('ImageKit returned no URL');
    }
    
    return result.url;
  } catch (err) {
    logger.error('ImageKit upload error:', err);
    throw BadRequest('Image upload failed');
  } finally {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      logger.warn('Failed to remove temp upload file:', e.message || e);
    }
  }
};

export const uploadFromBuffer = async (buffer, originalName, folder = 'tasks') => {
  if (!isImageKitEnabled()) {
    throw BadRequest('Image upload is not configured');
  }
  
  const ext = path.extname(originalName) || '.jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  
  try {
    const rawExt = ext.replace('.', '').toLowerCase();
    const mime = rawExt === 'jpg' ? 'jpeg' : rawExt;
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/${mime};base64,${base64}`;
    
    const result = await uploadToImageKitDirect(dataUri, fileName);
    
    if (!result || !result.url) {
      throw new Error('ImageKit returned no URL');
    }
    
    return result.url;
  } catch (err) {
    logger.error('ImageKit upload error:', err);
    throw BadRequest('Image upload failed');
  }
};

export const uploadImage = async ({ buffer, path: filePath, originalName = 'profile.jpg' }) => {
  if (filePath) {
    const url = await uploadFromPath(filePath, 'profile');
    return { url };
  }
  if (buffer) {
    const url = await uploadFromBuffer(buffer, originalName, 'profile');
    return { url };
  }
  throw BadRequest('No file provided');
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

export { isImageKitEnabled };
export default { uploadFromPath, uploadFromBuffer, deleteByUrl, isImageKitEnabled };
