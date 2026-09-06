"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HardHat, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { login } from "@/lib/auth";
import { BUSINESS } from "@/lib/business";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (login(password)) {
        router.replace("/admin");
      } else {
        setError("Incorrect password. Please try again.");
        setLoading(false);
      }
    }, 300);
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5 blueprint-grid">
      <div className="w-full max-w-sm bg-paper border border-line p-8 corner-marks">
        <div className="flex items-center gap-2">
          <HardHat size={22} className="text-rust" />
          <span className="font-display font-semibold text-xl">
            H S <span className="text-rust">CONSTRUCTIONS</span>
          </span>
        </div>
        <h1 className="font-display font-semibold text-3xl mt-6">Admin Portal</h1>
        <p className="text-sm text-steel mt-1">Sign in to manage {BUSINESS.name}.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div role="alert" className="border border-bad/40 bg-bad/5 text-bad text-sm px-3 py-2 rounded-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="text-sm font-medium text-ink flex items-center gap-1.5">
              <Lock size={14} /> Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-line bg-white px-4 py-2.5 text-sm rounded-sm focus:border-rust"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <p className="mt-6 text-xs text-steel leading-relaxed">
          This is a temporary local password gate for development/demo use. Replace with proper
          server-side authentication before this portal is used in production.
        </p>
      </div>
    </div>
  );
}
