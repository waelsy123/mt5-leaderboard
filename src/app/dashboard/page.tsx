"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Account {
  id: string;
  server: string;
  login: string;
  broker: string | null;
  balance: number;
  equity: number;
  realizedPnl: number;
  unrealizedPnl: number;
  roi: number;
  lastSyncedAt: string | null;
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkForm, setLinkForm] = useState({ server: "", login: "" });
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState("");

  async function fetchAccounts() {
    const res = await fetch("/api/me/accounts");
    if (res.ok) setAccounts(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAccounts(); }, []);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLinking(true);
    try {
      const res = await fetch("/api/me/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setLinkForm({ server: "", login: "" });
      fetchAccounts();
    } catch { setError("Network error"); }
    finally { setLinking(false); }
  }

  async function handleUnlink(id: string) {
    if (!confirm("Unlink this account?")) return;
    await fetch(`/api/me/accounts/${id}`, { method: "DELETE" });
    fetchAccounts();
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalEquity = accounts.reduce((s, a) => s + a.equity, 0);
  const totalRealized = accounts.reduce((s, a) => s + a.realizedPnl, 0);
  const totalUnrealized = accounts.reduce((s, a) => s + a.unrealizedPnl, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-xs uppercase">Balance</p>
          <p className="text-xl font-mono mt-1">${totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-xs uppercase">Equity</p>
          <p className="text-xl font-mono mt-1">${totalEquity.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-xs uppercase">Realized PNL</p>
          <p className={`text-xl font-mono mt-1 ${totalRealized >= 0 ? "text-green-400" : "text-red-400"}`}>
            ${totalRealized.toLocaleString()}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500 text-xs uppercase">Unrealized</p>
          <p className={`text-xl font-mono mt-1 ${totalUnrealized >= 0 ? "text-green-400" : "text-red-400"}`}>
            ${totalUnrealized.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Linked Accounts</h2>
        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : accounts.length === 0 ? (
          <p className="text-zinc-500">No accounts linked yet. Add one below.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div>
                  <Link href={`/dashboard/accounts/${a.id}`} className="font-medium text-blue-400 hover:underline">
                    {a.login}@{a.server}
                  </Link>
                  <p className="text-zinc-500 text-sm">{a.broker || "Unknown broker"}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-zinc-400">Balance</p>
                    <p className="font-mono">${a.balance.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400">Realized</p>
                    <p className={`font-mono ${a.realizedPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${a.realizedPnl.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400">ROI</p>
                    <p className={`font-mono ${a.roi >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {a.roi.toFixed(1)}%
                    </p>
                  </div>
                  <button onClick={() => handleUnlink(a.id)} className="text-red-400 hover:text-red-300 text-xs">
                    Unlink
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Link MT5 Account</h2>
        <form onSubmit={handleLink} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-zinc-400 text-xs block mb-1">Server</label>
            <input
              value={linkForm.server}
              onChange={(e) => setLinkForm((p) => ({ ...p, server: e.target.value }))}
              placeholder="e.g. AquaFunded-Server"
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
            />
          </div>
          <div className="w-40">
            <label className="text-zinc-400 text-xs block mb-1">Login</label>
            <input
              value={linkForm.login}
              onChange={(e) => setLinkForm((p) => ({ ...p, login: e.target.value }))}
              placeholder="e.g. 576984"
              required
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
            />
          </div>
          <button
            type="submit" disabled={linking}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {linking ? "Linking..." : "Link Account"}
          </button>
        </form>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
