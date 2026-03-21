"use client";

import { useEffect, useState } from "react";

interface Settings {
  showPnl: boolean;
  showPayouts: boolean;
  showPositions: boolean;
  showDeposits: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    showPnl: false, showPayouts: false, showPositions: false, showDeposits: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((data) => {
      if (data.settings) setSettings(data.settings);
    });
  }, []);

  async function toggle(key: keyof Settings) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSaving(true);
    setSaved(false);
    await fetch("/api/me/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: updated[key] }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const items = [
    { key: "showPnl" as const, label: "Share PNL", desc: "Show your realized and unrealized PNL on the public leaderboard and profile" },
    { key: "showPayouts" as const, label: "Share Payouts", desc: "Show your withdrawal/payout amounts on your public profile" },
    { key: "showDeposits" as const, label: "Share Deposits", desc: "Show your deposit amounts on your public profile" },
    { key: "showPositions" as const, label: "Share Open Positions", desc: "Show your current open trades on your public profile" },
  ];

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Privacy Settings</h1>
      <p className="text-zinc-400">Control what data is visible on the public leaderboard and your profile page.</p>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-zinc-500 text-sm">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings[item.key] ? "bg-blue-600" : "bg-zinc-700"}`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings[item.key] ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      {saving && <p className="text-zinc-500 text-sm">Saving...</p>}
      {saved && <p className="text-green-400 text-sm">Settings saved!</p>}
    </div>
  );
}
