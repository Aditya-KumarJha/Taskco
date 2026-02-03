import ImageKit from 'imagekit';
import { env } from './env.js';

let imagekit = null;

if (env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});
}

export const getImageKit = () => imagekit;
export const isImageKitEnabled = () => !!imagekit;

export default getImageKit;
