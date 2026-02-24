import { v2 as cloudinary } from 'cloudinary';

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryEnabled() {
  return !!getCloudinaryConfig();
}

export async function uploadImageToCloudinary(params: {
  base64: string;
  mimeType: string;
  fileName: string;
}) {
  const cfg = getCloudinaryConfig();
  if (!cfg) throw new Error('Cloudinary env is not configured');

  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
    secure: true,
  });

  const dataUri = `data:${params.mimeType};base64,${params.base64}`;
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: 'movielist/covers',
    resource_type: 'image',
    filename_override: params.fileName,
    use_filename: true,
    unique_filename: true,
  });

  if (!res.secure_url) throw new Error('Cloudinary upload failed');
  return res.secure_url;
}

/**
 * ดึง public_id จาก Cloudinary URL (สำหรับใช้ลบไฟล์)
 * ตัวอย่าง: https://res.cloudinary.com/xxx/image/upload/v123/movielist/covers/abc.jpg → movielist/covers/abc
 */
function getPublicIdFromUrl(url: string): string | null {
  if (!url?.includes('res.cloudinary.com')) return null;
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx < 0 || uploadIdx >= parts.length - 1) return null;
    // หลัง upload อาจมี v123 แล้วตามด้วย public_id.ext
    const afterUpload = parts.slice(uploadIdx + 1);
    const first = afterUpload[0] ?? '';
    const startIdx = /^v\d+$/.test(first) ? 1 : 0;
    const pathParts = afterUpload.slice(startIdx);
    if (pathParts.length === 0) return null;
    const last = pathParts[pathParts.length - 1] ?? '';
    const lastWithoutExt = last.includes('.') ? last.replace(/\.[^.]+$/, '') : last;
    pathParts[pathParts.length - 1] = lastWithoutExt;
    return pathParts.join('/');
  } catch {
    return null;
  }
}

/**
 * ลบรูปออกจาก Cloudinary ตาม URL (ไม่ throw ถ้าไม่ใช่ URL Cloudinary หรือลบไม่สำเร็จ)
 */
export async function deleteImageFromCloudinaryIfExists(coverUrl: string): Promise<void> {
  const cfg = getCloudinaryConfig();
  if (!cfg) return;

  const publicId = getPublicIdFromUrl(coverUrl);
  if (!publicId) return;

  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
    secure: true,
  });

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (e) {
    console.error('Cloudinary delete failed:', e);
  }
}

