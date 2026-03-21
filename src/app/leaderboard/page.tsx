"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Entry {
  rank: number;
  userId: string;
  displayName: string;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalEquity: number;
  roi: number;
  accountCount: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sort, setSort] = useState("realizedPnl");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?sort=${sort}&limit=50`)
      .then((r) => r.json())
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [sort]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white"
        >
          <option value="realizedPnl">Realized PNL</option>
          <option value="roi">ROI %</option>
          <option value="totalEquity">Equity</option>
        </select>
      </div>

      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-zinc-500">No traders on the leaderboard yet. Be the first to share your PNL!</p>
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Trader</th>
                <th className="px-4 py-3 text-right">Realized PNL</th>
                <th className="px-4 py-3 text-right">Unrealized</th>
                <th className="px-4 py-3 text-right">ROI</th>
                <th className="px-4 py-3 text-right">Equity</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.userId} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-mono text-zinc-500">{e.rank}</td>
                  <td className="px-4 py-3">
                    <Link href={`/u/${e.userId}`} className="text-blue-400 hover:underline font-medium">
                      {e.displayName}
                    </Link>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${e.totalRealizedPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${e.totalRealizedPnl.toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${e.totalUnrealizedPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${e.totalUnrealizedPnl.toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${e.roi >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {e.roi.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-300">
                    ${e.totalEquity.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
