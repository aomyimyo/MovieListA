# Movie List - เก็บหนังส่วนตัว

Next.js 14 (App Router) + TypeScript + Tailwind CSS  
ใช้ Google Sheets เป็นฐานข้อมูล และ Google Drive เก็บรูปปก

## วิธีติดตั้งและรัน

```bash
npm install
cp .env.example .env.local
# แก้ไข .env.local ให้ครบ
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## ตั้งค่า Google

### 1. สร้าง Service Account

1. ไป [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจกต์ (หรือใช้โปรเจกต์เดิม)
3. เปิด **APIs & Services** > **Library** → เปิดใช้ **Google Sheets API** และ **Google Drive API**
4. ไป **Credentials** > **Create credentials** > **Service account**
5. สร้างเสร็จแล้วเข้าไปที่ Service account > **Keys** > **Add key** > **Create new key** (JSON) แล้วดาวน์โหลด

### 2. Google Sheets

1. สร้าง [Google Sheet](https://sheets.google.com) ใหม่
2. คัดลอก **Sheet ID** จาก URL: `https://docs.google.com/spreadsheets/d/**SHEET_ID**/edit`
3. **แชร์ Sheet** กับอีเมล Service Account (รูปแบบ `xxx@yyy.iam.gserviceaccount.com`) โดยให้สิทธิ์ **Editor**

แอปจะสร้างชีตชื่อ `movies` และคอลัมน์ `id, coverUrl, code, date, actors, genre, description` ให้อัตโนมัติเมื่อมีคำขอแรก

### 3. Google Drive (เก็บรูปปก)

1. สร้างโฟลเดอร์ใน Google Drive
2. เปิดโฟลเดอร์ แล้วคัดลอก **Folder ID** จาก URL: `https://drive.google.com/drive/folders/**FOLDER_ID**`
3. **แชร์โฟลเดอร์** กับอีเมล Service Account โดยให้สิทธิ์ **Editor**

#### สำคัญ: ข้อจำกัดของ Service Account กับ Google Drive

- **บัญชี Google แบบส่วนตัว (My Drive ปกติ)**: มักจะอัปโหลดด้วย Service Account ไม่ได้ และจะเจอ error ประมาณ `Service Accounts do not have storage quota` (403)
- วิธีที่ถูกต้องเพื่อให้อัปโหลดได้คือ:
  - ใช้ **Google Workspace** แล้วสร้าง **Shared Drive** (Team Drive) และสร้างโฟลเดอร์ใน Shared Drive นั้น
  - เพิ่ม Service Account เป็นสมาชิกของ Shared Drive (สิทธิ์อย่างน้อย Contributor/Content manager)
  - ใช้ Folder ID ของโฟลเดอร์ใน Shared Drive มาใส่ใน `GOOGLE_DRIVE_FOLDER_ID`

### 4. Cloudinary (แนะนำสำหรับบัญชี @gmail.com)

ถ้าคุณใช้ Gmail ส่วนตัว การอัปโหลดรูปด้วย Service Account ไป Google Drive มักทำไม่ได้ (ไม่มี storage quota)  
ให้ใช้ Cloudinary เก็บรูปแทน โดยระบบจะอัปโหลดผ่าน `/api/upload-cover` อัตโนมัติเมื่อมี env ของ Cloudinary ครบ

1. สมัคร Cloudinary (ล็อกอินด้วย Google หรือ GitHub ก็ได้)
2. ไปที่ Dashboard แล้วเอาค่าเหล่านี้มาใส่ใน `.env.local` / Vercel:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Environment Variables

| ตัวแปร | คำอธิบาย |
|--------|----------|
| `GOOGLE_APPLICATION_CREDENTIALS` | path ไปยังไฟล์ JSON ของ Service Account (ใช้ในเครื่อง) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | เนื้อหา JSON ของ Service Account ทั้งก้อนเป็น string (ใช้บน Vercel) |
| `GOOGLE_SHEET_ID` | ID ของ Google Sheet |
| `GOOGLE_DRIVE_FOLDER_ID` | ID ของโฟลเดอร์ Drive สำหรับรูปปก |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (ใช้เก็บรูป) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

- **รันในเครื่อง**: ใส่ `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json` และวางไฟล์ JSON ไว้ที่ `service-account.json` (ไฟล์นี้ห้าม commit)
- **Vercel**: ใส่ `GOOGLE_SERVICE_ACCOUNT_JSON` เป็นค่าทั้งก้อนของ JSON (ใน Vercel Dashboard > Project > Settings > Environment Variables)
- **Cloudinary**: ถ้าใส่ `CLOUDINARY_*` ครบ ระบบจะอัปโหลดรูปขึ้น Cloudinary (แนะนำสำหรับ @gmail.com)

## Deploy บน Vercel

1. Push โค้ดขึ้น GitHub
2. ไป [Vercel](https://vercel.com) > Import project จาก repo
3. ตั้งค่า Environment Variables ตามด้านบน (ใช้ `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SHEET_ID`, `GOOGLE_DRIVE_FOLDER_ID`)
4. Deploy

## โครงสร้าง Database (Sheet: movies)

| id | coverUrl | code | date | actors | genre | description |
|----|----------|------|------|--------|-------|-------------|
| UUID | URL รูปจาก Drive | รหัส/ชื่อเรื่อง | วันที่ | นักแสดง | ประเภท | เรื่องย่อ |

## หน้าที่มี

- **/** – หน้าแรก แสดง grid หนังทั้งหมด
- **/add** – เพิ่มหนัง
- **/movie/[id]** – หน้ารายละเอียดตาม id
- **/movie/[id]/edit** – แก้ไขหนัง

API: `GET/POST /api/movies`, `GET/PUT/DELETE /api/movies/[id]`, `POST /api/upload-cover`
