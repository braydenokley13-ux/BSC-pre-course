"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MISSIONS } from "@/lib/missions";

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

function AnimatedProgressBar({ index, total }: { index: number; total: number }) {
  const pct = total > 0 ? (index / total) * 100 : 0;
  return (
    <div className="h-1.5 bg-[#1a2030] rounded-full overflow-hidden mt-1">
      <motion.div
        className="h-full bg-[#c9a84c] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

function StatCard({ label, value, color = "#e5e7eb" }: { label: string; value: number; color?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const steps = 24;
    const id = setInterval(() => {
      frame++;
      setDisplay(Math.round((value / steps) * frame));
      if (frame >= steps) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [value]);

  return (
    <div className="bsc-card p-4 text-center">
      <p className="bsc-section-title">{label}</p>
      <p className="font-mono text-2xl font-bold" style={{ color }}>{display}</p>
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
    if (!password || !confirm("Archive this session? (Data is preserved, but the game ends for all teams.)")) return;
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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[#c9a84c] font-mono text-2xl"
        >
          ◈
        </motion.div>
      </div>
    );
  }

  const inProgress = feed.teams.filter((t) => !t.isComplete && t.activeMembers > 0).length;
  const stuck = feed.teams.filter((t) => t.isStuck).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-[#c9a84c] font-mono text-xl font-bold">{feed.title}</h1>
          <p className="text-[#6b7280] font-mono text-xs mt-0.5">
            {feed.completedTeams}/{feed.totalTeams} teams complete · Refreshes every 5s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bsc-btn-ghost text-xs" onClick={() => downloadExport("summary")}>Export Summary</button>
          <button className="bsc-btn-ghost text-xs" onClick={() => downloadExport("detail")}>Export Detail</button>
          <button
            className="bsc-btn-ghost text-xs text-[#ef4444] border-[#ef4444]/40 hover:border-[#ef4444]"
            onClick={handleArchive}
            disabled={archiving}
          >
            {archiving ? "Archiving…" : "Archive Session"}
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Teams" value={feed.totalTeams} />
        <StatCard label="Completed" value={feed.completedTeams} color="#22c55e" />
        <StatCard label="In Progress" value={inProgress} color="#c9a84c" />
        <StatCard label="Stuck" value={stuck} color="#ef4444" />
      </div>

      {/* Team cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {feed.teams.map((team, i) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bsc-card p-5 border-2 transition-colors ${
                team.isComplete
                  ? "border-[#22c55e]/40"
                  : team.isStuck
                  ? "border-[#ef4444]/50"
                  : "border-[#1a2030]"
              }`}
              style={
                team.isStuck
                  ? { boxShadow: "0 0 16px rgba(239,68,68,0.12)" }
                  : team.isComplete
                  ? { boxShadow: "0 0 12px rgba(34,197,94,0.08)" }
                  : {}
              }
            >
              {/* Team header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[#e5e7eb] font-mono font-bold">{team.name}</span>
                  <span className="text-[#6b7280] font-mono text-xs ml-2">{team.joinCode}</span>
                </div>
                <div className="flex items-center gap-2">
                  {team.isComplete && <span className="bsc-badge-green">Done</span>}
                  {team.isStuck && (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.4 }}
                      className="bsc-badge-red"
                    >
                      Stuck
                    </motion.span>
                  )}
                  <span className="text-[#6b7280] font-mono text-xs">{team.score}pts</span>
                </div>
              </div>

              {/* Mission progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-xs text-[#6b7280]">
                    {team.isComplete ? "Complete" : `${team.missionTitle}`}
                  </span>
                  <span className="font-mono text-xs text-[#6b7280]">⏱ {formatElapsed(team.elapsedSeconds)}</span>
                </div>
                <AnimatedProgressBar index={team.missionIndex} total={MISSIONS.length} />
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: MISSIONS.length }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-0.5 flex-1 rounded-sm ${idx < team.missionIndex ? "bg-[#c9a84c]/40" : "bg-[#1a2030]"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {team.badgeCount > 0 ? (
                  Array.from({ length: team.badgeCount }).map((_, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05, type: "spring", stiffness: 280, damping: 16 }}
                      className="bsc-badge-gold text-xs"
                    >
                      ★
                    </motion.span>
                  ))
                ) : (
                  <span className="text-[#6b7280] font-mono text-xs">No badges yet</span>
                )}
              </div>

              {/* Members */}
              <div className="border-t border-[#1a2030] pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((m) => (
                    <span
                      key={m.id}
                      className={`font-mono text-xs px-1.5 py-0.5 rounded border ${
                        m.active
                          ? "border-[#22c55e]/40 text-[#22c55e]"
                          : "border-[#1a2030] text-[#6b7280]"
                      }`}
                    >
                      {m.nickname}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 font-mono text-xs text-[#6b7280]">
                  <span>{team.activeMembers}/{team.totalMembers} active</span>
                  {team.checkPassRate !== null && (
                    <span>Check: {team.checkPassRate}%</span>
                  )}
                  <span>Codes: {team.claimCodesSubmitted}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
