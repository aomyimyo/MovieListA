import nextDynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMovieById } from '@/lib/sheets-movies';

const MovieForm = nextDynamic(() => import('@/components/MovieForm'), { ssr: false });

export const dynamic = 'force-dynamic';

export default async function EditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovieById(id);
  if (!movie) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">แก้ไขหนัง</h1>
      <p className="mt-1 text-gray-400">ID: {id}</p>
      <MovieForm movie={movie} />
      <Link
        href={`/movie/${id}`}
        className="mt-4 inline-block text-gray-400 transition-colors duration-200 hover:text-white"
      >
        ← กลับไปหน้ารายละเอียด
      </Link>
    </div>
  );
}
