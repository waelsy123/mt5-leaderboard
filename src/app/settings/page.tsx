"use client";

import { useEffect, useState } from "react";

interface Settings {
  showPnl: boolean;
  showPayouts: boolean;
  showPositions: boolean;
  showDeposits: boolean;
}

interface ProfileData {
  displayName: string;
  avatarUrl: string | null;
  walletAddress?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    showPnl: false,
    showPayouts: false,
    showPositions: false,
    showDeposits: false,
  });
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "",
    avatarUrl: null,
  });
  const [walletAddress, setWalletAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [walletSaving, setWalletSaving] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        setProfile({
          displayName: data.displayName || "",
          avatarUrl: data.avatarUrl || null,
        });
        if (data.walletAddress) setWalletAddress(data.walletAddress);
      });
  }, []);

  async function toggle(key: keyof Settings) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSaving(true);
    setSaved("");
    await fetch("/api/me/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: updated[key] }),
    });
    setSaving(false);
    showSaved("Privacy settings saved");
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    await fetch("/api/me/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      }),
    });
    setProfileSaving(false);
    showSaved("Profile updated");
  }

  async function handleWalletSave(e: React.FormEvent) {
    e.preventDefault();
    setWalletSaving(true);
    await fetch("/api/me/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    setWalletSaving(false);
    showSaved("Wallet address saved");
  }

  function showSaved(msg: string) {
    setSaved(msg);
    setTimeout(() => setSaved(""), 3000);
  }

  const privacyItems = [
    {
      key: "showPnl" as const,
      label: "Share PNL",
      desc: "Show your realized and unrealized PNL on the public leaderboard and profile",
    },
    {
      key: "showPayouts" as const,
      label: "Share Payouts",
      desc: "Show your withdrawal and payout amounts on your public profile",
    },
    {
      key: "showDeposits" as const,
      label: "Share Deposits",
      desc: "Show your deposit amounts on your public profile",
    },
    {
      key: "showPositions" as const,
      label: "Share Open Positions",
      desc: "Show your current open trades on your public profile",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Saved notification */}
      {saved && (
        <div className="fixed top-20 right-4 z-50 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {saved}
        </div>
      )}

      {/* Profile Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">
                Display Name
              </label>
              <input
                value={profile.displayName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, displayName: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">
                Avatar URL
              </label>
              <input
                value={profile.avatarUrl || ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    avatarUrl: e.target.value || null,
                  }))
                }
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Privacy</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Control what data is visible on the public leaderboard and your profile page.
        </p>
        <div className="space-y-2">
          {privacyItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="pr-4">
                <p className="font-medium text-sm text-zinc-200">
                  {item.label}
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                disabled={saving}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  settings[item.key] ? "bg-blue-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`toggle-dot block w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm ${
                    settings[item.key] ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Cashback Wallet Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Cashback Wallet
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-sm text-zinc-500 mb-4">
            Enter your USDT wallet address (TRC-20) to receive cashback payments.
          </p>
          <form onSubmit={handleWalletSave} className="flex gap-3">
            <input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="TRC-20 wallet address"
              className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={walletSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {walletSaving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-lg font-semibold text-red-400 mb-4">
          Danger Zone
        </h2>
        <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm text-zinc-200">
                Delete Account
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Permanently delete your account and all linked data. This action
                cannot be undone.
              </p>
            </div>
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete your account? This cannot be undone."
                  )
                ) {
                  fetch("/api/me", { method: "DELETE" }).then(() => {
                    window.location.href = "/";
                  });
                }
              }}
              className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-colors shrink-0"
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
