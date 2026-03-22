"use client";

import { useEffect, useState, use } from "react";

interface Profile {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  memberSince: string;
  settings: {
    showPnl: boolean;
    showPositions: boolean;
    showDeposits: boolean;
    showPayouts: boolean;
  };
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

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/users/${id}/profile`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setProfile)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-zinc-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">
          Trader Not Found
        </h2>
        <p className="text-zinc-500 text-sm">
          This profile does not exist or has been removed.
        </p>
      </div>
    );

  if (!profile)
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800" />
            <div className="space-y-2">
              <div className="w-40 h-6 bg-zinc-800 rounded-lg" />
              <div className="w-28 h-4 bg-zinc-800/50 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-zinc-900/50 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );

  const totalRealized = profile.accounts.reduce(
    (s, a) => s + (a.realizedPnl || 0),
    0
  );
  const totalUnrealized = profile.accounts.reduce(
    (s, a) => s + (a.unrealizedPnl || 0),
    0
  );
  const totalEquity = profile.accounts.reduce(
    (s, a) => s + (a.equity || 0),
    0
  );
  const totalDeposits = profile.accounts.reduce(
    (s, a) => s + (a.totalDeposits || 0),
    0
  );
  const avgRoi =
    profile.accounts.length > 0
      ? profile.accounts.reduce((s, a) => s + (a.roi || 0), 0) /
        profile.accounts.length
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-8">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-700"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-400">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {profile.displayName}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Member since{" "}
            {new Date(profile.memberSince).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-400">
              {profile.accounts.length} Account
              {profile.accounts.length !== 1 ? "s" : ""}
            </span>
            {profile.settings.showPnl && (
              <span className="px-2 py-0.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-xs text-blue-400">
                PNL Visible
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {profile.settings.showPnl && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Realized PNL"
            value={`$${Math.abs(totalRealized).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}`}
            prefix={totalRealized >= 0 ? "+" : "-"}
            colored
            positive={totalRealized >= 0}
          />
          <StatCard
            label="ROI"
            value={`${Math.abs(avgRoi).toFixed(2)}%`}
            prefix={avgRoi >= 0 ? "+" : "-"}
            colored
            positive={avgRoi >= 0}
          />
          <StatCard
            label="Total Equity"
            value={`$${totalEquity.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}`}
          />
          <StatCard
            label="Unrealized PNL"
            value={`$${Math.abs(totalUnrealized).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}`}
            prefix={totalUnrealized >= 0 ? "+" : "-"}
            colored
            positive={totalUnrealized >= 0}
          />
        </div>
      )}

      {/* Accounts list */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Accounts</h2>
        <div className="space-y-3">
          {profile.accounts.map((a) => (
            <div
              key={a.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200 text-sm">
                      {a.login}@{a.server}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {a.broker || "Unknown broker"}
                    </p>
                  </div>
                </div>

                {profile.settings.showPnl &&
                  a.realizedPnl !== undefined && (
                    <div className="flex items-center gap-5">
                      {a.equity !== undefined && (
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-500 uppercase">
                            Equity
                          </p>
                          <p className="font-mono text-sm text-zinc-300">
                            $
                            {a.equity.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase">
                          PNL
                        </p>
                        <p
                          className={`font-mono text-sm font-medium ${
                            a.realizedPnl >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {a.realizedPnl >= 0 ? "+" : ""}$
                          {Math.abs(a.realizedPnl).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      {a.roi !== undefined && (
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-500 uppercase">
                            ROI
                          </p>
                          <p
                            className={`font-mono text-sm font-medium ${
                              a.roi >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {a.roi >= 0 ? "+" : ""}
                            {a.roi.toFixed(2)}%
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))}
          {profile.accounts.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-500 text-sm">
                This trader has not linked any accounts yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Deposits/Withdrawals if shared */}
      {profile.settings.showDeposits && totalDeposits > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-3">Financial Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Deposits</p>
              <p className="text-xl font-mono font-bold text-zinc-200">
                ${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            {profile.settings.showPayouts && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Withdrawals</p>
                <p className="text-xl font-mono font-bold text-zinc-200">
                  ${profile.accounts.reduce((s, a) => s + (a.totalWithdrawals || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  prefix = "",
  colored = false,
  positive = true,
}: {
  label: string;
  value: string;
  prefix?: string;
  colored?: boolean;
  positive?: boolean;
}) {
  let colorClass = "text-white";
  if (colored) {
    colorClass = positive ? "text-green-400" : "text-red-400";
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={`text-xl font-bold font-mono ${colorClass}`}>
        {prefix}
        {value}
      </p>
    </div>
  );
}
