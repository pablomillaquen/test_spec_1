import { addPhoto, saveBlob, getAlbumById } from './db.js';

const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export function validatePhoto(file) {
  if (!VALID_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `"${file.name}" is not a supported image format. Use JPEG, PNG, GIF, or WebP.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `"${file.name}" exceeds the 20MB size limit.` };
  }
  return { valid: true };
}

async function generateThumbnail(file, maxDim = 300) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > maxDim) { height *= maxDim / width; width = maxDim; }
      } else {
        if (height > maxDim) { width *= maxDim / height; height = maxDim; }
      }
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    };
    img.onerror = () => reject(new Error(`Failed to load ${file.name}`));
    img.src = url;
  });
}

export async function importPhotos(albumId, files) {
  const album = getAlbumById(albumId);
  if (!album) return;

  for (const file of files) {
    const validation = validatePhoto(file);
    if (!validation.valid) {
      alert(validation.error);
      continue;
    }

    try {
      const thumbnailBlob = await generateThumbnail(file);
      const fullsizeBlob = file;

      const thumbnailId = crypto.randomUUID();
      const fullsizeId = crypto.randomUUID();

      await saveBlob(thumbnailId, thumbnailBlob);
      await saveBlob(fullsizeId, fullsizeBlob);

      addPhoto(albumId, file.name, file.type, file.size, thumbnailId, fullsizeId);
    } catch (err) {
      console.error(`Failed to import ${file.name}:`, err);
    }
  }
}
