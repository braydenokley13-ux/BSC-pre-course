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
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-[#c9a84c] font-mono text-3xl font-bold mb-1">TEACHER DESK</div>
          <p className="text-[#6b7280] font-mono text-xs tracking-wider">Instructor Access</p>
        </div>

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
                placeholder="Enter instructor password"
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
              {loading ? "Verifying…" : "Access Dashboard →"}
            </button>
          </form>
        </div>

        <p className="text-center mt-4">
          <a href="/join" className="text-[#6b7280] font-mono text-xs hover:text-[#c9a84c]">
            ← Student join page
          </a>
        </p>
      </div>
    </div>
  );
}
