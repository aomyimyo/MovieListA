'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Movie } from '@/types/movie';
import { toImageUrl } from '@/lib/cover-image';

type Props = { movie?: Movie };

export default function MovieForm({ movie }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState(movie?.coverUrl ?? '');
  const [code, setCode] = useState(movie?.code ?? '');
  const [day, setDay] = useState(() => parseDatePart(movie?.date, 0));
  const [month, setMonth] = useState(() => parseDatePart(movie?.date, 1));
  const [year, setYear] = useState(() => parseDatePart(movie?.date, 2));
  const [actors, setActors] = useState(movie?.actors ?? '');
  const [genre, setGenre] = useState(movie?.genre ?? '');
  const [description, setDescription] = useState(movie?.description ?? '');
  const [uploading, setUploading] = useState(false);

  const isEdit = !!movie?.id;

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/upload-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          mimeType: file.type,
          fileName: file.name || `cover-${Date.now()}.${file.type.split('/')[1]}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) setCoverUrl(data.url);
      else alert(data.error || `อัปโหลดไม่สำเร็จ (${res.status})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'อัปโหลดรูปไม่สำเร็จ';
      alert(msg);
    } finally {
      setUploading(false);
    }
  }

  function getDateString() {
    const d = day.trim();
    const m = month.trim();
    const y = year.trim();
    if (!d && !m && !y) return '';
    const dd = d.padStart(2, '0');
    const mm = m.padStart(2, '0');
    const yy = y.length === 2 ? (parseInt(y, 10) < 50 ? `20${y}` : `19${y}`) : y;
    return `${dd}-${mm}-${yy}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { coverUrl, code, date: getDateString(), actors, genre, description };
      const url = isEdit ? `/api/movies/${movie.id}` : '/api/movies';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      }
      const data = await res.json();
      router.push(`/movie/${data.id}`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm text-gray-400">รูปปก</label>
        <div className="mt-1 flex items-center gap-4">
          {coverUrl && (
            <div className="h-24 w-16 overflow-hidden rounded border border-white/10 bg-gray-800">
              <img
                src={toImageUrl(coverUrl)}
                alt="Cover"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            disabled={uploading}
            className="block text-sm text-gray-400 file:mr-2 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1 file:text-white"
          />
          {uploading && <span className="text-sm text-gray-500">กำลังอัปโหลด...</span>}
        </div>
        <p className="mt-1 text-xs text-gray-500">หรือใส่ URL โดยตรงด้านล่าง (แก้ไขได้)</p>
        <input
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400">รหัส/ชื่อเรื่อง *</label>
        <input
          required
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="เช่น MV-001 หรือ ชื่อหนัง"
          className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400">วันวางจำหน่าย</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={day}
            onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="วัน"
            className="w-14 rounded border border-white/20 bg-white/5 px-3 py-2 text-center text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
            title="วัน (1-31)"
          />
          <span className="text-gray-500">-</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={month}
            onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="เดือน"
            className="w-14 rounded border border-white/20 bg-white/5 px-3 py-2 text-center text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
            title="เดือน (1-12)"
          />
          <span className="text-gray-500">-</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="ปี"
            className="w-16 rounded border border-white/20 bg-white/5 px-3 py-2 text-center text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
            title="ปี (พ.ศ. หรือ ค.ศ. เช่น 2567 หรือ 2024)"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">วัน-เดือน-ปี เช่น 15-07-2026 หรือ 15-7-26</p>
      </div>

      <div>
        <label className="block text-sm text-gray-400">นักแสดง</label>
        <input
          type="text"
          value={actors}
          onChange={(e) => setActors(e.target.value)}
          placeholder="ชื่อนักแสดง"
          className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400">ประเภท</label>
        <input
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="เช่น แอคชัน, ดราม่า"
          className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400">เรื่องย่อ</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="คำอธิบายหนัง"
          className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-red-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหนัง'}
      </button>
    </form>
  );
}

/** ดึงส่วนของวันที่ (0=วัน, 1=เดือน, 2=ปี) จากสตริง เช่น 15-07-2026 */
function parseDatePart(dateStr: string | undefined, index: 0 | 1 | 2): string {
  if (!dateStr?.trim()) return '';
  const parts = dateStr.trim().split('-');
  const p = parts[index];
  return p ? p.replace(/^0+/, '') || parts[index]! : ''; // เอา 0 นำหน้าออกเวลาแสดง (07 -> 7)
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64 ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
