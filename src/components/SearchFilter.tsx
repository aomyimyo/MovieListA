"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = { initialQuery?: string; sort?: 'recent' | 'release' };

const DEBOUNCE_MS = 300;

export default function SearchFilter({ initialQuery = '', sort }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const q = query.trim();
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (sort && sort !== 'recent') params.set('sort', sort);
      router.replace(params.toString() ? `/?${params}` : '/');
      timerRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, sort, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นจาก รหัส (ID) หรือ นักแสดง..."
        className="min-w-[250px] rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-500 transition-colors duration-200 focus:border-red-500 focus:outline-none"
        aria-label="ค้นหาจากรหัสหรือนักแสดง"
      />
      {query && (
        <Link
          href={sort === 'release' ? '/?sort=release' : '/'}
          className="rounded border border-white/20 px-4 py-2 text-sm text-gray-300 transition-colors duration-200 hover:bg-white/10"
        >
          ล้างตัวกรอง
        </Link>
      )}
    </div>
  );
}
