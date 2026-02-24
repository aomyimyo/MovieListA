import { getSheetsClient, ensureSheetHeaders, SHEET_NAME } from './google';
import type { Movie } from '@/types/movie';

function rowToMovie(row: string[]): Movie {
  return {
    id: row[0] ?? '',
    coverUrl: row[1] ?? '',
    code: row[2] ?? '',
    date: row[3] ?? '',
    actors: row[4] ?? '',
    genre: row[5] ?? '',
    description: row[6] ?? '',
  };
}

export async function getAllMovies(): Promise<Movie[]> {
  await ensureSheetHeaders();
  const { sheets, sheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A2:G`,
  });
  const rows = res.data.values ?? [];
  const list = rows.map((row) => rowToMovie(row)).filter((m) => m.id);
  return list.reverse(); // แสดงเรื่องที่เพิ่มล่าสุดก่อน
}

export async function getMovieById(id: string): Promise<Movie | null> {
  const all = await getAllMovies();
  return all.find((m) => m.id === id) ?? null;
}

export async function createMovie(movie: Omit<Movie, 'id'> & { id?: string }): Promise<Movie> {
  const code = (movie.code ?? '').trim();
  if (!code) throw new Error('รหัส/ชื่อเรื่อง (code) ต้องไม่ว่าง');
  const id = code;
  const existing = await getMovieById(id);
  if (existing) throw new Error('รหัสนี้มีอยู่แล้ว กรุณาใช้รหัสอื่น');
  const row = [
    id,
    movie.coverUrl ?? '',
    code,
    movie.date ?? '',
    movie.actors ?? '',
    movie.genre ?? '',
    movie.description ?? '',
  ];
  await ensureSheetHeaders();
  const { sheets, sheetId } = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A:G`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
  return { ...movie, id, code };
}

export async function updateMovie(id: string, movie: Partial<Movie>): Promise<Movie | null> {
  const all = await getAllMovies();
  const index = all.findIndex((m) => m.id === id);
  if (index < 0) return null;
  const newCode = (movie.code ?? all[index].code ?? '').trim();
  const newId = newCode || id;
  if (newCode && newId !== id) {
    const exists = await getMovieById(newId);
    if (exists) throw new Error('รหัสนี้มีอยู่แล้ว กรุณาใช้รหัสอื่น');
  }
  const updated: Movie = { ...all[index], ...movie, id: newId, code: newCode || all[index].code };
  const row = [
    updated.id,
    updated.coverUrl,
    updated.code,
    updated.date,
    updated.actors,
    updated.genre,
    updated.description,
  ];
  const { sheets, sheetId } = getSheetsClient();
  const range = `${SHEET_NAME}!A${index + 2}:G${index + 2}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
  return updated;
}

export async function deleteMovie(id: string): Promise<boolean> {
  const all = await getAllMovies();
  const index = all.findIndex((m) => m.id === id);
  if (index < 0) return false;
  const { sheets, sheetId } = getSheetsClient();
  const sheetRes = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheet = sheetRes.data.sheets?.find((s) => s.properties?.title === SHEET_NAME);
  const sheetIdNum = sheet?.properties?.sheetId;
  if (sheetIdNum === undefined) return false;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetIdNum,
              dimension: 'ROWS',
              startIndex: index + 1,
              endIndex: index + 2,
            },
          },
        },
      ],
    },
  });
  return true;
}
