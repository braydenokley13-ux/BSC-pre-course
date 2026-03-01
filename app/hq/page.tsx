"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ROOM_LAYOUT, RoomMeta } from "@/lib/missionGraph";
import { STATUS_EFFECTS } from "@/lib/statusEffects";
import { CONCEPT_CARDS } from "@/lib/concepts";

// ── Color map (color name → hex, matches team.color stored values) ─────────────

const TEAM_COLOR_MAP: Record<string, string> = {
  blue: "#3b82f6", gold: "#c9a84c", purple: "#7c3aed", red: "#ef4444",
  green: "#22c55e", teal: "#14b8a6", orange: "#f97316", black: "#6b7280",
};

// ── Idle league banter (shown when no real rival events yet) ─────────────────
const LEAGUE_BANTER = [
  "Lakers GM spotted at Starbucks reviewing spreadsheets at 2am.",
  "Celtics front office declines comment on mystery trade call.",
  "Warriors analytics department argues over parking spot allocations.",
  "Nuggets GM posts cryptic emoji — league on high alert.",
  "Knicks reportedly very confident about something. Details unclear.",
  "Heat GM seen power-walking through airport. Sources: unrelated.",
  "League office reminds all GMs: the deadline is real this time.",
  "Bucks front office reportedly 'vibing.' No other details available.",
  "76ers GM cited for excessive use of the phrase 'trust the process.'",
  "Spurs front office described as 'suspiciously calm.' Insiders worried.",
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface TeamInfo {
  id: string;
  name: string;
  score: number;
  color?: string;
  completedMissions: string[];
  teamStatus: string[];
  completedAt: string | null;
  badges?: string[];
}
interface MeInfo { id: string; nickname: string; role: string | null }
interface MissionRoundState { missionId?: string; isResolved?: boolean }
interface TeamStateResponse {
  team: TeamInfo;
  me: MeInfo;
  unlockedMissions: string[];
  completedMissions: string[];
  teamStatus: string[];
  missionRoundState: MissionRoundState;
  gameComplete: boolean;
}

type RoomStatus = "completed" | "active" | "unlocked" | "locked";

function getRoomStatus(room: RoomMeta, completed: string[], unlocked: string[]): RoomStatus {
  if (completed.includes(room.missionId)) return "completed";
  if (unlocked.includes(room.missionId)) return "unlocked";
  return "locked";
}

// ── SVG room coordinates for 900×580 viewBox ─────────────────────────────────
// Layout: Cap Room center top, tier-2 row, tier-3 row, Owner's Suite bottom
const ROOM_SVG: Record<string, { x: number; y: number; w: number; h: number; label: string; sub: string }> = {
  "cap-crunch":      { x: 330, y: 28,  w: 240, h: 72, label: "CAP ROOM",       sub: "SALARY CAP DEPT" },
  "contract-choice": { x: 48,  y: 160, w: 200, h: 70, label: "CONTRACT OFFICE", sub: "CONTRACT DEPT"   },
  "revenue-mix":     { x: 350, y: 160, w: 200, h: 70, label: "REVENUE HUB",    sub: "PARTNERSHIP OFFICE" },
  "stats-lineup":    { x: 652, y: 160, w: 200, h: 70, label: "ANALYTICS LAB",  sub: "ANALYTICS DEPT"  },
  "expense-pressure":{ x: 48,  y: 300, w: 200, h: 70, label: "TRADE DESK",     sub: "TRADE OPERATIONS" },
  "matchup-adjust":  { x: 350, y: 300, w: 200, h: 70, label: "MEDICAL BAY",    sub: "MEDICAL DEPT"    },
  "draft-table":     { x: 652, y: 300, w: 200, h: 70, label: "DRAFT WAR ROOM", sub: "SCOUTING DEPT"   },
  "final-gm-call":   { x: 330, y: 440, w: 240, h: 72, label: "OWNER'S SUITE",  sub: "OWNERSHIP"       },
};

// Corridor paths (SVG path d attributes) connecting rooms
const CORRIDORS = [
  // Cap Room → Contract
  "M 450 100 L 450 130 L 148 130 L 148 160",
  // Cap Room → Revenue
  "M 450 100 L 450 160",
  // Cap Room → Stats
  "M 450 100 L 450 130 L 752 130 L 752 160",
  // Contract → Expense
  "M 148 230 L 148 300",
  // Revenue → Matchup
  "M 450 230 L 450 300",
  // Stats → Draft
  "M 752 230 L 752 300",
  // Contract → Matchup (cross)
  "M 248 195 L 350 195",
  // Revenue → Draft (cross)
  "M 550 195 L 652 195",
  // Expense → Owner's Suite
  "M 148 370 L 148 420 L 330 420 L 330 440",
  // Matchup → Owner's Suite
  "M 450 370 L 450 440",
  // Draft → Owner's Suite
  "M 752 370 L 752 420 L 570 420 L 570 440",
];

// Status pill component
function StatusPill({ id, positive }: { id: string; positive: boolean }) {
  const effect = STATUS_EFFECTS[id];
  if (!effect) return null;
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border ${
        positive
          ? "bg-[#fffbeb] text-[#d97706] border-[#fde68a]"
          : "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]"
      }`}
      title={effect.description}
    >
      <span className="text-[11px]">{effect.icon}</span>
      <span className="tracking-wider uppercase">{effect.label}</span>
    </motion.span>
  );
}

// Animated score counter
function ScoreCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const diff = value - prev.current;
    if (diff === 0) return;
    const steps = Math.min(Math.abs(diff), 20);
    const step = diff / steps;
    let current = prev.current;
    let count = 0;
    const interval = setInterval(() => {
      current += step;
      count++;
      setDisplay(Math.round(current));
      if (count >= steps) {
        setDisplay(value);
        prev.current = value;
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [value]);

  return <>{display}</>;
}

// Individual SVG room
function SVGRoom({
  missionId,
  status,
  isAvatar,
  onClick,
}: {
  missionId: string;
  status: RoomStatus;
  isAvatar: boolean;
  onClick: () => void;
}) {
  const r = ROOM_SVG[missionId];
  if (!r) return null;

  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;

  const strokeColor = {
    completed: "#16a34a",
    unlocked:  "#2563eb",
    active:    "#2563eb",
    locked:    "#e2e8f0",
  }[status];

  const fillColor = {
    completed: "rgba(22,163,74,0.06)",
    unlocked:  "rgba(37,99,235,0.05)",
    active:    "rgba(37,99,235,0.08)",
    locked:    "rgba(241,245,249,0.8)",
  }[status];

  const glowId = `glow-${missionId.replace(/-/g, "")}`;

  return (
    <g
      onClick={status !== "locked" ? onClick : undefined}
      style={{ cursor: status !== "locked" ? "pointer" : "not-allowed" }}
      opacity={status === "locked" ? 0.35 : 1}
    >
      {/* Glow filter def */}
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={status === "unlocked" ? "4" : status === "completed" ? "3" : "0"} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Room rectangle */}
      <rect
        x={r.x} y={r.y} width={r.w} height={r.h}
        rx="8" ry="8"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={status === "locked" ? 1 : status === "completed" || status === "unlocked" ? 1.5 : 2}
        filter={status !== "locked" && status !== "active" ? `url(#${glowId})` : undefined}
      />

      {/* Grid blueprint lines inside the room */}
      <line x1={r.x + 12} y1={cy} x2={r.x + r.w - 12} y2={cy}
        stroke={strokeColor} strokeWidth="0.4" strokeDasharray="3 4" opacity="0.3" />
      <line x1={cx} y1={r.y + 8} x2={cx} y2={r.y + r.h - 8}
        stroke={strokeColor} strokeWidth="0.4" strokeDasharray="3 4" opacity="0.3" />

      {/* Status corner indicator */}
      {status === "completed" && (
        <text x={r.x + r.w - 14} y={r.y + 16} fill="#16a34a" fontSize="11" fontFamily="sans-serif" textAnchor="middle">✓</text>
      )}
      {status === "locked" && (
        <text x={r.x + r.w - 14} y={r.y + 16} fill="#cbd5e1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">⬡</text>
      )}
      {status === "unlocked" && (
        <text x={r.x + r.w - 12} y={r.y + 16} fill="#2563eb" fontSize="9" fontFamily="sans-serif" textAnchor="middle">▶</text>
      )}

      {/* Department label */}
      <text x={cx} y={r.y + 20} textAnchor="middle"
        fill={status === "locked" ? "#cbd5e1" : "#64748b"}
        fontSize="8" fontFamily="sans-serif" letterSpacing="1.5"
        style={{ textTransform: "uppercase" }}
      >
        {r.sub}
      </text>

      {/* Room name */}
      <text x={cx} y={cy + 6} textAnchor="middle"
        fill={status === "locked" ? "#94a3b8" : status === "completed" ? "#16a34a" : "#0f172a"}
        fontSize="13" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5"
      >
        {r.label}
      </text>

      {/* Tagline or status */}
      <text x={cx} y={r.y + r.h - 12} textAnchor="middle"
        fill={status === "locked" ? "#e2e8f0" : status === "completed" ? "rgba(22,163,74,0.7)" : "#64748b"}
        fontSize="8" fontFamily="sans-serif"
      >
        {status === "completed" ? "CLEARED" : status === "locked" ? "— LOCKED —" : status === "unlocked" ? "ENTER →" : "IN PROGRESS"}
      </text>

      {/* Avatar dot */}
      {isAvatar && (
        <g>
          <circle cx={r.x + 20} cy={r.y + r.h - 20} r="10"
            fill="#2563eb" stroke="rgba(37,99,235,0.3)" strokeWidth="4"
          />
          <text x={r.x + 20} y={r.y + r.h - 16} textAnchor="middle"
            fill="#fff" fontSize="7" fontWeight="900" fontFamily="sans-serif"
          >GM</text>
        </g>
      )}
    </g>
  );
}

// ── Main HQ component ─────────────────────────────────────────────────────────
export default function HQPage() {
  const router = useRouter();
  const [state, setState] = useState<TeamStateResponse | null>(null);
  const [error, setError] = useState("");
  const [navigating, setNavigating] = useState<string | null>(null);
  const [avatarRoom, setAvatarRoom] = useState<string | null>(null);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);
  const [rivalEvents, setRivalEvents] = useState<Array<{ message: string; teamColor: string }>>([]);
  const [rivalPopup, setRivalPopup] = useState<{ message: string; teamColor: string } | null>(null);
  const [banterIdx, setBanterIdx] = useState(0);
  const prevBadgesRef = useRef<string[]>([]);
  const prevRivalCountRef = useRef(0);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) { router.replace("/join"); return; }
      const data: TeamStateResponse = await res.json();
      if (data.team.completedAt || data.gameComplete) {
        router.replace("/complete");
        return;
      }
      setState(data);
      const rsm = data.missionRoundState;
      if (rsm?.missionId && !rsm.isResolved) {
        setAvatarRoom(rsm.missionId);
      }
      // Check for newly earned badges
      const newBadges = data.team.badges ?? [];
      const prev = prevBadgesRef.current;
      const newlyEarned = newBadges.filter((b: string) => !prev.includes(b));
      if (newlyEarned.length > 0 && prev.length > 0) {
        const conceptTitle = CONCEPT_CARDS.find((c) => c.id === newlyEarned[0])?.title ?? newlyEarned[0];
        setBadgeToast(conceptTitle);
        setTimeout(() => setBadgeToast(null), 3500);
      }
      prevBadgesRef.current = newBadges;
    } catch {
      setError("Connection error — retrying…");
    }
  }, [router]);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 8000);
    return () => clearInterval(id);
  }, [fetchState]);

  useEffect(() => {
    async function fetchRivals() {
      try {
        const res = await fetch("/api/session/rivals", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as { rivals: Array<{ message: string; teamColor: string }> };
        if (data.rivals.length > prevRivalCountRef.current && prevRivalCountRef.current > 0) {
          const newest = data.rivals[0];
          setRivalPopup(newest);
          setTimeout(() => setRivalPopup(null), 3500);
        }
        prevRivalCountRef.current = data.rivals.length;
        setRivalEvents(data.rivals);
      } catch { /* silent */ }
    }
    void fetchRivals();
    const id = setInterval(() => void fetchRivals(), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBanterIdx((i) => (i + 1) % LEAGUE_BANTER.length), 8000);
    return () => clearInterval(id);
  }, []);

  function handleRoomClick(missionId: string, status: RoomStatus) {
    if (status === "locked" || navigating) return;
    setNavigating(missionId);
    setAvatarRoom(missionId);
    // Short delay so avatar movement is visible
    setTimeout(() => {
      router.push(`/play?missionId=${missionId}`);
    }, 400);
  }

  if (error && !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#dc2626] text-sm">{error}</p>
      </div>
    );
  }
  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2563eb]/20 border-t-[#2563eb] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#64748b] text-xs tracking-widest uppercase">Loading HQ…</p>
        </div>
      </div>
    );
  }

  const { team, me, unlockedMissions, completedMissions, teamStatus } = state;
  const badges = team.badges ?? [];

  const teamColor = TEAM_COLOR_MAP[team.color ?? "blue"] ?? "#2563eb";
  const totalRooms = ROOM_LAYOUT.length;
  const completedCount = completedMissions.length;
  const progressPct = (completedCount / totalRooms) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-5 gap-4 flex-wrap"
      >
        <div>
          <p className="text-[#64748b] text-[10px] tracking-widest uppercase mb-0.5 font-medium">
            General Manager
          </p>
          <h1 className="text-2xl font-bold tracking-tight"
            style={{ color: teamColor }}
          >
            {team.name}
          </h1>
          <p className="text-[#64748b] text-xs mt-1">
            Welcome back,{" "}
            <span className="text-[#0f172a] font-medium">{me.nickname}</span>
            {me.role && (
              <span className="ml-2 text-[#2563eb]">— {me.role.toUpperCase()}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Score ring */}
          <div className="text-center">
            <p className="text-[#64748b] text-[9px] uppercase tracking-widest mb-1 font-medium">Score</p>
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <motion.circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke={teamColor} strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - Math.min(team.score / 80, 1)) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-sm font-bold" style={{ color: teamColor }}>
                  <ScoreCounter value={team.score} />
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[#64748b] text-[9px] uppercase tracking-widest mb-1 font-medium">Progress</p>
            <p className="text-[#0f172a] text-xl font-bold">
              {completedCount}<span className="text-[#64748b] text-sm">/{totalRooms}</span>
            </p>
            <p className="text-[#64748b] text-[9px] uppercase tracking-widest font-medium">Missions</p>
          </div>
        </div>
      </motion.div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-5"
      >
        <div className="flex justify-between text-[9px] text-[#64748b] tracking-widest uppercase mb-1.5 font-medium">
          <span>Floor Progress</span>
          <span>{completedCount} of {totalRooms} departments cleared</span>
        </div>
        <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </motion.div>

      {/* ── Status effects ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {teamStatus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-5"
          >
            {teamStatus.map((sid) => (
              <StatusPill
                key={sid}
                id={sid}
                positive={STATUS_EFFECTS[sid]?.positive ?? false}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Badge Toast ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {badgeToast && (
          <motion.div
            key="badge-toast"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bsc-card px-5 py-3 border-[#bfdbfe] bg-[#eff6ff] flex items-center gap-3 pointer-events-none"
          >
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-[#2563eb] font-semibold">Badge Unlocked</p>
              <p className="text-sm text-[#0f172a] font-bold">{badgeToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Badge Panel ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bsc-card p-4 mb-5"
      >
        <p className="text-[9px] text-[#64748b] tracking-widest uppercase mb-3 font-medium">
          Concept Badges — {badges.length}/{CONCEPT_CARDS.length} Earned
        </p>
        <div className="grid grid-cols-4 gap-2">
          {CONCEPT_CARDS.map((card) => {
            const earned = badges.includes(card.id);
            return (
              <div
                key={card.id}
                className={`text-center py-2 px-1 rounded border transition-colors ${
                  earned
                    ? "border-[#bfdbfe] bg-[#eff6ff]"
                    : "border-[#e2e8f0] opacity-50"
                }`}
                title={card.title}
              >
                <div className={`text-lg mb-0.5 ${earned ? "text-[#2563eb]" : "text-[#94a3b8]"}`}>
                  {earned ? "★" : "○"}
                </div>
                <p className={`text-[9px] leading-tight ${earned ? "text-[#2563eb] font-medium" : "text-[#94a3b8]"}`}>
                  {card.title.split(" ").slice(0, 2).join(" ")}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── SVG Arena Floor Blueprint ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="glass-card p-4 mb-4 overflow-hidden relative"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <p className="text-[9px] text-[#64748b] tracking-widest uppercase mb-3 relative z-10 font-medium">
          Front Office Floor Map
          {unlockedMissions.length > 0 && (
            <span className="ml-3 text-[#2563eb] font-semibold">
              {unlockedMissions.length} room{unlockedMissions.length > 1 ? "s" : ""} unlocked
            </span>
          )}
        </p>

        <svg
          viewBox="0 0 900 528"
          className="w-full relative z-10"
          style={{ maxHeight: "480px" }}
        >
          {/* Corridor lines */}
          {CORRIDORS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              className="svg-corridor"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}

          {/* Rooms */}
          {ROOM_LAYOUT.map((room) => {
            const status = getRoomStatus(room, completedMissions, unlockedMissions);
            return (
              <SVGRoom
                key={room.missionId}
                missionId={room.missionId}
                status={status}
                isAvatar={avatarRoom === room.missionId}
                onClick={() => handleRoomClick(room.missionId, status)}
              />
            );
          })}

          {/* Floor label */}
          <text x="450" y="516" textAnchor="middle"
            fill="#94a3b8" fontSize="8" fontFamily="sans-serif" letterSpacing="2"
          >
            FRONT OFFICE — LEVEL 1
          </text>
        </svg>

        {/* Navigation overlay during room entry */}
        <AnimatePresence>
          {navigating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 backdrop-blur-sm rounded-xl"
            >
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#2563eb]/20 border-t-[#2563eb] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[#2563eb] text-xs tracking-widest uppercase font-medium">
                  Entering {ROOM_SVG[navigating]?.label ?? "room"}…
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-6 text-[9px] text-[#64748b] tracking-wider font-medium"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-[#16a34a] bg-[rgba(22,163,74,0.06)] inline-block" />
          Cleared
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-[#2563eb] bg-[rgba(37,99,235,0.05)] inline-block" />
          Unlocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-[#e2e8f0] bg-[rgba(241,245,249,0.8)] opacity-60 inline-block" />
          Locked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2563eb] inline-block" />
          You (GM)
        </span>
      </motion.div>

      <p className="text-center text-[#94a3b8] text-[9px] tracking-widest uppercase mt-4 font-medium">
        Auto-refreshes every 8s · Rooms unlock as prerequisites clear
      </p>

      {/* ── Rival popup ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {rivalPopup && (
          <motion.div
            key="rival-popup-hq"
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-16 right-4 z-50 max-w-[260px] pointer-events-none"
          >
            <div className="bsc-card p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: TEAM_COLOR_MAP[rivalPopup.teamColor] ?? rivalPopup.teamColor }}
                />
                <p className="text-[9px] tracking-widest uppercase text-[#64748b] font-medium">League Wire</p>
              </div>
              <p className="text-xs text-[#0f172a] leading-snug">{rivalPopup.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rival ticker strip ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 ticker-bar">
        <span className="ticker-text">
          {rivalEvents.length > 0 ? (
            <>
              {"LEAGUE WIRE  ·  "}
              {rivalEvents.map((e) => e.message).join("   ·   ")}
              {"   ·   LEAGUE WIRE  ·  "}
              {rivalEvents.map((e) => e.message).join("   ·   ")}
            </>
          ) : (
            <>
              {"LEAGUE WIRE  ·  "}
              {LEAGUE_BANTER[banterIdx]}
              {"   ·   "}
              {LEAGUE_BANTER[(banterIdx + 1) % LEAGUE_BANTER.length]}
              {"   ·   LEAGUE WIRE  ·  "}
              {LEAGUE_BANTER[banterIdx]}
              {"   ·   "}
              {LEAGUE_BANTER[(banterIdx + 1) % LEAGUE_BANTER.length]}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
