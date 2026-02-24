import { google } from 'googleapis';

const SHEET_NAME = 'movies';
const HEADERS = ['id', 'coverUrl', 'code', 'Release date', 'actors', 'genre', 'description'];

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      const key = JSON.parse(raw);
      return new google.auth.GoogleAuth({
        credentials: key,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });
    } catch {
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON');
    }
  }
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (path) {
    return new google.auth.GoogleAuth({
      keyFile: path,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });
  }
  throw new Error('Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS');
}

export function getSheetsClient() {
  const auth = getAuth();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID is required');
  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, sheetId };
}

export function getDriveClient() {
  const auth = getAuth();
  return google.drive({ version: 'v3', auth });
}

export async function ensureSheetHeaders() {
  const { sheets, sheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheet = res.data.sheets?.find(
    (s) => s.properties?.title?.toLowerCase() === SHEET_NAME.toLowerCase()
  );
  if (!sheet) {
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: SHEET_NAME },
              },
            },
          ],
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('already exists')) throw err;
    }
  }
  const range = `${SHEET_NAME}!A1:G1`;
  const read = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  const existing = read.data.values?.[0] ?? [];
  if (existing.join(',') !== HEADERS.join(',')) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }
}

export { SHEET_NAME, HEADERS };
