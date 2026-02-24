import { NextResponse } from 'next/server';
import { getAllMovies, createMovie } from '@/lib/sheets-movies';
import type { Movie } from '@/types/movie';

export async function GET() {
  try {
    const movies = await getAllMovies();
    return NextResponse.json(movies);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Movie>;
    const code = (body.code ?? '').toString().trim();
    if (!code) {
      return NextResponse.json(
        { error: 'รหัส/ชื่อเรื่อง (code) ต้องไม่ว่าง' },
        { status: 400 }
      );
    }
    const movie = await createMovie({
      coverUrl: body.coverUrl ?? '',
      code,
      date: body.date ?? '',
      actors: body.actors ?? '',
      genre: body.genre ?? '',
      description: body.description ?? '',
    });
    return NextResponse.json(movie, { status: 201 });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : 'Failed to create movie';
    const status = msg.includes('มีอยู่แล้ว') ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
