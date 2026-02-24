import { NextResponse } from 'next/server';
import { deleteImageFromCloudinaryIfExists } from '@/lib/cloudinary-upload';
import { deleteFileFromDriveIfExists } from '@/lib/drive-upload';
import { getMovieById, updateMovie, deleteMovie } from '@/lib/sheets-movies';
import type { Movie } from '@/types/movie';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movie = await getMovieById(id);
    if (!movie) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(movie);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<Movie>;
    const movie = await updateMovie(id, body);
    if (!movie) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(movie);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : 'Failed to update movie';
    const status = msg.includes('มีอยู่แล้ว') ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movie = await getMovieById(id);
    if (movie?.coverUrl) {
      await deleteImageFromCloudinaryIfExists(movie.coverUrl);
      await deleteFileFromDriveIfExists(movie.coverUrl);
    }
    const ok = await deleteMovie(id);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to delete movie' },
      { status: 500 }
    );
  }
}
