"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TeamInfo { id: string; name: string; joinCode: string }

export default function TeacherSetupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("BSC Pre-Course Game");
  const [teamCount, setTeamCount] = useState(6);
  const [teams, setTeams] = useState<TeamInfo[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const pw = sessionStorage.getItem("teacherPassword");
    if (!pw) { router.replace("/teacher"); return; }
    setPassword(pw);
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, password, teamCount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create session");
        return;
      }
      setTeams(data.teams);
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  if (teams) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <div className="bsc-broadcast-shell p-5 md:p-6">
          <div className="text-center mb-5">
            <div className="text-[#22c55e] font-mono text-2xl font-bold mb-1">Session Created ✓</div>
            <p className="text-[#6b7280] font-mono text-sm">
              Share each team code with the matching breakout room.
            </p>
          </div>

          <div className="bsc-score-grid mb-4">
            <div className="bsc-score-tile">
              <p className="bsc-score-label">Session</p>
              <p className="bsc-score-value">{title}</p>
            </div>
            <div className="bsc-score-tile">
              <p className="bsc-score-label">Teams</p>
              <p className="bsc-score-value">{teams.length}</p>
            </div>
            <div className="bsc-score-tile">
              <p className="bsc-score-label">Student Entry</p>
              <p className="bsc-score-value">/join</p>
            </div>
            <div className="bsc-score-tile">
              <p className="bsc-score-label">Status</p>
              <p className="bsc-score-value">Ready</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {teams.map((team, i) => (
              <div key={team.id} className="bsc-card p-5 text-center">
                <p className="text-[#6b7280] font-mono text-xs mb-1">Breakout Room {i + 1}</p>
                <p className="text-[#e5e7eb] font-mono font-bold text-lg mb-2">{team.name}</p>
                <div className="bsc-badge-gold text-lg px-4 py-2 tracking-widest font-bold">
                  {team.joinCode}
                </div>
              </div>
            ))}
          </div>

          <div className="bsc-card p-5 mb-5">
            <p className="bsc-section-title mb-2">Instructions for students</p>
            <ol className="font-mono text-sm text-[#6b7280] space-y-1 list-decimal list-inside">
              <li>Go to <span className="text-[#c9a84c]">[your-domain]/join</span></li>
              <li>Enter your name and your team code</li>
              <li>Play through 8 situations together as a team</li>
              <li>Submit your claim code at the end</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              className="bsc-btn-gold flex-1 py-3"
              onClick={() => router.push("/teacher/dashboard")}
            >
              Open Live Dashboard
            </button>
            <button
              className="bsc-btn-ghost px-6"
              onClick={() => window.print()}
            >
              Print Codes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bsc-broadcast-shell p-5 md:p-6">
        <div className="text-center mb-5">
          <div className="text-[#c9a84c] font-mono text-2xl font-bold mb-1">New Session</div>
          <p className="text-[#6b7280] font-mono text-xs">Creates teams and generates join codes</p>
        </div>

        <div className="bsc-score-grid mb-4">
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Default Teams</p>
            <p className="bsc-score-value">{teamCount}</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Classroom Mode</p>
            <p className="bsc-score-value">Team Voting</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Live Monitor</p>
            <p className="bsc-score-value">Teacher Dashboard</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Export</p>
            <p className="bsc-score-value">CSV</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_0.8fr] gap-4">
          <div className="bsc-card p-6">
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="bsc-label" htmlFor="title">Session Title</label>
                <input
                  id="title"
                  className="bsc-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Section 001 - Spring 2025"
                />
              </div>

              <div>
                <label className="bsc-label" htmlFor="teamCount">Number of Teams</label>
                <select
                  id="teamCount"
                  className="bsc-input"
                  value={teamCount}
                  onChange={(e) => setTeamCount(Number(e.target.value))}
                >
                  {[4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} teams</option>
                  ))}
                </select>
                <p className="text-[#6b7280] font-mono text-xs mt-1">
                  Ideal: 3-4 students per team. Each team plays at its own pace.
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
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Session and Team Codes ->"}
              </button>
            </form>
          </div>

          <div className="bsc-card p-5">
            <p className="bsc-section-title">Session Notes</p>
            <div className="border border-[#c9a84c]/20 bg-[#c9a84c]/5 rounded px-4 py-3">
              <p className="text-[#c9a84c] font-mono text-xs font-bold mb-1">Note</p>
              <p className="text-[#6b7280] font-mono text-xs">
                Creating a new session will archive any currently active session.
                Old data is preserved and exportable.
              </p>
            </div>
            <div className="mt-4 space-y-2 font-mono text-xs text-[#9ca3af]">
              <p>1. Create session</p>
              <p>2. Share team codes</p>
              <p>3. Monitor live feed</p>
              <p>4. Export results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
