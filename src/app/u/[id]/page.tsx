"use client";

import { useEffect, useState, use } from "react";

interface Profile {
  id: string;
  displayName: string;
  memberSince: string;
  settings: { showPnl: boolean; showPositions: boolean; showDeposits: boolean; showPayouts: boolean };
  accounts: Array<{
    id: string;
    server: string;
    login: string;
    broker: string | null;
    balance?: number;
    equity?: number;
    realizedPnl?: number;
    unrealizedPnl?: number;
    totalDeposits?: number;
    totalWithdrawals?: number;
    roi?: number;
  }>;
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/users/${id}/profile`)
      .then((r) => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(setProfile)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!profile) return <p className="text-zinc-500">Loading...</p>;

  const totalRealized = profile.accounts.reduce((s, a) => s + (a.realizedPnl || 0), 0);
  const totalEquity = profile.accounts.reduce((s, a) => s + (a.equity || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{profile.displayName}</h1>
        <p className="text-zinc-500 text-sm">Member since {new Date(profile.memberSince).toLocaleDateString()}</p>
      </div>

      {profile.settings.showPnl && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-500 text-xs uppercase">Realized PNL</p>
            <p className={`text-xl font-mono mt-1 ${totalRealized >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${totalRealized.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-500 text-xs uppercase">Equity</p>
            <p className="text-xl font-mono mt-1">${totalEquity.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-500 text-xs uppercase">Accounts</p>
            <p className="text-xl font-mono mt-1">{profile.accounts.length}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Accounts</h2>
        {profile.accounts.map((a) => (
          <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{a.login}@{a.server}</p>
              <p className="text-zinc-500 text-sm">{a.broker || ""}</p>
            </div>
            {profile.settings.showPnl && a.realizedPnl !== undefined && (
              <div className="text-right">
                <p className={`font-mono ${a.realizedPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ${a.realizedPnl.toLocaleString()}
                </p>
                {a.roi !== undefined && (
                  <p className="text-zinc-500 text-xs">ROI: {a.roi.toFixed(1)}%</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
