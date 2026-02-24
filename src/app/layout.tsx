import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Movie List - เก็บหนังส่วนตัว',
  description: 'เว็บเก็บรายการหนังส่วนตัว',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-white/10 bg-black/40 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold text-white transition-colors duration-200 hover:text-red-500">
              🎬 Movie List
            </Link>
            <Link
              href="/add"
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700"
            >
              เพิ่มหนัง
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
