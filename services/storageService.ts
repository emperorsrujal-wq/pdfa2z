import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Uploads a base64 signature image to Firebase Storage.
 * @param base64 The data URL string.
 * @param userId The ID of the current user (for paths).
 * @returns The download URL of the uploaded image.
 */
export const uploadSignature = async (base64: string, userId: string = 'guest'): Promise<string> => {
  const name = `signatures/${userId}/${Date.now()}.png`;
  const storageRef = ref(storage, name);
  
  // Base64 string expected to be "data:image/png;base64,..."
  // uploadString handles the header if passed 'data_url'
  const uploadTask = await uploadString(storageRef, base64, 'data_url');
  return getDownloadURL(uploadTask.ref);
};

/**
 * Uploads an arbitrary file Blob to Firebase Storage.
 */
export const uploadFile = async (file: Blob, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const uploadTask = await uploadBytes(storageRef, file);
  return getDownloadURL(uploadTask.ref);
};
