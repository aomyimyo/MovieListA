'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { Movie } from '@/types/movie';
import { toImageUrl } from '@/lib/cover-image';

type Props = { movie: Movie; onClose: () => void };

const CLOSE_DURATION = 200;

export default function MovieLightbox({ movie, onClose }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [closing, setClosing] = useState(false);

  const doClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, CLOSE_DURATION);
  }, [onClose]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') doClose();
    }
    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [doClose]);

  async function handleDelete() {
    if (!confirm(`ลบ "${movie.code}" ใช่หรือไม่?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/movies/${movie.id}`, { method: 'DELETE' });
      if (res.ok) {
        doClose();
        router.refresh();
      } else alert('ลบไม่สำเร็จ');
    } catch {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
      role="dialog"
      aria-modal="true"
      aria-label="รายละเอียดหนัง"
      onClick={(e) => e.target === e.currentTarget && doClose()}
    >
      <div
        className={`relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-gray-900 shadow-xl ${closing ? 'animate-scale-out' : 'animate-scale-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={doClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white transition-colors duration-200 hover:bg-black/80"
          aria-label="ปิด"
        >
          ✕
        </button>
        <div className="aspect-video w-full overflow-hidden bg-gray-800">
          {movie.coverUrl ? (
            <img
              src={toImageUrl(movie.coverUrl)}
              alt={movie.code}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-gray-600">🎬</div>
          )}
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">{movie.code}</h2>
          {movie.date && <p className="mt-1 text-gray-400">วันที่: {movie.date}</p>}
          {movie.genre && (
            <p className="mt-2">
              <span className="text-gray-500">ประเภท:</span>{' '}
              <span className="text-white">{movie.genre}</span>
            </p>
          )}
          {movie.actors && (
            <p className="mt-2">
              <span className="text-gray-500">นักแสดง:</span>{' '}
              <span className="text-white">{movie.actors}</span>
            </p>
          )}
          {movie.description && (
            <div className="mt-4">
              <p className="text-gray-500">เรื่องย่อ</p>
              <p className="mt-1 whitespace-pre-wrap text-gray-300">{movie.description}</p>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/movie/${movie.id}/edit`}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700"
            >
              แก้ไข
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded border border-red-500/50 px-4 py-2 text-sm text-red-400 transition-colors duration-200 hover:bg-red-500/10 disabled:opacity-50"
            >
              {deleting ? 'กำลังลบ...' : 'ลบ'}
            </button>
            <button
              type="button"
              onClick={doClose}
              className="rounded border border-white/20 px-4 py-2 text-sm text-gray-300 transition-colors duration-200 hover:bg-white/10"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
