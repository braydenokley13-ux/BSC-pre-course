"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Verify by checking the feed endpoint
      const res = await fetch("/api/teacher/feed", {
        headers: { "x-teacher-password": password },
      });
      if (!res.ok) {
        setError("Invalid password");
        return;
      }
      const data = await res.json();
      // Store password in sessionStorage for subsequent API calls
      sessionStorage.setItem("teacherPassword", password);
      if (data.session) {
        router.push("/teacher/dashboard");
      } else {
        router.push("/teacher/setup");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bsc-broadcast-shell p-5 md:p-6">
        <div className="mb-4">
          <div className="text-[#c9a84c] font-mono text-3xl font-bold mb-1">TEACHER DESK</div>
          <p className="text-[#6b7280] font-mono text-xs tracking-wider">Instructor Login</p>
        </div>

        <div className="bsc-score-grid mb-4">
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Role</p>
            <p className="bsc-score-value">Instructor</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Control</p>
            <p className="bsc-score-value">Session Setup</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Live Feed</p>
            <p className="bsc-score-value">Every 5s</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Exports</p>
            <p className="bsc-score-value">CSV Ready</p>
          </div>
        </div>

        <div className="bsc-live-ticker mb-4">
          <span className="bsc-live-label">Live Desk</span>
          <div className="min-w-0 overflow-hidden">
            <span className="ticker-text bsc-live-track">
              Sign in to create team codes, monitor classroom progress, and export results.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_0.85fr] gap-4">
          <div className="bsc-card p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="bsc-label" htmlFor="password">
                  Instructor Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="bsc-input"
                  placeholder="Type instructor password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="border border-[#ef4444]/40 bg-[#ef4444]/10 rounded px-3 py-2">
                  <p className="text-[#ef4444] font-mono text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="bsc-btn-gold w-full py-3"
                disabled={loading || !password}
              >
                {loading ? "Checking..." : "Open Dashboard ->"}
              </button>
            </form>
          </div>

          <div className="bsc-card p-5">
            <p className="bsc-section-title">Before You Start</p>
            <div className="space-y-3 font-mono text-xs text-[#9ca3af]">
              <p>1. Create a fresh classroom session.</p>
              <p>2. Share team codes in breakout rooms.</p>
              <p>3. Track progress and stuck teams live.</p>
              <p>4. Export summary and detail CSV files.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1e2435]">
              <span className="bsc-status-normal">Teacher Controls Enabled</span>
            </div>
          </div>
        </div>

        <p className="text-center mt-5">
          <a href="/join" className="text-[#6b7280] font-mono text-xs hover:text-[#c9a84c]">
            Back to student join page
          </a>
        </p>
      </div>
    </div>
  );
}
