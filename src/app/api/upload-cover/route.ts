import { NextResponse } from 'next/server';
import { uploadImageToCloudinary, isCloudinaryEnabled } from '@/lib/cloudinary-upload';
import { uploadImageToDrive } from '@/lib/drive-upload';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { base64, mimeType, fileName } = body as {
      base64?: string;
      mimeType?: string;
      fileName?: string;
    };
    if (!base64 || !mimeType || !fileName) {
      return NextResponse.json(
        { error: 'base64, mimeType, fileName required' },
        { status: 400 }
      );
    }

    // Prefer Cloudinary (works with @gmail.com accounts)
    const url = isCloudinaryEnabled()
      ? await uploadImageToCloudinary({ base64, mimeType, fileName })
      : await uploadImageToDrive(base64, mimeType, fileName);

    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    // ดึงข้อความ error ที่อ่านง่ายให้ frontend
    const msg =
      e && typeof e === 'object' && 'errors' in e
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((e as any).errors?.[0]?.message as string | undefined)
        : undefined;
    return NextResponse.json(
      { error: msg || (e instanceof Error ? e.message : 'Upload failed') },
      { status: 500 }
    );
  }
}
