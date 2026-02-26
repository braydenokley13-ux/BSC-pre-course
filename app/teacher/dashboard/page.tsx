"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GAME_SITUATION_COUNT } from "@/lib/missions";

interface TeamData {
  id: string;
  name: string;
  joinCode: string;
  missionIndex: number;
  missionTitle: string;
  score: number;
  badges: string[];
  badgeCount: number;
  isComplete: boolean;
  isStuck: boolean;
  elapsedSeconds: number;
  totalMembers: number;
  activeMembers: number;
  members: { id: string; nickname: string; active: boolean }[];
  claimCodesSubmitted: number;
  checkPassRate: number | null;
}

interface FeedData {
  sessionId: string;
  title: string;
  createdAt: string;
  teams: TeamData[];
  totalTeams: number;
  completedTeams: number;
}

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function MissionProgress({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-sm ${i < index ? "bg-[#c9a84c]" : "bg-[#1e2435]"}`}
        />
      ))}
    </div>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [password, setPassword] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [error, setError] = useState("");
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    const pw = sessionStorage.getItem("teacherPassword");
    if (!pw) { router.replace("/teacher"); return; }
    setPassword(pw);
  }, [router]);

  const fetchFeed = useCallback(async () => {
    if (!password) return;
    try {
      const res = await fetch("/api/teacher/feed", {
        headers: { "x-teacher-password": password },
      });
      if (res.status === 401) { router.replace("/teacher"); return; }
      const data = await res.json();
      if (!data.session) { router.replace("/teacher/setup"); return; }
      setFeed(data);
    } catch {
      setError("Connection error");
    }
  }, [password, router]);

  useEffect(() => {
    if (password) fetchFeed();
  }, [password, fetchFeed]);

  useEffect(() => {
    const id = setInterval(() => { if (password) fetchFeed(); }, 5000);
    return () => clearInterval(id);
  }, [password, fetchFeed]);

  async function downloadExport(format: "summary" | "detail") {
    if (!password) return;
    const res = await fetch(`/api/teacher/export?format=${format}`, {
      headers: { "x-teacher-password": password },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bsc-${format}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleArchive() {
    if (!password || !confirm("Archive this session? (Data stays saved, but the game ends for all teams.)")) return;
    setArchiving(true);
    await fetch("/api/session/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setArchiving(false);
    router.push("/teacher/setup");
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#ef4444] font-mono text-sm">{error}</p></div>;
  }

  if (!feed) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading dashboard...</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bsc-broadcast-shell p-4 md:p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-[#c9a84c] font-mono text-xl font-bold">{feed.title}</h1>
            <p className="text-[#6b7280] font-mono text-xs mt-0.5">
              {feed.completedTeams}/{feed.totalTeams} teams complete · Updates every 5s
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="bsc-btn-ghost text-xs" onClick={() => downloadExport("summary")}>
              Export Summary CSV
            </button>
            <button className="bsc-btn-ghost text-xs" onClick={() => downloadExport("detail")}>
              Export Detail CSV
            </button>
            <button className="bsc-btn-ghost text-xs text-[#ef4444] border-[#ef4444]/40 hover:border-[#ef4444]" onClick={handleArchive} disabled={archiving}>
              {archiving ? "Archiving..." : "Archive Session"}
            </button>
          </div>
        </div>

        <div className="bsc-score-grid mb-4">
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Teams</p>
            <p className="bsc-score-value">{feed.totalTeams}</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Completed</p>
            <p className="bsc-score-value text-[#22c55e]">{feed.completedTeams}</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">In Progress</p>
            <p className="bsc-score-value">
              {feed.teams.filter((t) => !t.isComplete && t.activeMembers > 0).length}
            </p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Stuck</p>
            <p className="bsc-score-value text-[#ef4444]">
              {feed.teams.filter((t) => t.isStuck).length}
            </p>
          </div>
        </div>

        <div className="bsc-live-ticker mb-5">
          <span className="bsc-live-label">Live Desk</span>
          <div className="min-w-0 overflow-hidden">
            <span className="ticker-text bsc-live-track">
              Monitor team progress, watch stuck groups, and export class results.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {feed.teams.map((team) => (
            <div
              key={team.id}
              className={`bsc-card p-5 border-2 transition-colors ${
                team.isComplete
                  ? "border-[#22c55e]/40"
                  : team.isStuck
                  ? "border-[#ef4444]/60"
                  : "border-[#1e2435]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[#e5e7eb] font-mono font-bold">{team.name}</span>
                  <span className="text-[#6b7280] font-mono text-xs ml-2">{team.joinCode}</span>
                </div>
                <div className="flex items-center gap-2">
                  {team.isComplete && <span className="bsc-status-success">Done</span>}
                  {team.isStuck && <span className="bsc-status-stuck">Stuck</span>}
                  {!team.isComplete && !team.isStuck && <span className="bsc-status-normal">Live</span>}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#6b7280]">
                    {team.isComplete ? "Complete" : `Situation ${team.missionIndex + 1}: ${team.missionTitle}`}
                  </span>
                  <span className="font-mono text-xs text-[#6b7280]">{formatElapsed(team.elapsedSeconds)}</span>
                </div>
                <MissionProgress index={team.missionIndex} total={GAME_SITUATION_COUNT} />
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-wrap gap-1">
                  {team.badgeCount > 0 ? (
                    Array.from({ length: team.badgeCount }).map((_, i) => (
                      <span key={i} className="bsc-badge-gold text-xs">★</span>
                    ))
                  ) : (
                    <span className="text-[#6b7280] font-mono text-xs">No badges yet</span>
                  )}
                </div>
                <span className="text-[#6b7280] font-mono text-xs">{team.score}pts</span>
              </div>

              <div className="border-t border-[#1e2435] pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((m) => (
                    <span
                      key={m.id}
                      className={`font-mono text-xs px-1.5 py-0.5 rounded border ${
                        m.active
                          ? "border-[#22c55e]/40 text-[#22c55e]"
                          : "border-[#1e2435] text-[#6b7280]"
                      }`}
                    >
                      {m.nickname}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 font-mono text-xs text-[#6b7280] flex-wrap">
                  <span>{team.activeMembers}/{team.totalMembers} active</span>
                  {team.checkPassRate !== null && (
                    <span>Check rate: {team.checkPassRate}%</span>
                  )}
                  <span>Codes in: {team.claimCodesSubmitted}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
