import Link from 'next/link';
import { getAllMovies } from '@/lib/sheets-movies';
import Pagination from '@/components/Pagination';
import SearchFilter from '@/components/SearchFilter';
import SortSelect from '@/components/SortSelect';
import MovieGridWithLightbox from '@/components/MovieGridWithLightbox';

export const dynamic = 'force-dynamic';

const PER_PAGE = 12; // 4 คอลัมน์ x 3 แถว

type SortType = 'recent' | 'release';

/** แปลงสตริงวัน-เดือน-ปี เป็นตัวเลขสำหรับเรียง (ปี*10000+เดือน*100+วัน, ว่าง=0) */
function parseDateToSortKey(dateStr: string): number {
  if (!dateStr?.trim()) return 0;
  const parts = dateStr.trim().split('-');
  if (parts.length < 3) return 0;
  const day = parseInt(parts[0]!, 10) || 0;
  const month = parseInt(parts[1]!, 10) || 0;
  let year = parseInt(parts[2]!, 10) || 0;
  if (year < 100) year += year < 50 ? 2000 : 1900;
  return year * 10000 + month * 100 + day;
}

type PageProps = { searchParams?: { page?: string; q?: string; sort?: string } };

export default async function HomePage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams?.page ?? '1', 10) || 1);
  const q = (searchParams?.q ?? '').trim();
  const sort: SortType = searchParams?.sort === 'release' ? 'release' : 'recent';

  let movies: Awaited<ReturnType<typeof getAllMovies>> = [];
  let error = '';
  try {
    movies = await getAllMovies();
  } catch (e) {
    error = e instanceof Error ? e.message : 'โหลดรายการไม่สำเร็จ';
  }

  if (q) {
    const lower = q.toLowerCase();
    movies = movies.filter(
      (m) =>
        (m.id && m.id.toLowerCase().includes(lower)) ||
        (m.actors && m.actors.toLowerCase().includes(lower))
    );
  }

  if (sort === 'release') {
    movies = [...movies].sort((a, b) => parseDateToSortKey(b.date) - parseDateToSortKey(a.date));
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 text-center text-red-400">
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-400">ตรวจสอบ Environment Variables และ Google Sheet</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-gray-400">ยังไม่มีรายการหนัง</p>
        <Link
          href="/add"
          className="mt-4 inline-block rounded bg-red-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-700"
        >
          เพิ่มหนังเรื่องแรก
        </Link>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(movies.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageMovies = movies.slice(start, start + PER_PAGE);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <SearchFilter initialQuery={q} sort={sort} />
        <SortSelect currentSort={sort} searchQuery={q || undefined} />
      </div>
      {movies.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-gray-400">
          ไม่พบรายการที่ตรงกับ &quot;{q}&quot;
        </p>
      ) : (
      <MovieGridWithLightbox movies={pageMovies} />
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={movies.length}
        searchQuery={q || undefined}
        sort={sort}
      />
    </>
  );
}
