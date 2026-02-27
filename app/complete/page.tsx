"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CONCEPT_CARDS } from "@/lib/concepts";

interface TeamState {
  team: { id: string; name: string; badges: string[]; score: number; missionIndex: number; completedMissions?: string[]; completedAt?: string | null; branchStateJson?: string };
  me: { nickname: string };
  gameComplete?: boolean;
}

interface DecisionEntry {
  missionId: string;
  missionTitle: string;
  studentOptionLabel: string;
  teamOptionLabel: string;
  votedWithTeam: boolean;
}

interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
  color: string;
  completedAt: string | null;
  gmTitle: string;
  gmDesc: string;
  gmEmoji: string;
  badgeCount: number;
  isCurrentTeam: boolean;
}

const TEAM_COLOR_MAP: Record<string, string> = {
  blue: "#3b82f6", gold: "#c9a84c", purple: "#7c3aed", red: "#ef4444",
  green: "#22c55e", teal: "#14b8a6", orange: "#f97316", black: "#6b7280",
};

// ── Animated score counter ─────────────────────────────────────────────────────

function ScoreCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (target === 0) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    ref.current = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplay(current);
      if (step >= steps) clearInterval(ref.current!);
    }, duration / steps);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [target]);

  return <span>{display}</span>;
}

// ── Podium component ───────────────────────────────────────────────────────────

