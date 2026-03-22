"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ---------- Cashback table data ---------- */
const challengeData = [
  { size: "$10,000", phase1Fee: "$100", phase2Fee: "$100", totalFee: "$100", cashback: "$20" },
  { size: "$25,000", phase1Fee: "$200", phase2Fee: "$200", totalFee: "$200", cashback: "$40" },
  { size: "$50,000", phase1Fee: "$300", phase2Fee: "$300", totalFee: "$300", cashback: "$60" },
  { size: "$100,000", phase1Fee: "$500", phase2Fee: "$500", totalFee: "$500", cashback: "$100" },
];

/* ---------- FAQ data ---------- */
const faqs = [
  {
    q: "How does the 20% cashback work?",
    a: "When you complete a prop firm challenge (pass or fail), we pay you 20% of the challenge fee directly to your USDT wallet. This applies to every challenge, every time.",
  },
  {
    q: "Do I get cashback even if I fail the challenge?",
    a: "Yes. You earn cashback on every completed challenge regardless of the outcome. The only requirement is that the challenge reaches completion (not cancelled mid-way).",
  },
  {
    q: "How long does it take to receive my cashback?",
    a: "Cashback is processed within 48 hours of challenge completion. USDT is sent directly to the wallet address you provide in your account settings.",
  },
  {
    q: "Which prop firms are supported?",
    a: "We support all major prop firms including FTMO, AquaFunded, The5%ers, MyFundedFX, Funded Next, TrueForexFunds, Alpha Capital, E8 Funding, and more.",
  },
  {
    q: "Is there a limit to how much cashback I can earn?",
    a: "No. There is no cap on cashback earnings. The more challenges you complete, the more you earn.",
  },
  {
    q: "Which network is the USDT sent on?",
    a: "Cashback is paid in USDT on the TRC-20 (Tron) network for minimal fees. Other networks can be arranged upon request.",
  },
];

interface CashbackEntry {
  id: string;
  broker: string;
  challengeType: string;
  accountSize: number;
  cashbackAmount: number;
  cashbackStatus: string;
  cashbackPaidAt: string | null;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function CashbackPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cashbackHistory, setCashbackHistory] = useState<CashbackEntry[]>([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const loggedIn = !!getCookie("lb_token");
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      fetch("/api/me/cashback")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setCashbackHistory(data);
        })
        .catch(() => {});

      fetch("/api/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.walletAddress) setWalletAddress(data.walletAddress);
        })
        .catch(() => {});
    }
  }, []);

  async function handleSaveWallet(e: React.FormEvent) {
    e.preventDefault();
    setSavingWallet(true);
    setWalletSaved(false);
    try {
      await fetch("/api/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      setWalletSaved(true);
      setTimeout(() => setWalletSaved(false), 3000);
    } catch {
      // Ignore
    } finally {
      setSavingWallet(false);
    }
  }

  const totalEarned = cashbackHistory.reduce(
    (s, e) => s + (e.cashbackStatus === "PAID" ? e.cashbackAmount : 0),
    0
  );
  const totalPending = cashbackHistory.reduce(
    (s, e) =>
      s + (e.cashbackStatus !== "PAID" && e.cashbackStatus !== "REJECTED" ? e.cashbackAmount : 0),
    0
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cashback Program
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            20% Cashback on{" "}
            <span className="text-green-400">Every Challenge</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Whether you pass or fail your prop firm challenge, you earn 20% of
            the challenge fee back in USDT. No conditions, no limits.
          </p>
        </div>
      </section>

      {/* How it works mini */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Complete Challenge</h3>
            <p className="text-xs text-zinc-500">Finish any prop firm challenge (pass or fail)</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-green-600/10 text-green-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Get 20% Back</h3>
            <p className="text-xs text-zinc-500">We calculate 20% of your challenge fee</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Receive USDT</h3>
            <p className="text-xs text-zinc-500">Cashback sent to your wallet within 48h</p>
          </div>
        </div>
      </section>

      {/* Cashback table */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Cashback Amounts</h2>
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-4 text-left">Account Size</th>
                <th className="px-5 py-4 text-right">Challenge Fee</th>
                <th className="px-5 py-4 text-right">Cashback Rate</th>
                <th className="px-5 py-4 text-right">You Earn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {challengeData.map((row) => (
                <tr key={row.size} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-5 py-4 font-medium text-zinc-200">{row.size}</td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-zinc-400">{row.totalFee}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 text-xs font-semibold">20%</span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm font-semibold text-green-400">{row.cashback} USDT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-zinc-400">MT5 challenge accounts only. Maximum account size: $100,000.</p>
          <p className="text-sm text-zinc-400">Cashback is paid regardless of whether you pass or fail the challenge.</p>
        </div>
      </section>

      {/* User cashback section / CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoggedIn ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Earned</p>
                <p className="text-3xl font-bold font-mono text-green-400">
                  ${totalEarned.toFixed(2)}
                  <span className="text-lg ml-1">USDT</span>
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Pending</p>
                <p className="text-3xl font-bold font-mono text-yellow-400">
                  ${totalPending.toFixed(2)}
                  <span className="text-lg ml-1">USDT</span>
                </p>
              </div>
            </div>

            {/* Wallet address */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">USDT Wallet Address (TRC-20)</h3>
              <form onSubmit={handleSaveWallet} className="flex gap-3">
                <input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="e.g. TXkR..."
                  className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={savingWallet}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {savingWallet ? "Saving..." : "Save"}
                </button>
              </form>
              {walletSaved && (
                <p className="text-green-400 text-sm mt-2">Wallet address saved.</p>
              )}
            </div>

            {/* History */}
            {cashbackHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Cashback History</h3>
                <div className="rounded-2xl border border-zinc-800 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-zinc-900/80 text-zinc-500 text-xs uppercase tracking-wider">
                        <th className="px-5 py-3 text-left">Broker</th>
                        <th className="px-5 py-3 text-left">Challenge</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                        <th className="px-5 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {cashbackHistory.map((entry) => (
                        <tr key={entry.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-5 py-3 text-sm text-zinc-200">{entry.broker}</td>
                          <td className="px-5 py-3 text-sm text-zinc-400">
                            {entry.challengeType} - ${entry.accountSize.toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-sm text-green-400">
                            ${entry.cashbackAmount.toFixed(2)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <CashbackStatusBadge status={entry.cashbackStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-600/10 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Start Earning Cashback
            </h3>
            <p className="text-zinc-400 max-w-md mx-auto mb-6">
              Create a free account and link your MT5 accounts to start earning
              20% cashback on every completed challenge.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-sm border border-zinc-700 transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-800/30 transition-colors"
              >
                <span className="text-sm font-medium text-zinc-200 pr-4">
                  {faq.q}
                </span>
                <svg
                  className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CashbackStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ELIGIBLE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    PAID: "bg-green-500/10 text-green-400 border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium border ${
        styles[status] || styles.PENDING
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
