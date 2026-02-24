import { google } from 'googleapis';

const SHEET_NAME = 'movies';
const HEADERS = ['id', 'coverUrl', 'code', 'Release date', 'actors', 'genre', 'description'];

function parseServiceAccountJson(raw: string) {
  const trimmed = raw.trim();
  const tryParse = (text: string) => {
    return JSON.parse(text) as unknown;
  };

  // 1) Raw JSON object string: {"type":"service_account",...}
  // 2) Base64-encoded JSON (Vercel: paste base64 as value, or value may be wrapped in quotes)
  // 3) Wrapped JSON string (some platforms store as quoted string)
  let parsed: unknown;

  try {
    parsed = tryParse(trimmed);
  } catch {
    // Not valid JSON – try base64 (strip whitespace in case env added newlines)
    try {
      const b64 = trimmed.replace(/\s/g, '');
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      parsed = tryParse(decoded.trim());
    } catch {
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON');
    }
  }

  if (typeof parsed === 'string') {
    // Value was e.g. quoted in Vercel – content might be base64 or JSON
    try {
      const inner = parsed.trim();
      if (inner.startsWith('{')) {
        parsed = tryParse(inner);
      } else {
        const decoded = Buffer.from(inner.replace(/\s/g, ''), 'base64').toString('utf8');
        parsed = tryParse(decoded.trim());
      }
    } catch {
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON');
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON');
  }

  const key = parsed as Record<string, unknown>;
  const privateKey = key.private_key;
  if (typeof privateKey === 'string') {
    // Vercel/env UIs sometimes double-escape newlines ("\\n") or strip them; OpenSSL needs real newlines.
    let pem = privateKey.replace(/\\n/g, '\n');
    // If there are still no newlines between BEGIN and END, PEM is one line and decoder fails. Restore line breaks.
    if (pem.includes('-----BEGIN') && !pem.includes('\n') && pem.length > 80) {
      pem = pem
        .replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
        .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----\n');
      const beginEnd = pem.indexOf('-----END PRIVATE KEY-----');
      const beginStart = pem.indexOf('-----BEGIN PRIVATE KEY-----') + 28;
      const base64 = pem.slice(beginStart, beginEnd).replace(/\s/g, '');
      const lines = base64.match(/.{1,64}/g) ?? [];
      key.private_key =
        '-----BEGIN PRIVATE KEY-----\n' + lines.join('\n') + '\n-----END PRIVATE KEY-----\n';
    } else {
      key.private_key = pem;
    }
  }

  return key;
}

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      const key = parseServiceAccountJson(raw);
      return new google.auth.GoogleAuth({
        credentials: key,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });
    } catch {
      throw new Error(
        'Invalid GOOGLE_SERVICE_ACCOUNT_JSON (ensure it is valid JSON and private_key newlines are preserved)'
      );
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
