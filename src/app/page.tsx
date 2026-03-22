"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ---------- Stats bar data ---------- */
interface Stats {
  activeTraders: number;
  totalVolume: string;
  cashbackPaid: string;
  activeChallenges: number;
}

/* ---------- Cashback Calculator data ---------- */
const accountSizes = [10_000, 25_000, 50_000, 100_000, 200_000] as const;
const challengeFees: Record<number, number> = {
  10_000: 155,
  25_000: 250,
  50_000: 350,
  100_000: 540,
  200_000: 1080,
};

/* ---------- Supported brokers ---------- */
const brokers = [
  "FTMO",
  "AquaFunded",
  "The5%ers",
  "MyFundedFX",
  "Funded Next",
  "TrueForexFunds",
  "Alpha Capital",
  "E8 Funding",
];

/* ---------- How it works ---------- */
const steps = [
  {
    num: "01",
    title: "Sign Up & Link Accounts",
    desc: "Connect your MT5 trading accounts from any prop firm. It takes less than 60 seconds.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Trade & Track Performance",
    desc: "Monitor your PNL, equity curves, and challenge progress in real-time on your dashboard.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Earn 20% Cashback",
    desc: "Get 20% cashback in USDT on every completed challenge, whether you pass or fail.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedSize, setSelectedSize] = useState<number>(50_000);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  const fee = challengeFees[selectedSize] ?? 0;
  const cashback = Math.round(fee * 0.2 * 100) / 100;

  return (
    <div className="relative">
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-glow" />
            Live Prop Firm Tracking
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            Track Your Prop Firm
            <br />
            Challenges.{" "}
            <span className="text-gradient">
              Earn 20% Cashback.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of traders tracking their performance and earning
            USDT cashback on every completed challenge.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/leaderboard"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/20"
            >
              View Leaderboard
            </Link>
            <Link
              href="/cashback"
              className="px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-sm border border-zinc-700 transition-all"
            >
              Start Earning Cashback
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== STATS BAR ===================== */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <StatBlock
              label="Active Traders"
              value={stats ? stats.activeTraders.toLocaleString() : "--"}
            />
            <StatBlock
              label="Total Volume Tracked"
              value={stats ? stats.totalVolume : "--"}
            />
            <StatBlock
              label="Cashback Paid (USDT)"
              value={stats ? stats.cashbackPaid : "--"}
            />
            <StatBlock
              label="Active Challenges"
              value={stats ? stats.activeChallenges.toLocaleString() : "--"}
            />
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Start tracking and earning in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 animate-stagger">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                  {step.icon}
                </div>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  Step {step.num}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SUPPORTED BROKERS ===================== */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-center text-sm font-medium text-zinc-500 uppercase tracking-wider mb-8">
            Supported Prop Firms
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {brokers.map((broker) => (
              <div
                key={broker}
                className="px-5 py-2.5 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:text-white transition-colors"
              >
                {broker}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CASHBACK CALCULATOR ===================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Cashback Calculator
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Select your account size to see how much you will earn back.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            {/* Size selector */}
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Account Size
            </label>
            <div className="flex flex-wrap gap-2 mb-8">
              {accountSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedSize === size
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  ${size.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-800/60 rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500 mb-1">Challenge Fee</p>
                <p className="text-xl font-mono font-bold text-white">
                  ${fee}
                </p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500 mb-1">Cashback Rate</p>
                <p className="text-xl font-mono font-bold text-blue-400">
                  20%
                </p>
              </div>
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-400 mb-1">You Earn</p>
                <p className="text-xl font-mono font-bold text-green-400">
                  ${cashback} USDT
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-br from-blue-600/10 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-2xl p-10 md:p-14 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start tracking?
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8">
            Create a free account, link your MT5 accounts, and start earning
            cashback today.
          </p>
          <Link
            href="/register"
            className="inline-flex px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/20"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ---------- Stat block ---------- */
function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl font-bold font-mono text-white">
        {value}
      </p>
      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
