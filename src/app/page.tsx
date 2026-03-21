import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-20 space-y-6">
      <h1 className="text-4xl font-bold">MT5 Trading Leaderboard</h1>
      <p className="text-zinc-400 text-lg max-w-xl mx-auto">
        Track your MetaTrader 5 trading performance, compare with other traders,
        and climb the leaderboard.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/leaderboard"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          View Leaderboard
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium border border-zinc-700"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
