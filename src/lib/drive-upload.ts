import { Readable } from 'stream';
import { getDriveFileId } from './cover-image';
import { getDriveClient } from './google';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/** ลบไฟล์ใน Google Drive ตาม URL (ไม่ throw ถ้าไม่มีสิทธิ์หรือไม่ใช่ลิงก์ Drive) */
export async function deleteFileFromDriveIfExists(coverUrl: string): Promise<void> {
  const fileId = getDriveFileId(coverUrl);
  if (!fileId) return;
  try {
    const drive = getDriveClient();
    await drive.files.delete({
      fileId,
      supportsAllDrives: true,
    });
  } catch (e) {
    // 404 = ไฟล์ถูกลบไปแล้ว, 403 = ไม่มีสิทธิ์ (เช่น ไฟล์ใน My Drive ของ user)
    console.warn('Drive delete skipped:', e instanceof Error ? e.message : e);
  }
}

export async function uploadImageToDrive(
  base64Data: string,
  mimeType: string,
  fileName: string
): Promise<string> {
  if (!FOLDER_ID) throw new Error('GOOGLE_DRIVE_FOLDER_ID is required');
  const drive = getDriveClient();
  const buffer = Buffer.from(base64Data, 'base64');

  const res = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: fileName,
      parents: [FOLDER_ID],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id',
  });

  const fileId = res.data.id;
  if (!fileId) throw new Error('Upload failed');

  await drive.permissions.create({
    fileId,
    supportsAllDrives: true,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // ใช้ thumbnail URL เพื่อให้ <img> แสดงผลได้ (uc?export=view มัก redirect เป็น HTML)
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}
