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
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bsc-broadcast-shell p-5 md:p-6">
        <div className="mb-4">
          <div className="text-[#c9a84c] font-mono text-3xl md:text-4xl font-bold mb-1">GM SEAT</div>
          <p className="text-[#6b7280] font-mono text-sm">
            You are about to run a front office. Work through 8 situations with your team.
          </p>
        </div>

        <div className="bsc-score-grid mb-4">
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Role</p>
            <p className="bsc-score-value">Student GM</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Mode</p>
            <p className="bsc-score-value">Team Classroom</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Situations</p>
            <p className="bsc-score-value">8 total</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Sync</p>
            <p className="bsc-score-value">Live Team Votes</p>
          </div>
        </div>

        <div className="bsc-live-ticker mb-4">
          <span className="bsc-live-label">Live Desk</span>
          <div className="min-w-0 overflow-hidden">
            <span className="ticker-text bsc-live-track">
              Enter your name and team code to join your room and start the front office simulation.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
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

          <div className="bsc-card p-5">
            <p className="bsc-section-title">How It Works</p>
            <div className="space-y-3 font-mono text-xs text-[#9ca3af]">
              <p>
                1. Join with your team code.
              </p>
              <p>
                2. Wait in lobby while teammates connect.
              </p>
              <p>
                3. Vote together through each situation.
              </p>
              <p>
                4. Review outcomes and submit your claim code at the end.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1e2435]">
              <span className="bsc-status-normal">Classroom Sync Active</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[#6b7280] font-mono text-xs mt-5">
          Instructor?{" "}
          <a href="/teacher" className="text-[#c9a84c] hover:underline">
            Open teacher dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
