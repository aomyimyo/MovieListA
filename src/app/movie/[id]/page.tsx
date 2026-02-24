import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMovieById } from '@/lib/sheets-movies';
import { toImageUrl } from '@/lib/cover-image';
import DeleteButton from './DeleteButton';

export const dynamic = 'force-dynamic';

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovieById(id);
  if (!movie) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-8">
        <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-gray-800 aspect-video">
          {movie.coverUrl ? (
            <img
              src={toImageUrl(movie.coverUrl)}
              alt={movie.code}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-gray-600">
              🎬
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">{movie.code}</h1>
          {movie.date && (
            <p className="mt-1 text-gray-400">Release date: {movie.date}</p>
          )}
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
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/movie/${id}/edit`}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700"
            >
              แก้ไข
            </Link>
            <DeleteButton movieId={id} movieCode={movie.code} />
            <Link
              href="/"
              className="rounded border border-white/20 px-4 py-2 text-sm text-gray-300 transition-colors duration-200 hover:bg-white/10"
            >
              กลับ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
