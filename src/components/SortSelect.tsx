'use client';

import { useRouter } from 'next/navigation';

type SortType = 'recent' | 'release';

type Props = { currentSort: SortType; searchQuery?: string };

export default function SortSelect({ currentSort, searchQuery }: Props) {
  const router = useRouter();

  function goTo(sort: SortType) {
    const params = new URLSearchParams();
    if (searchQuery?.trim()) params.set('q', searchQuery.trim());
    params.set('sort', sort);
    router.replace(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-400">เรียงตาม:</span>
      <button
        type="button"
        onClick={() => goTo('recent')}
        className={`rounded px-3 py-1.5 text-sm transition-colors duration-200 ${
          currentSort === 'recent'
            ? 'bg-red-600 text-white'
            : 'border border-white/20 text-gray-300 hover:bg-white/10'
        }`}
      >
        Recent update
      </button>
      <button
        type="button"
        onClick={() => goTo('release')}
        className={`rounded px-3 py-1.5 text-sm transition-colors duration-200 ${
          currentSort === 'release'
            ? 'bg-red-600 text-white'
            : 'border border-white/20 text-gray-300 hover:bg-white/10'
        }`}
      >
        Release date
      </button>
    </div>
  );
}
