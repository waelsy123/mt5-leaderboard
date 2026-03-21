import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MT5 Trading Leaderboard",
  description: "Track and compare MT5 trading performance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <nav className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
          <a href="/" className="text-lg font-bold text-white">MT5 Leaderboard</a>
          <div className="flex items-center gap-4 text-sm">
            <a href="/leaderboard" className="text-zinc-400 hover:text-white">Leaderboard</a>
            <a href="/dashboard" className="text-zinc-400 hover:text-white">Dashboard</a>
            <a href="/settings" className="text-zinc-400 hover:text-white">Settings</a>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