function Podium({ entries, myTeamId }: { entries: LeaderboardEntry[]; myTeamId: string }) {
  const medals = ["🥇", "🥈", "🥉"];
  // slot order: 2nd (left), 1st (center), 3rd (right)
  const slots = [entries[1], entries[0], entries[2]].filter(Boolean);
  const heights = ["h-28", "h-36", "h-20"];
  const delays = [0.3, 0.6, 0.2]; // 2nd and 3rd rise first, then 1st drops

  return (
    <div className="flex items-end justify-center gap-3 mb-8">
      {slots.map((entry, slotIdx) => {
        const isCenter = slotIdx === 1;
        const teamColor = TEAM_COLOR_MAP[entry.color] ?? "#c9a84c";
        const isMine = entry.teamId === myTeamId;
        const rankIdx = entry.rank - 1;

        return (
          <motion.div
            key={entry.teamId}
            initial={isCenter ? { y: -60, opacity: 0 } : { y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: delays[slotIdx], type: "spring", stiffness: 200, damping: 22 }}
            className="flex flex-col items-center"
          >
            {/* Team name above podium */}
            <p
              className={`font-mono text-xs font-bold mb-1 text-center max-w-[90px] truncate ${isMine ? "text-[#c9a84c]" : "text-[#e5e7eb]"}`}
            >
              {entry.teamName}
            </p>
            <p className="font-mono text-[10px] text-[#6b7280] mb-1">
              <ScoreCounter target={entry.score} /> pts
            </p>
            <span className="text-2xl mb-1">{medals[rankIdx] ?? `#${entry.rank}`}</span>

            {/* Podium column */}
            <div
              className={`${heights[slotIdx]} ${isCenter ? "w-24" : "w-20"} rounded-t-lg flex items-center justify-center relative`}
              style={{
                background: `linear-gradient(180deg, ${teamColor}22 0%, ${teamColor}11 100%)`,
                border: `2px solid ${isMine ? "#c9a84c" : teamColor}`,
                boxShadow: isMine ? `0 0 16px ${teamColor}40` : undefined,
              }}
            >
              <span className="font-mono font-bold" style={{ color: teamColor, fontSize: isCenter ? "2rem" : "1.5rem" }}>
                {entry.rank}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function CompletePage() {
  const router = useRouter();
  const [state, setState] = useState<TeamState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoaded, setLeaderboardLoaded] = useState(false);
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [votedWithTeamCount, setVotedWithTeamCount] = useState(0);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const confettiFiredRef = useRef(false);
  const confettiContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) { router.replace("/join"); return; }
      const data = await res.json();
      if (!data.team?.completedAt && !data.gameComplete) {
        router.replace("/hq");
        return;
      }
      setState(data);
    }
    async function loadLeaderboard() {
      try {
        const res = await fetch("/api/session/leaderboard", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json() as { leaderboard: LeaderboardEntry[] };
        setLeaderboard(data.leaderboard);
        setLeaderboardLoaded(true);
      } catch { /* silent */ }
      finally { setLeaderboardLoaded(true); }
    }
    async function loadDecisions() {
      try {
        const res = await fetch("/api/student/decisions", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json() as { decisions: DecisionEntry[]; votedWithTeamCount: number };
        setDecisions(data.decisions);
        setVotedWithTeamCount(data.votedWithTeamCount);
      } catch { /* silent */ }
    }
    void load();
    void loadLeaderboard();
    void loadDecisions();
  }, [router]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/submission/finalize", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setClaimCode(data.claimCode);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    if (claimCode) {
      await navigator.clipboard.writeText(claimCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Fire confetti once when podium becomes visible
  useEffect(() => {
    if (confettiFiredRef.current || leaderboard.length < 2 || !confettiContainerRef.current) return;
    confettiFiredRef.current = true;
    const container = confettiContainerRef.current;
    const colors = ["#c9a84c", "#22c55e", "#e5e7eb", "#3b82f6", "#ef4444"];
    for (let i = 0; i < 55; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      const color = colors[Math.floor(Math.random() * colors.length)];
      const drift = (Math.random() - 0.5) * 320;
      const fall = 80 + Math.random() * 60;
      const spin = Math.random() * 720;
      const duration = 1.8 + Math.random() * 1.0;
      const left = 20 + Math.random() * 60; // % of viewport width
      piece.style.cssText = `
        left: ${left}vw;
        background: ${color};
        --fall-y: ${fall}vh;
        --drift-x: ${drift}px;
        --spin: ${spin}deg;
        --duration: ${duration}s;
        animation-delay: ${Math.random() * 0.4}s;
      `;
      container.appendChild(piece);
    }
    setTimeout(() => { if (container) container.innerHTML = ""; }, 3500);
  }, [leaderboard]);

  if (!state) {
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

  const badges = state.team.badges;
  const missionCount = (state.team.completedMissions ?? []).length;
  const myEntry = leaderboard.find((e) => e.isCurrentTeam);
  const topThree = leaderboard.slice(0, 3);

  const totalDecisions = decisions.length;
  const ratio = totalDecisions > 0 ? votedWithTeamCount / totalDecisions : 0;
  const styleLabel = ratio > 0.75 ? "Team Player" : ratio >= 0.5 ? "Consensus Builder" : "Independent Thinker";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Confetti container */}
      <div ref={confettiContainerRef} className="pointer-events-none" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="text-[#c9a84c] font-mono text-5xl font-bold mb-3"
        >
          GM TENURE
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[#22c55e] font-mono text-2xl font-bold mb-4"
        >
          COMPLETE
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-[#e5e7eb] font-mono text-base"
        >
          {state.me.nickname} · Team {state.team.name}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[#6b7280] font-mono text-sm mt-1"
        >
          {missionCount} missions · {badges.length} concepts · {" "}
          <span className="text-[#c9a84c] font-bold">
            <ScoreCounter target={state.team.score} /> pts
          </span>
        </motion.p>
      </motion.div>

      {/* ── Podium ────────────────────────────────────────────────────────── */}
      {!leaderboardLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bsc-card p-6 mb-5 text-center"
        >
          <p className="font-mono text-xs text-[#6b7280] animate-pulse">Loading league standings...</p>
        </motion.div>
      )}
      {leaderboardLoaded && topThree.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bsc-card p-6 mb-5"
        >
          <p className="text-[9px] font-mono text-[#6b7280] tracking-widest uppercase text-center mb-5">
            ◈ League Standings
          </p>
          <Podium entries={topThree} myTeamId={state.team.id} />

          {/* Full standings below podium if more than 3 teams */}
          {leaderboard.length > 3 && (
            <div className="border-t border-[#1a2030] pt-4 space-y-2">
              {leaderboard.slice(3).map((entry) => (
                <div
                  key={entry.teamId}
                  className={`flex items-center justify-between py-1.5 px-3 rounded ${entry.isCurrentTeam ? "bg-[#c9a84c]/8 border border-[#c9a84c]/20" : ""}`}
                >
                  <span className="font-mono text-xs text-[#6b7280]">#{entry.rank}</span>
                  <span className={`font-mono text-xs ${entry.isCurrentTeam ? "text-[#c9a84c]" : "text-[#e5e7eb]"}`}>{entry.teamName}</span>
                  <span className="font-mono text-xs text-[#6b7280]">{entry.score} pts</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── GM Identity card ──────────────────────────────────────────────── */}
      {!myEntry && !leaderboardLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="bsc-card p-6 mb-5 text-center"
        >
          <p className="font-mono text-xs text-[#6b7280] animate-pulse">Loading your GM profile...</p>
        </motion.div>
      )}
      {myEntry && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.1, type: "spring", stiffness: 200, damping: 22 }}
          className="bsc-card p-6 mb-5 border-[#c9a84c]/30"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(201,168,76,0.06) 0%, transparent 70%)" }}
        >
          <p className="text-[9px] font-mono tracking-widest uppercase text-[#6b7280] mb-3">Your GM Identity</p>
          <div className="flex items-start gap-4">
            <span className="text-4xl">{myEntry.gmEmoji}</span>
            <div>
              <p className="font-mono text-xl font-bold text-[#c9a84c] mb-1">{myEntry.gmTitle}</p>
              <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{myEntry.gmDesc}</p>
              <p className="font-mono text-xs text-[#6b7280] mt-2">{myEntry.badgeCount}/{CONCEPT_CARDS.length} concept badges earned</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Decision Log ──────────────────────────────────────────────────── */}
      {decisions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: myEntry ? 1.25 : 0.95 }}
          className="bsc-card p-6 mb-5"
        >
          <p className="bsc-section-title mb-4">Your Decision Log</p>
          <div className="space-y-0">
            {decisions.map((d) => (
              <div
                key={d.missionId}
                className="flex items-center gap-2 py-2 border-b border-[#1a2030] last:border-0"
              >
                <span className="font-mono text-[10px] text-[#6b7280] w-24 flex-shrink-0 truncate">{d.missionTitle}</span>
                <span className="flex-1 font-mono text-xs text-[#e5e7eb] truncate">{d.studentOptionLabel}</span>
                <span
                  className={`font-mono text-xs font-bold w-5 text-center flex-shrink-0 ${d.votedWithTeam ? "text-[#22c55e]" : "text-[#c9a84c]"}`}
                >
                  {d.votedWithTeam ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#1a2030] flex items-center justify-between">
            <p className="font-mono text-xs text-[#6b7280]">Voted with your team</p>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-[#c9a84c]">{votedWithTeamCount}/{totalDecisions}</p>
              <p className="font-mono text-[10px] text-[#6b7280]">{styleLabel}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Badge grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: myEntry ? 1.4 : 1.1 }}
        className="bsc-card p-6 mb-5"
      >
        <p className="bsc-section-title mb-4">Concept Badges Earned</p>
        <motion.div className="grid grid-cols-2 gap-3">
          {CONCEPT_CARDS.map((card, i) => {
            const earned = badges.includes(card.id);
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: (myEntry ? 1.55 : 1.15) + i * 0.08,
                  type: "spring",
                  stiffness: 280,
                  damping: 18,
                }}
                className={`p-3 rounded border font-mono text-xs ${
                  earned
                    ? "border-[#c9a84c]/40 bg-[#c9a84c]/8 text-[#c9a84c]"
                    : "border-[#1a2030] text-[#6b7280] opacity-35"
                }`}
                style={earned ? { background: "rgba(201,168,76,0.05)" } : {}}
              >
                <span className="mr-1">{earned ? "★" : "○"}</span>
                {card.title}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Claim code section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: myEntry ? 1.65 : 1.25 }}
        className="bsc-card p-6 text-center"
      >
        <p className="bsc-section-title">Claim Code</p>
        <p className="text-[#6b7280] font-mono text-xs mb-4">
          Submit this code to your instructor to verify your participation.
        </p>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="pre-submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-[#e5e7eb] font-mono text-sm mb-4">
                Generate your unique claim code below. Each student gets their own code.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bsc-btn-gold px-8 py-3"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Generating…" : "Generate My Claim Code"}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="post-submit"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bsc-card p-4 mb-4 border-[#c9a84c]/60"
              >
                <p className="text-[#c9a84c] font-mono text-2xl font-bold tracking-widest">
                  {claimCode}
                </p>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bsc-btn-ghost px-6 py-2 mb-4"
                onClick={copyCode}
              >
                {copied ? "Copied ✓" : "Copy Code"}
              </motion.button>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border border-[#22c55e]/40 bg-[#22c55e]/8 rounded px-4 py-3"
                style={{ background: "rgba(34,197,94,0.06)" }}
              >
                <p className="text-[#22c55e] font-mono text-sm font-bold">Code received ✓</p>
                <p className="text-[#6b7280] font-mono text-xs mt-1">
                  Paste this code in your LMS, Zoom chat, or wherever your instructor requests it.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: myEntry ? 1.7 : 1.3 }}
        className="text-center text-[#6b7280] font-mono text-xs mt-6 leading-relaxed"
      >
        You&apos;ll go deeper on all 8 concepts in the course. The cap math, analytics models, and
        trade mechanics will click much faster now that you&apos;ve made the decisions yourself.
      </motion.p>
    </div>
  );
}
