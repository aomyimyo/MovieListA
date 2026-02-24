/** ดึง File ID จาก Google Drive URL หลายรูปแบบ (export สำหรับใช้ลบไฟล์) */
export function getDriveFileId(url: string): string | null {
  if (!url?.includes('drive.google.com')) return null;
  // รูปแบบ ?id=xxx หรือ &id=xxx
  let m = url.match(/[?&]id=([^&]+)/);
  if (m) return m[1];
  // รูปแบบ /file/d/FILE_ID/view หรือ /open?id=...
  m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/\/uc\?.*id=([^&]+)/);
  if (m) return m[1];
  return null;
}

/** แปลง URL จาก Google Drive ให้ใช้กับ <img> ได้ (thumbnail แสดงผลได้) */
export function toImageUrl(url: string): string {
  const id = getDriveFileId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w800` : url;
}
