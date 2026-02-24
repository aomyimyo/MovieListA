'use client';

import { useState } from 'react';
import type { Movie } from '@/types/movie';
import { toImageUrl } from '@/lib/cover-image';
import MovieLightbox from './MovieLightbox';

type Props = { movies: Movie[] };

export default function MovieGridWithLightbox({ movies }: Props) {
  const [selected, setSelected] = useState<Movie | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 gap-6 max-md:grid-cols-2">
        {movies.map((movie) => (
          <button
            key={movie.id}
            type="button"
            onClick={() => setSelected(movie)}
            className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition-all duration-300 ease-out hover:border-red-500/50 hover:bg-white/10 hover:scale-[1.02]"
          >
            <div className="aspect-video w-full overflow-hidden bg-gray-800">
              {movie.coverUrl ? (
                <img
                  src={toImageUrl(movie.coverUrl)}
                  alt={movie.code}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-gray-600">
                  🎬
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-white truncate">{movie.code}</p>
              <p className="text-sm text-gray-400 truncate">{movie.actors}</p>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <MovieLightbox movie={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
