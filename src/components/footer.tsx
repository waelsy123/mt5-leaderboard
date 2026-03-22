import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">ProofTrades</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Track prop firm challenges, compete on the leaderboard, and earn
              USDT cashback.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/leaderboard"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/cashback"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cashback Program
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-zinc-500">About</span>
              </li>
              <li>
                <span className="text-sm text-zinc-500">Contact</span>
              </li>
              <li>
                <span className="text-sm text-zinc-500">Careers</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-zinc-500">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-zinc-500">Terms of Service</span>
              </li>
              <li>
                <span className="text-sm text-zinc-500">Risk Disclosure</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} ProofTrades. All rights reserved.
          </p>
          <p className="text-xs text-zinc-700">
            Trading involves risk. Past performance is not indicative of future
            results.
          </p>
        </div>
      </div>
    </footer>
  );
}
