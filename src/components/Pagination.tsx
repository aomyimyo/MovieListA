'use client';

import Link from 'next/link';

const PER_PAGE = 12;

type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery?: string;
  sort?: 'recent' | 'release';
};

function pageUrl(page: number, searchQuery?: string, sort?: string) {
  const params = new URLSearchParams();
  if (searchQuery?.trim()) params.set('q', searchQuery.trim());
  if (sort && sort !== 'recent') params.set('sort', sort);
  if (page > 1) params.set('page', String(page));
  const s = params.toString();
  return s ? `/?${s}` : '/';
}

export default function Pagination({ currentPage, totalPages, totalItems, searchQuery, sort }: Props) {
  if (totalPages <= 1) return null;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const start = (currentPage - 1) * PER_PAGE + 1;
  const end = Math.min(currentPage * PER_PAGE, totalItems);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-6">
      <p className="w-full text-center text-sm text-gray-400 sm:w-auto">
        แสดง {start}–{end} จาก {totalItems} เรื่อง
      </p>
      <div className="flex items-center gap-2">
        {prevPage ? (
          <Link
            href={pageUrl(prevPage, searchQuery, sort)}
            className="rounded border border-white/20 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-white/10"
          >
            ← ก่อนหน้า
          </Link>
        ) : (
          <span className="rounded border border-white/10 px-4 py-2 text-sm text-gray-500">
            ← ก่อนหน้า
          </span>
        )}
        <span className="px-2 text-sm text-gray-400">
          หน้า {currentPage} / {totalPages}
        </span>
        {nextPage ? (
          <Link
            href={pageUrl(nextPage, searchQuery, sort)}
            className="rounded border border-white/20 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-white/10"
          >
            ถัดไป →
          </Link>
        ) : (
          <span className="rounded border border-white/10 px-4 py-2 text-sm text-gray-500">
            ถัดไป →
          </span>
        )}
      </div>
    </nav>
  );
}
