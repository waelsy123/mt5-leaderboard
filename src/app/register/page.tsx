"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/dashboard");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-sm mx-auto py-20">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text" placeholder="Display Name" value={displayName}
          onChange={(e) => setDisplayName(e.target.value)} required
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        />
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        />
        <input
          type="password" placeholder="Password (min 8 chars)" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={8}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
      <p className="text-zinc-500 text-sm mt-4">
        Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Login</Link>
      </p>
    </div>
  );
}
