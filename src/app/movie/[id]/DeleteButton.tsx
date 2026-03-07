'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({
  movieId,
  movieCode,
}: {
  movieId: string;
  movieCode: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleDelete() {
    if (!confirm(`ลบ "${movieCode}" ใช่หรือไม่?`)) return;
    setLoading(true);
    fetch(`/api/movies/${movieId}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          router.push('/');
          // รอให้ไปหน้าแรกแล้วค่อยรีเฟรชให้รายการอัปเดต
          setTimeout(() => router.refresh(), 400);
        } else alert('ลบไม่สำเร็จ');
      })
      .catch(() => alert('เกิดข้อผิดพลาด'))
      .finally(() => setLoading(false));
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="relative z-10 cursor-pointer select-none rounded border border-red-500/50 px-4 py-2 text-sm text-red-400 transition-colors duration-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? 'กำลังลบ...' : 'ลบ'}
    </button>
  );
}
