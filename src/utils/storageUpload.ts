import { app } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage(app);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadImageToStorage(
  file: File,
  folderPath: string
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('केवल इमेज फ़ाइल (JPG/PNG/WEBP) अपलोड करें।');
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('फ़ोटो 5MB से कम होना चाहिए।');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `${folderPath}/${Date.now()}_${cleanName}`);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type
  });
  return getDownloadURL(snapshot.ref);
}
