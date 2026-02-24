import nextDynamic from 'next/dynamic';
import Link from 'next/link';

const MovieForm = nextDynamic(() => import('@/components/MovieForm'), { ssr: false });

export const dynamic = 'force-dynamic';

export default function AddMoviePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">เพิ่มหนัง</h1>
      <MovieForm />
      <Link
        href="/"
        className="mt-4 inline-block text-gray-400 transition-colors duration-200 hover:text-white"
      >
        ← กลับหน้าหลัก
      </Link>
    </div>
  );
}
