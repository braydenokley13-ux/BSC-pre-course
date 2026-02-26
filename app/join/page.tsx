"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), joinCode: joinCode.trim().toUpperCase() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to join");
        return;
      }
      router.push("/lobby");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-[#c9a84c] font-mono text-4xl font-bold mb-2">GM SEAT</div>
          <p className="text-[#6b7280] font-mono text-sm">
            You are about to run a front office. Work through 8 situations with your team.
          </p>
        </div>

        <div className="bsc-card p-6">
          <p className="bsc-section-title">Join Your Team</p>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="bsc-label" htmlFor="nickname">
                Your Name
              </label>
              <input
                id="nickname"
                className="bsc-input"
                placeholder="e.g. Jordan, LeBron, Giannis"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={24}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="bsc-label" htmlFor="joinCode">
                Team Code
              </label>
              <input
                id="joinCode"
                className="bsc-input uppercase tracking-widest"
                placeholder="e.g. LAKERS7"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                required
              />
              <p className="text-[#6b7280] font-mono text-xs mt-1">
                Get this code from your instructor or breakout room chat.
              </p>
            </div>

            {error && (
              <div className="border border-[#ef4444]/40 bg-[#ef4444]/10 rounded px-3 py-2">
                <p className="text-[#ef4444] font-mono text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="bsc-btn-gold w-full py-3"
              disabled={loading || !nickname.trim() || !joinCode.trim()}
            >
              {loading ? "Joining..." : "Enter Front Office ->"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#6b7280] font-mono text-xs mt-4">
          Instructor?{" "}
          <a href="/teacher" className="text-[#c9a84c] hover:underline">
            Open teacher dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
