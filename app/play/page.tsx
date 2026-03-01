"use client";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { getMissionById, isLegacyMission, Mission, MissionRound } from "@/lib/missions";
import { STATUS_EFFECTS } from "@/lib/statusEffects";
import { CONCEPT_CARDS } from "@/lib/concepts";
import { TRACK_101_MISSION_OVERRIDES } from "@/lib/track101Content";
import { getAvatar } from "@/lib/nbaAvatars";

// ── Types ─────────────────────────────────────────────────────────────────────

type MissionPhase =
  | "loading"
  | "intro"
  | "briefing"
  | "voting"
  | "waiting"
  | "rival-alert"
  | "rival-voting"
  | "rival-waiting"
  | "outcome"
  | "error";

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  color: string;
  rank: number;
  isCurrentTeam: boolean;
}

interface MemberInfo { id: string; nickname: string; active: boolean; role: string | null }
interface MissionRoundState {
  missionId?: string;
  currentRoundId?: string;
  completedRounds?: Array<{ roundId: string; winningOptionId: string; winningTags: string[] }>;
  allTags?: string[];
  rivalFired?: boolean;
  isResolved?: boolean;
}
interface TeamStateResponse {
  track?: string;
  team: { id: string; name: string; score: number; color?: string };
  me: { id: string; nickname: string; role: string | null; avatarId?: string };
  members: MemberInfo[];
  activeCount: number;
  missionRoundState: MissionRoundState;
  votes: Array<{ studentId: string; optionIndex: number }>;
}

interface ResolveResult {
  roundId: string;
  winningOptionId: string;
  winningTags: string[];
  tally: number[];
  rivalFired: boolean;
  rivalMessage?: string;
  rivalResponseRound?: MissionRound;
  nextRoundId?: string | null;
  nextRound?: MissionRound;
  isComplete: boolean;
  outcome?: {
    label: string;
    narrative: string;
    scoreΔ: number;
    applyStatus: string[];
    newTeamStatus: string[];
  };
  conceptId?: string;
  missionId?: string;
  isGameComplete?: boolean;
}

// ── Framer Motion variants ─────────────────────────────────────────────────────

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: "easeOut" as const } },
};

const scalePopIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 16 } },
};

// ── Color map (color name → hex, matches team.color stored values) ─────────────

const TEAM_COLOR_MAP: Record<string, string> = {
  blue: "#3b82f6", gold: "#c9a84c", purple: "#7c3aed", red: "#ef4444",
  green: "#22c55e", teal: "#14b8a6", orange: "#f97316", black: "#6b7280",
};

// ── Voting timer constants ──────────────────────────────────────────────────────
const VOTE_TIMER_SECS = 90;
const RIVAL_TIMER_SECS = 60;

// ── Score pop crowd reaction ────────────────────────────────────────────────────
function getCrowdReaction(delta: number): string {
  if (delta >= 15) return "🏟️ The crowd erupts!";
  if (delta >= 10) return "👏 Strong move, GM.";
  if (delta >= 5)  return "📰 Solid headline tomorrow.";
  if (delta === 0) return "🤷 Jury's still out.";
  if (delta >= -5) return "😬 Tough look in the press.";
  return "😤 The fanbase is not happy.";
}

// ── Breaking news headline after outcome ────────────────────────────────────────
const TAG_HEADLINES: Record<string, string> = {
  aggressive:    "AGGRESSIVE MOVE SHAKES UP LEAGUE",
  conservative:  "GM PLAYS IT SAFE — ANALYSTS DIVIDED",
  "data-driven": "ANALYTICS DESK VINDICATED",
  culture:       "LOCKER ROOM CHEMISTRY PRIORITIZED",
  rebuild:       "TEARDOWN BEGINS — FANS REACT",
  "star-power":  "MARQUEE SIGNING ROCKS OFFSEASON",
  flexibility:   "GM KEEPS OPTIONS OPEN",
  risk:          "HIGH-STAKES BET ON FUTURE",
  balanced:      "CALCULATED APPROACH EARNS PRAISE",
  creative:      "UNCONVENTIONAL MOVE SURPRISES LEAGUE",
};

function getBroadcastHeadline(teamName: string, tags: string[]): string {
  for (const tag of tags) {
    const h = TAG_HEADLINES[tag];
    if (h) return `${teamName.toUpperCase()} FRONT OFFICE: ${h}`;
  }
  return `${teamName.toUpperCase()} GM MAKES A MOVE`;
}

// ── Idle rival ticker banter ────────────────────────────────────────────────────
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

// ── Confetti burst helper ──────────────────────────────────────────────────────

function fireConfetti(teamColor: string) {
  const colors = [teamColor, "#c9a84c", "#ffffff", "#22c55e"];
  Array.from({ length: 44 }).forEach(() => {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left: ${28 + Math.random() * 44}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --fall-y: ${280 + Math.random() * 420}px;
      --drift-x: ${(Math.random() - 0.5) * 220}px;
      --spin: ${Math.random() * 720 - 360}deg;
      --duration: ${1.1 + Math.random() * 1.3}s;
      animation-delay: ${Math.random() * 0.45}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  });
}

// ── Role ceremony component ────────────────────────────────────────────────────

interface RoleInfo { id: string; title: string; description: string }
const ALL_ROLES = ["Capologist", "President", "Head Scout", "Marketing Director"];

function RoleCeremony({ role, onDone }: { role: RoleInfo; onDone: () => void }) {
  const [stage, setStage] = useState<"scanning" | "lock" | "done">("scanning");
  const [displayRole, setDisplayRole] = useState(ALL_ROLES[0]);
  const doneRef = useRef(false);

  useEffect(() => {
    let idx = 0;
    const intervals: number[] = [160, 160, 120, 120, 90, 90, 70, 70, 55, 55];
    let step = 0;

    function cycle() {
      if (step >= intervals.length) {
        setDisplayRole(role.title);
        setStage("lock");
        const t = setTimeout(() => {
          setStage("done");
          if (!doneRef.current) {
            doneRef.current = true;
            setTimeout(onDone, 400);
          }
        }, 900);
        return () => clearTimeout(t);
      }
      idx = (idx + 1) % ALL_ROLES.length;
      setDisplayRole(ALL_ROLES[idx]);
      step++;
      const t = setTimeout(cycle, intervals[step] ?? 55);
      return () => clearTimeout(t);
    }

    const t = setTimeout(cycle, intervals[0]);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: stage === "done" ? 0 : 1 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#020408]"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-10 text-center px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.1 }}
          className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#c9a84c] mb-6"
        >
          ◈ Role Assignment
        </motion.p>

        <div className="min-h-[4rem] flex items-center justify-center mb-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={displayRole}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.06 }}
              className={`font-mono font-bold tracking-widest uppercase ${
                stage === "lock"
                  ? "text-[#c9a84c] role-stamp"
                  : "text-[#4b5563]"
              }`}
              style={{ fontSize: "clamp(1.4rem, 5vw, 2.4rem)" }}
            >
              {displayRole}
            </motion.p>
          </AnimatePresence>
        </div>

        {stage === "lock" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <p className="font-mono text-[10px] tracking-widest uppercase text-[#6b7280] mb-2">
              Your Assignment
            </p>
            <p className="font-mono text-xs text-[#e5e7eb] max-w-xs mx-auto leading-relaxed">
              {role.description}
            </p>
          </motion.div>
        )}
      </div>
      <button
        onClick={() => { if (!doneRef.current) { doneRef.current = true; onDone(); } }}
        className="absolute top-4 right-6 font-mono text-[10px] text-[#374151] hover:text-[#6b7280] transition-colors tracking-widest uppercase"
      >
        skip →
      </button>
    </motion.div>
  );
}

// ── Mission intro cinematic component ─────────────────────────────────────────

function MissionIntro({ mission, onDone }: { mission: { title: string; department: string; tagline?: string; missionNumber?: number }; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[55] flex flex-col items-center justify-center bg-[#020408]"
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-10 text-center px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-mono text-[10px] tracking-[0.45em] uppercase text-[#c9a84c] mb-4"
        >
          {mission.department}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.02em" }}
          animate={{ opacity: 1, letterSpacing: "0.15em" }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="font-mono font-bold text-[#c9a84c] mb-4"
          style={{ fontSize: "clamp(2.8rem, 9vw, 5.5rem)" }}
        >
          {mission.title.toUpperCase()}
        </motion.div>
        {mission.tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="font-mono text-sm text-[#6b7280] tracking-widest"
          >
            {mission.tagline}
          </motion.p>
        )}
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-[#c9a84c]/60"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.3, duration: 2.2, ease: "linear" }}
      />
      <button
        onClick={onDone}
        className="absolute top-4 right-6 font-mono text-[10px] text-[#374151] hover:text-[#6b7280] transition-colors tracking-widest uppercase"
      >
        skip →
      </button>
    </motion.div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RoleTag({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded border tracking-widest uppercase bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/30">
      {title}
    </span>
  );
}

function InfoCardReveal({
  title,
  content,
  delay,
  isRoleRestricted,
  onReveal,
}: {
  title: string;
  content: string;
  delay: number;
  isRoleRestricted?: boolean;
  onReveal?: (title: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [secsLeft, setSecsLeft] = useState(Math.ceil(delay));

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      onReveal?.(title);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [delay, title, onReveal]);

  useEffect(() => {
    if (visible || delay === 0) return;
    const id = setInterval(() => setSecsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [visible, delay]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <AnimatePresence mode="wait">
      {!visible ? (
        <motion.div
          key="pending"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          className="bsc-card p-3 border-dashed"
          style={{ borderColor: "rgba(201,168,76,0.35)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]"
              />
              <p className="font-mono text-xs text-[#c9a84c]/70 tracking-widest uppercase">
                📡 Incoming Transmission
              </p>
            </div>
            {delay > 0 && (
              <span className="font-mono text-[10px] text-[#6b7280]">
                ETA 0:{pad(secsLeft)}
              </span>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="revealed"
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`bsc-card p-4 card-reveal ${
            isRoleRestricted
              ? "role-card-active border-[#c9a84c]/40"
              : ""
          }`}
        >
          {isRoleRestricted && (
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1 opacity-80">
              ⚡ Role-Restricted — Your Eyes Only
            </p>
          )}
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#6b7280] mb-1">{title}</p>
          <p className="font-mono text-xs text-[#e5e7eb] leading-relaxed">{content}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Pulsing dots ───────────────────────────────────────────────────────────────

function PulsingDots({ color = "#c9a84c" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Main inner component ───────────────────────────────────────────────────────

function PlayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const missionId = params.get("missionId") ?? "";

  const mission = missionId ? getMissionById(missionId) : null;
  const isLegacy = mission ? isLegacyMission(mission) : false;

  const [phase, setPhase] = useState<MissionPhase>("loading");
  const [teamState, setTeamState] = useState<TeamStateResponse | null>(null);
  const [currentRound, setCurrentRound] = useState<MissionRound | null>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [resolveResult, setResolveResult] = useState<ResolveResult | null>(null);
  const [rivalMessage, setRivalMessage] = useState<string>("");
  const [rivalRound, setRivalRound] = useState<MissionRound | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const [showScorePop, setShowScorePop] = useState(false);
  const [rivalEvents, setRivalEvents] = useState<Array<{ message: string; teamColor: string }>>([]);
  const [rivalPopup, setRivalPopup] = useState<{ message: string; teamColor: string } | null>(null);
  const [timerSec, setTimerSec] = useState(VOTE_TIMER_SECS);
  const [timerFlash, setTimerFlash] = useState(false);
  const [headline, setHeadline] = useState("");
  const [showHeadline, setShowHeadline] = useState(false);
  const [banterIdx, setBanterIdx] = useState(0);
  const [showRoleCeremony, setShowRoleCeremony] = useState(false);
  const [privateRevealed, setPrivateRevealed] = useState(false);
  const [revealNotif, setRevealNotif] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const prevRivalCountRef = useRef(0);
  const missionStarted = useRef(false);
  const resolvedRef = useRef<string>("");

  useEffect(() => {
    if (!missionId) { router.replace("/hq"); return; }
    if (mission && isLegacy) { router.replace("/hq"); return; }
  }, [missionId, mission, isLegacy, router]);

  const startMission = useCallback(async () => {
    if (missionStarted.current) return;
    missionStarted.current = true;
    try {
      const res = await fetch("/api/mission/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setError(err.error ?? "Failed to start mission");
        setPhase("error");
        return;
      }
      const data = (await res.json()) as { currentRound: MissionRound };
      setCurrentRound(data.currentRound);
      // Show cinematic intro first, then briefing
      const seenKey = `bsc-intro-seen-${missionId}`;
      if (!localStorage.getItem(seenKey)) {
        localStorage.setItem(seenKey, "1");
        setPhase("intro");
      } else {
        setPhase("briefing");
      }
    } catch {
      missionStarted.current = false;
      setError("Network error starting mission");
      setPhase("error");
    }
  }, [missionId]);

  const fetchState = useCallback(async () => {
    if (!missionId) return;
    try {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) { router.replace("/join"); return; }
      const data: TeamStateResponse = await res.json();
      setTeamState(data);

      const rsm = data.missionRoundState;

      if (rsm?.missionId !== missionId && !missionStarted.current) {
        await startMission();
        return;
      }

      if (rsm?.isResolved && rsm?.missionId === missionId) return;

      if (phase === "waiting" || phase === "rival-waiting") {
        const roundId =
          phase === "rival-waiting" ? "rival-response" : (rsm?.currentRoundId ?? "");
        const votedIds = data.votes.map((v) => v.studentId);
        const activeIds = data.members.filter((m) => m.active).map((m) => m.id);
        const allVoted =
          activeIds.length > 0 && activeIds.every((id) => votedIds.includes(id));
        if (allVoted && !resolving) {
          const key = `${missionId}-${roundId}`;
          if (resolvedRef.current !== key) {
            resolvedRef.current = key;
            await handleResolveRound(roundId);
          }
        }
      }
    } catch {
      // silent
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId, phase, resolving, startMission, router]);

  useEffect(() => {
    void fetchState();
    const id = setInterval(() => void fetchState(), 4000);
    return () => clearInterval(id);
  }, [fetchState]);

  // Poll rival events every 12 seconds
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
    const id = setInterval(() => void fetchRivals(), 12000);
    return () => clearInterval(id);
  }, []);

  // Voting countdown timer
  useEffect(() => {
    if (phase !== "voting" && phase !== "rival-voting") return;
    const limit = phase === "rival-voting" ? RIVAL_TIMER_SECS : VOTE_TIMER_SECS;
    setTimerSec(limit);
    setTimerFlash(false);
    const tick = setInterval(() => {
      setTimerSec((s) => {
        if (s <= 1) {
          clearInterval(tick);
          // auto-resolve when timer expires
          void handleResolveRound(
            phase === "rival-voting" ? "rival-response" : currentRound?.id ?? "",
            true
          );
          return 0;
        }
        // Flash effect in final 5 seconds
        if (s <= 6) setTimerFlash((f) => !f);
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Idle banter ticker rotation
  useEffect(() => {
    const id = setInterval(() => setBanterIdx((i) => (i + 1) % LEAGUE_BANTER.length), 8000);
    return () => clearInterval(id);
  }, []);

  // Fetch leaderboard when outcome phase starts
  useEffect(() => {
    if (phase !== "outcome") return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/session/leaderboard", { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as { leaderboard: LeaderboardEntry[] };
          setLeaderboard(data.leaderboard);
        }
      } catch { /* silent */ }
    }, 1800);
    return () => clearTimeout(t);
  }, [phase]);

  async function handleVote(optionIdx: number) {
    if (!currentRound) return;
    setSelectedOptionIdx(optionIdx);
    setPhase("waiting");
    try {
      const res = await fetch("/api/mission/vote-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, roundId: currentRound.id, optionIndex: optionIdx }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch {
      setPhase("voting");
      setSelectedOptionIdx(null);
    }
  }

  async function handleRivalVote(optionIdx: number) {
    setSelectedOptionIdx(optionIdx);
    setPhase("rival-waiting");
    try {
      const res = await fetch("/api/mission/vote-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, roundId: "rival-response", optionIndex: optionIdx }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch {
      setPhase("rival-voting");
      setSelectedOptionIdx(null);
    }
  }

  async function handleResolveRound(roundId: string, timedOut = false) {
    if (resolving) return;
    setResolving(true);
    try {
      const res = await fetch("/api/mission/resolve-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, roundId, ...(timedOut && { timedOut: true }) }),
        credentials: "include",
      });
      const data: ResolveResult = await res.json();
      setResolveResult(data);

      if (data.rivalFired && data.rivalResponseRound) {
        setRivalMessage(data.rivalMessage ?? "");
        setRivalRound(data.rivalResponseRound);
        setSelectedOptionIdx(null);
        setPhase("rival-alert");
        return;
      }
      if (data.isComplete) {
        if ((data.outcome?.scoreΔ ?? 0) > 0) {
          setShowScorePop(true);
          setTimeout(() => setShowScorePop(false), 2000);
          // 🎉 Fire confetti for positive outcomes
          const teamColor = TEAM_COLOR_MAP[teamState?.team?.color ?? "gold"] ?? "#c9a84c";
          fireConfetti(teamColor);
        }
        // Set breaking news headline from winning tags
        const teamName = teamState?.team?.name ?? "Front Office";
        setHeadline(getBroadcastHeadline(teamName, data.winningTags ?? []));
        setShowHeadline(true);
        setTimeout(() => setShowHeadline(false), 4000);
        setPhase("outcome");
        return;
      }
      if (data.nextRound) {
        setCurrentRound(data.nextRound);
        setSelectedOptionIdx(null);
        setPhase("voting");
      }
    } catch {
      setError("Failed to resolve round — try refreshing");
      setPhase("error");
    } finally {
      setResolving(false);
    }
  }

  function handleContinue() {
    if (resolveResult?.isGameComplete) { router.push("/complete"); return; }
    if (resolveResult?.conceptId) { router.push(`/catalog?concept=${resolveResult.conceptId}`); return; }
    router.push("/hq");
  }

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (!missionId || !mission || isLegacy) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Redirecting…</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-[#ef4444] font-mono text-sm">{error}</p>
          <button className="bsc-btn-ghost" onClick={() => router.push("/hq")}>← Back to HQ</button>
        </div>
      </div>
    );
  }

  if (phase === "loading" || !teamState) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="text-[#c9a84c] font-mono text-3xl"
          >
            ◈
          </motion.div>
          <p className="text-[#6b7280] font-mono text-sm">Entering the building…</p>
        </div>
      </div>
    );
  }

  const rawMission = mission as Mission;
  // Apply Track 101 content overrides when session is on the beginner track
  const track = teamState.track ?? "201";

  const t101 = track === "101" ? TRACK_101_MISSION_OVERRIDES[rawMission.id] : null;
  const richMission: Mission = t101
    ? {
        ...rawMission,
        ...(t101.tagline ? { tagline: t101.tagline } : {}),
        scenario: t101.scenario ?? rawMission.scenario,
        infoCards: rawMission.infoCards.map((card) => ({
          ...card,
          content: t101.infoCardSimplifications?.[card.title] ?? card.content,
        })),
        rounds: rawMission.rounds.map((round) => {
          const rs = t101.roundSimplifications?.[round.id];
          if (!rs) return round;
          return {
            ...round,
            ...(rs.prompt ? { prompt: rs.prompt } : {}),
            ...(rs.context ? { context: rs.context } : {}),
            options: round.options.map((opt) => ({
              ...opt,
              description: rs.options?.[opt.id] ?? opt.description,
            })),
          };
        }),
      }
    : rawMission;

  const { me, members, activeCount } = teamState;
  const myRole = richMission.roles.find((r) => r.id === me.role) ?? null;
  const myInfoCards = richMission.infoCards.filter(
    (c) => !c.roleOnly || c.roleOnly === me.role
  );
  const conceptTitle =
    CONCEPT_CARDS.find((c) => c.id === richMission.conceptId)?.title ?? richMission.conceptId;

  // Vote tally for current active round
  const activeRound = (phase === "rival-voting" || phase === "rival-waiting") ? rivalRound : currentRound;
  const voteTally = activeRound
    ? activeRound.options.map((_, i) => teamState.votes.filter((v) => v.optionIndex === i).length)
    : [];
  const totalVotes = teamState.votes.length;
  const votePct = (count: number) => totalVotes > 0 ? (count / totalVotes) * 100 : 0;

  const votedIds = teamState.votes.map((v) => v.studentId);
  const activeIds = members.filter((m) => m.active).map((m) => m.id);
  const votedCount = activeIds.filter((id) => votedIds.includes(id)).length;
  const canReveal = votedCount >= activeCount && activeCount > 0;

  // Stable phase key so voting→waiting doesn't re-animate options
  const phaseKey =
    phase === "waiting" ? "voting"
    : phase === "rival-waiting" ? "rival-voting"
    : phase;

  // ── Render ─────────────────────────────────────────────────────────────────

  // Role ceremony: show once per mission, first time entering briefing
  const roleCeremonyKey = `bsc-role-seen-${missionId}`;

  return (
    <>
      {/* ── MISSION INTRO CINEMATIC ────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "intro" && (
          <MissionIntro
            mission={richMission}
            onDone={() => {
              setPhase("briefing");
              // Trigger role ceremony after intro
              if (myRole && !localStorage.getItem(roleCeremonyKey)) {
                localStorage.setItem(roleCeremonyKey, "1");
                setShowRoleCeremony(true);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* ── ROLE CEREMONY ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showRoleCeremony && myRole && (
          <RoleCeremony
            role={myRole}
            onDone={() => setShowRoleCeremony(false)}
          />
        )}
      </AnimatePresence>

      {/* ── INFO CARD REVEAL NOTIFICATION ─────────────────────────────────── */}
      <AnimatePresence>
        {revealNotif && (
          <motion.div
            key="info-notif"
            initial={{ y: -48 }}
            animate={{ y: 0 }}
            exit={{ y: -48 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed top-14 left-0 right-0 z-50 ticker-bar text-center pointer-events-none"
            style={{ background: "rgba(201,168,76,0.95)", borderBottom: "1px solid rgba(201,168,76,0.3)" }}
          >
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-black">
              ⚡ INCOMING BRIEFING — {revealNotif}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    <AnimatePresence mode="wait">
      <motion.div
        key={phaseKey}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-4 py-6"
      >
        {/* ── BRIEFING ─────────────────────────────────────────────────────── */}
        {phase === "briefing" && (
          <div>
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 mb-5"
            >
              <button
                className="text-[#6b7280] font-mono text-xs hover:text-[#e5e7eb] transition-colors"
                onClick={() => router.push("/hq")}
              >
                ← HQ
              </button>
              <span className="text-[#1a2030]">|</span>
              <span className="text-[#c9a84c] font-mono text-xs tracking-widest uppercase">{richMission.department}</span>
              <span className="text-[#1a2030]">|</span>
              <span className="text-[#e5e7eb] font-mono text-sm font-bold">{richMission.title}</span>
            </motion.div>

            {/* Scenario */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="bsc-card p-5 mb-4 spotlight"
            >
              <p className="bsc-section-title">Situation</p>
              <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{richMission.scenario}</p>
            </motion.div>

            {/* Role card — flip reveal */}
            {myRole && (
              <motion.div
                initial={{ opacity: 0, rotateX: 80, transformPerspective: 800 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 22 }}
                className="bsc-card p-4 mb-4 role-card-active border-[#c9a84c]/30"
              >
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-2">Your Role</p>
                <p className="font-mono text-sm font-bold text-[#e5e7eb] mb-1">{myRole.title}</p>
                <p className="font-mono text-xs text-[#6b7280] mb-3">{myRole.description}</p>
                <div className="border-t border-[#c9a84c]/20 pt-3 relative overflow-hidden">
                  {!privateRevealed ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-center py-3 rounded border border-dashed border-[#c9a84c]/25 cursor-pointer hover:border-[#c9a84c]/50 transition-colors"
                      onClick={() => setPrivateRevealed(true)}
                    >
                      <span className="font-mono text-[10px] text-[#c9a84c]/50 tracking-widest uppercase">
                        ◈ Tap to Reveal — Classified Intel
                      </span>
                    </motion.div>
                  ) : (
                    <>
                      <p className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1 opacity-70">
                        ◈ Private Intelligence
                      </p>
                      <p className={`font-mono text-xs text-[#e5e7eb] leading-relaxed private-reveal gm-watermark`}>
                        {myRole.privateInfo}
                      </p>
                      {/* Scanline sweep */}
                      <motion.div
                        initial={{ top: 0, opacity: 0.4 }}
                        animate={{ top: "100%", opacity: 0 }}
                        transition={{ duration: 0.55, ease: "linear" }}
                        className="absolute left-0 right-0 h-8 pointer-events-none"
                        style={{ background: "linear-gradient(to bottom, rgba(201,168,76,0.18), transparent)" }}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Team roster pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {members.map((m, i) => (
                <motion.span
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.32 + i * 0.06 }}
                  className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                    m.id === me.id
                      ? "border-[#c9a84c] text-[#c9a84c]"
                      : m.active
                      ? "border-[#22c55e]/30 text-[#22c55e]"
                      : "border-[#1a2030] text-[#6b7280]"
                  }`}
                >
                  {m.nickname}
                  {m.role && <span className="opacity-60 ml-1">({m.role})</span>}
                  {m.id === me.id && " ●"}
                </motion.span>
              ))}
            </motion.div>

            {/* Info cards */}
            <div className="space-y-3 mb-5">
              {myInfoCards.map((card) => (
                <InfoCardReveal
                  key={card.title}
                  title={card.title}
                  content={card.content}
                  delay={card.revealDelay}
                  isRoleRestricted={!!card.roleOnly}
                  onReveal={(title) => {
                    if (card.revealDelay > 0) {
                      setRevealNotif(title);
                      setTimeout(() => setRevealNotif(null), 2800);
                    }
                  }}
                />
              ))}
            </div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="bsc-btn-gold w-full py-3"
              onClick={() => { if (currentRound) setPhase("voting"); }}
              disabled={!currentRound}
            >
              {currentRound ? "I've Read the Briefing — Begin Voting →" : "Preparing mission…"}
            </motion.button>
          </div>
        )}

        {/* ── VOTING / WAITING ──────────────────────────────────────────────── */}
        {(phase === "voting" || phase === "waiting") && currentRound && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <button
                  className="text-[#6b7280] font-mono text-xs hover:text-[#e5e7eb] transition-colors"
                  onClick={() => setPhase("briefing")}
                >
                  ← Briefing
                </button>
                <span className="text-[#1a2030]">|</span>
                <span className="text-[#c9a84c] font-mono text-xs tracking-widest uppercase">{richMission.title}</span>
              </div>
              <div className="flex items-center gap-3">
                {myRole && <RoleTag title={myRole.title} />}
                <span className="text-[#6b7280] font-mono text-xs">{votedCount}/{activeCount} student{activeCount !== 1 ? "s" : ""} voted</span>
                {/* Countdown ring — escalating urgency */}
                {(() => {
                  const timerColor = timerSec <= VOTE_TIMER_SECS * 0.25
                    ? "#ef4444"
                    : timerSec <= VOTE_TIMER_SECS * 0.6
                    ? "#f97316"
                    : "#c9a84c";
                  const isPulsing = timerSec <= VOTE_TIMER_SECS * 0.25;
                  return (
                    <motion.div
                      className="relative w-8 h-8 flex-shrink-0"
                      animate={isPulsing ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={isPulsing ? { repeat: Infinity, duration: 0.85 } : {}}
                    >
                      <svg viewBox="0 0 32 32" className="w-8 h-8 -rotate-90">
                        <circle cx="16" cy="16" r="13" fill="none" stroke="#1a2030" strokeWidth="3" />
                        <circle
                          cx="16" cy="16" r="13" fill="none"
                          stroke={timerColor}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 13}`}
                          strokeDashoffset={`${2 * Math.PI * 13 * (1 - timerSec / VOTE_TIMER_SECS)}`}
                          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
                        />
                      </svg>
                      <span
                        className="absolute inset-0 flex items-center justify-center font-mono text-[9px]"
                        style={{ color: timerColor }}
                      >
                        {timerSec}
                      </span>
                    </motion.div>
                  );
                })()}
              </div>
            </div>

            {/* Decision prompt */}
            <div className="bsc-card p-5 mb-5 spotlight relative overflow-hidden">
              {/* Timer flash bar — final 5 seconds */}
              <AnimatePresence>
                {timerFlash && (
                  <motion.div
                    key="flash"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.38 }}
                    className="absolute top-0 left-0 right-0 h-0.5 bg-[#ef4444] rounded-t-lg pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="font-mono text-[10px] tracking-widest"
                  style={{ color: timerSec <= VOTE_TIMER_SECS * 0.25 ? "#ef4444" : "#c9a84c" }}
                >
                  {timerSec <= VOTE_TIMER_SECS * 0.25 ? "🔴 VOTE NOW" : "⚡ DECISION POINT"}
                </span>
                <div className="flex-1 h-px bg-[#c9a84c]/20" />
              </div>
              <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{currentRound.prompt}</p>
              {currentRound.context && (
                <p className="font-mono text-xs text-[#6b7280] mt-3 leading-relaxed border-t border-[#1a2030] pt-3">
                  {currentRound.context}
                </p>
              )}
            </div>

            {/* Option cards — staggered from right */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-3 mb-5"
            >
              {currentRound.options.map((opt, i) => {
                const isSelected = selectedOptionIdx === i;
                const isOther = selectedOptionIdx !== null && !isSelected;
                const disabled = phase === "waiting";
                const thisVotes = voteTally[i] ?? 0;
                const thisPct = votePct(thisVotes);

                return (
                  <motion.button
                    key={opt.id}
                    variants={slideFromRight}
                    animate={{ opacity: isOther ? 0.32 : 1, scale: isSelected ? 1.015 : 1 }}
                    whileHover={!disabled ? { scale: isSelected ? 1.015 : 1.02 } : {}}
                    whileTap={!disabled ? { scale: 0.985 } : {}}
                    transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.15 } }}
                    className={`mission-option text-left w-full ${isSelected ? "selected" : ""} ${disabled && !isSelected ? "cursor-default" : ""}`}
                    onClick={() => !disabled && void handleVote(i)}
                    disabled={disabled}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 w-7 h-7 rounded border font-mono text-xs flex items-center justify-center mt-0.5 transition-colors duration-150 ${
                          isSelected
                            ? "border-[#c9a84c] bg-[#c9a84c] text-black font-bold"
                            : "border-[#1a2030] text-[#6b7280]"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-[#e5e7eb] leading-snug">{opt.label}</p>
                        <p className="font-mono text-xs text-[#6b7280] mt-1 leading-relaxed">{opt.description}</p>
                        {opt.requiresStatus && (
                          <p className="font-mono text-[10px] text-[#c9a84c] mt-1">
                            Requires: {STATUS_EFFECTS[opt.requiresStatus]?.label ?? opt.requiresStatus}
                          </p>
                        )}
                        {/* Live tally bar — shown as soon as any votes exist */}
                        {(phase === "waiting" || totalVotes > 0) && (
                          <div className={`mt-2.5 ${phase === "voting" && selectedOptionIdx === null ? "opacity-50" : ""}`}>
                            <div className="h-1 bg-[#1a2030] rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${isSelected ? "bg-[#c9a84c]" : "bg-[#2a3050]"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${thisPct}%` }}
                                transition={{ type: "spring", stiffness: 110, damping: 22 }}
                              />
                            </div>
                            <p className="font-mono text-[10px] text-[#6b7280] mt-1">
                              {thisVotes} vote{thisVotes !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Waiting state — with live teammate vote indicators */}
            {phase === "waiting" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3"
              >
                <PulsingDots />
                <p className="text-[#6b7280] font-mono text-xs">
                  {votedCount}/{activeCount} votes in — waiting for teammates…
                </p>
                {/* Teammate vote indicators */}
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {members.filter((m) => m.active).map((m) => {
                    const hasVoted = votedIds.includes(m.id);
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[10px] transition-colors"
                        style={{
                          borderColor: hasVoted ? "#c9a84c" : "#1a2030",
                          background: hasVoted ? "rgba(201,168,76,0.06)" : "transparent",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 bg-[#c9a84c]/20"
                          style={{ color: "#c9a84c" }}
                        >
                          {m.nickname.slice(0, 1).toUpperCase()}
                        </div>
                        <span style={{ color: hasVoted ? "#c9a84c" : "#6b7280" }}>
                          {m.nickname}{m.id === me.id ? " (you)" : ""}
                        </span>
                        {hasVoted ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="text-[#c9a84c] text-[11px]"
                          >
                            ✓
                          </motion.span>
                        ) : (
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-[#6b7280] flex-shrink-0"
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                {canReveal && (
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bsc-btn-gold px-8 py-2"
                    onClick={() => void handleResolveRound(currentRound.id)}
                    disabled={resolving}
                  >
                    {resolving ? "Counting votes…" : "Reveal Results →"}
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ── RIVAL ALERT ───────────────────────────────────────────────────── */}
        {phase === "rival-alert" && (
          <div>
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="ticker-bar mb-5"
            >
              <span className="ticker-text">⚡ BREAKING — LEAGUE DEVELOPMENT ALERT &nbsp;&nbsp;&nbsp; ⚡ BREAKING — LEAGUE DEVELOPMENT ALERT</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, type: "spring", stiffness: 200, damping: 20 }}
              className="bsc-card p-6 mb-5 border-[#ef4444]/40"
              style={{ background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(239,68,68,0.06) 0%, transparent 70%)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                  className="w-2 h-2 rounded-full bg-[#ef4444]"
                />
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#ef4444]">Rival Move Detected</p>
              </div>
              <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{rivalMessage}</p>
            </motion.div>

            {rivalRound && (
              <motion.button
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bsc-btn-gold w-full py-3"
                onClick={() => {
                  setCurrentRound(rivalRound);
                  setSelectedOptionIdx(null);
                  setPhase("rival-voting");
                }}
              >
                Respond →
              </motion.button>
            )}
          </div>
        )}

        {/* ── RIVAL VOTING / WAITING ────────────────────────────────────────── */}
        {(phase === "rival-voting" || phase === "rival-waiting") && rivalRound && (
          <div>
            <motion.div
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="ticker-bar mb-5"
            >
              <span className="ticker-text">RIVAL RESPONSE REQUIRED — FRONT OFFICE DECISION PENDING</span>
            </motion.div>

            <div className="flex items-center justify-between mb-5">
              <span className="text-[#ef4444] font-mono text-xs tracking-widest uppercase">⚡ Responding to Rival Move</span>
              <div className="flex items-center gap-3">
                <span className="text-[#6b7280] font-mono text-xs">{votedCount}/{activeCount} student{activeCount !== 1 ? "s" : ""} voted</span>
                {/* Rival countdown ring */}
                <div className="relative w-8 h-8 flex-shrink-0">
                  <svg viewBox="0 0 32 32" className="w-8 h-8 -rotate-90">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="#1a2030" strokeWidth="3" />
                    <circle
                      cx="16" cy="16" r="13" fill="none"
                      stroke={timerSec > 30 ? "#c9a84c" : timerSec > 10 ? "#f97316" : "#ef4444"}
                      strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 13}`}
                      strokeDashoffset={`${2 * Math.PI * 13 * (1 - timerSec / RIVAL_TIMER_SECS)}`}
                      style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
                    />
                  </svg>
                  <span
                    className="absolute inset-0 flex items-center justify-center font-mono text-[9px]"
                    style={{ color: timerSec > 30 ? "#c9a84c" : timerSec > 10 ? "#f97316" : "#ef4444" }}
                  >
                    {timerSec}
                  </span>
                </div>
              </div>
            </div>

            <div className="bsc-card p-5 mb-5 border-[#ef4444]/20">
              <p className="bsc-section-title" style={{ color: "#ef4444" }}>How do you respond?</p>
              <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{rivalRound.prompt}</p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-3 mb-5"
            >
              {rivalRound.options.map((opt, i) => {
                const isSelected = selectedOptionIdx === i;
                const isOther = selectedOptionIdx !== null && !isSelected;
                const disabled = phase === "rival-waiting";
                const thisVotes = voteTally[i] ?? 0;
                const thisPct = votePct(thisVotes);

                return (
                  <motion.button
                    key={opt.id}
                    variants={slideFromRight}
                    animate={{ opacity: isOther ? 0.32 : 1, scale: isSelected ? 1.015 : 1 }}
                    whileHover={!disabled ? { scale: 1.02 } : {}}
                    whileTap={!disabled ? { scale: 0.985 } : {}}
                    transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.15 } }}
                    className={`mission-option text-left w-full border-[#ef4444]/20 ${
                      isSelected ? "border-[#ef4444]/60 bg-[#ef4444]/5" : ""
                    } ${disabled && !isSelected ? "cursor-default" : ""}`}
                    onClick={() => !disabled && void handleRivalVote(i)}
                    disabled={disabled}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 w-7 h-7 rounded border font-mono text-xs flex items-center justify-center mt-0.5 ${
                          isSelected
                            ? "border-[#ef4444] bg-[#ef4444] text-white"
                            : "border-[#1a2030] text-[#6b7280]"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-[#e5e7eb]">{opt.label}</p>
                        <p className="font-mono text-xs text-[#6b7280] mt-1 leading-relaxed">{opt.description}</p>
                        {(phase === "rival-waiting" || thisVotes > 0) && (
                          <div className="mt-2.5">
                            <div className="h-1 bg-[#1a2030] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-[#ef4444]/50"
                                initial={{ width: 0 }}
                                animate={{ width: `${thisPct}%` }}
                                transition={{ type: "spring", stiffness: 110, damping: 22 }}
                              />
                            </div>
                            <p className="font-mono text-[10px] text-[#6b7280] mt-1">
                              {thisVotes} vote{thisVotes !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {phase === "rival-waiting" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-3"
              >
                <PulsingDots color="#ef4444" />
                <p className="text-[#6b7280] font-mono text-xs">{votedCount}/{activeCount} responses in…</p>
                {canReveal && (
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bsc-btn-gold px-8 py-2"
                    onClick={() => void handleResolveRound("rival-response")}
                    disabled={resolving}
                  >
                    {resolving ? "Processing…" : "Confirm Response →"}
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ── RIVAL POPUP ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {rivalPopup && (
            <motion.div
              key="rival-popup"
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="fixed bottom-16 right-4 z-50 max-w-[260px] pointer-events-none"
            >
              <div className="bsc-card p-3 border-[#c9a84c]/40" style={{ background: "rgba(10,12,18,0.95)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: TEAM_COLOR_MAP[rivalPopup.teamColor] ?? rivalPopup.teamColor }}
                  />
                  <p className="text-[9px] font-mono tracking-widest uppercase text-[#6b7280]">League Wire</p>
                </div>
                <p className="font-mono text-xs text-[#e5e7eb] leading-snug">{rivalPopup.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RIVAL TICKER (voting/waiting/outcome phases) ───────────────────── */}
        {(phase === "voting" || phase === "waiting" || phase === "outcome") && (
          <div className="fixed bottom-0 left-0 right-0 z-40 ticker-bar" style={{ background: "#0d1117", borderTop: "1px solid #1a2030" }}>
            {rivalEvents.length > 0 ? (
              <span className="ticker-text text-[#c9a84c]">
                {"LEAGUE WIRE  ·  "}
                {rivalEvents.map((e) => e.message).join("   ·   ")}
                {"   ·   LEAGUE WIRE  ·  "}
                {rivalEvents.map((e) => e.message).join("   ·   ")}
              </span>
            ) : (
              <span className="ticker-text text-[#4b5563]">
                {"LEAGUE WIRE  ·  "}
                {LEAGUE_BANTER[banterIdx]}
                {"   ·   "}
                {LEAGUE_BANTER[(banterIdx + 1) % LEAGUE_BANTER.length]}
                {"   ·   LEAGUE WIRE  ·  "}
                {LEAGUE_BANTER[banterIdx]}
                {"   ·   "}
                {LEAGUE_BANTER[(banterIdx + 1) % LEAGUE_BANTER.length]}
              </span>
            )}
          </div>
        )}

        {/* ── SCORE POP OVERLAY ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {showScorePop && resolveResult?.outcome && resolveResult.outcome.scoreΔ > 0 && (
            <motion.div
              key="score-pop"
              initial={{ opacity: 0, y: 20, scale: 0.7 }}
              animate={{ opacity: 1, y: -60, scale: 1.4 }}
              exit={{ opacity: 0, y: -120, scale: 0.9 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50 select-none text-center"
            >
              <div className="font-mono font-bold text-5xl text-[#22c55e] drop-shadow-lg">
                +{resolveResult.outcome.scoreΔ}
              </div>
              <div className="font-mono text-sm text-[#22c55e]/80 mt-1">
                {getCrowdReaction(resolveResult.outcome.scoreΔ)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── OUTCOME ───────────────────────────────────────────────────────── */}
        {phase === "outcome" && resolveResult?.outcome && (
          <div>
            {/* Breaking news headline */}
            <AnimatePresence>
              {showHeadline && headline && (
                <motion.div
                  key="headline"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="ticker-bar mb-4"
                >
                  <span className="ticker-text text-[#c9a84c] font-bold">
                    {`⚡ BREAKING: ${headline}   ·   ⚡ BREAKING: ${headline}`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mission complete header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="text-[#c9a84c] font-mono text-xs tracking-widest uppercase">{richMission.title}</span>
              <span className="text-[#1a2030]">|</span>
              <motion.span
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="bsc-badge-green"
              >
                Mission Complete
              </motion.span>
            </motion.div>

            {/* Score hero */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bsc-card p-7 mb-4 text-center border-[#22c55e]/25"
            >
              <motion.p
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.32, type: "spring", stiffness: 300, damping: 14 }}
                className={`font-mono text-6xl font-bold mb-2 leading-none ${
                  resolveResult.outcome.scoreΔ >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                }`}
              >
                {resolveResult.outcome.scoreΔ >= 0 ? "+" : ""}{resolveResult.outcome.scoreΔ}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.52 }}
                className="text-[10px] font-mono tracking-widest uppercase text-[#6b7280] mb-4"
              >
                Points Earned
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62 }}
                className="font-mono text-base font-bold text-[#e5e7eb]"
              >
                {resolveResult.outcome.label}
              </motion.p>
            </motion.div>

            {/* Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78 }}
              className="bsc-card p-5 mb-4"
            >
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#6b7280] mb-2">Outcome</p>
              <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{resolveResult.outcome.narrative}</p>
            </motion.div>

            {/* Status badges */}
            {resolveResult.outcome.applyStatus.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="bsc-card p-4 mb-4"
              >
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#6b7280] mb-3">Status Applied</p>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="flex flex-wrap gap-2"
                >
                  {resolveResult.outcome.applyStatus.map((sid) => {
                    const eff = STATUS_EFFECTS[sid];
                    return eff ? (
                      <motion.span
                        key={sid}
                        variants={scalePopIn}
                        className={`text-xs font-mono px-3 py-1 rounded border ${
                          eff.positive
                            ? "bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/30"
                            : "bg-[#ef4444]/10 text-[#ef4444]/80 border-[#ef4444]/25"
                        }`}
                        title={eff.description}
                      >
                        {eff.icon} {eff.label}
                      </motion.span>
                    ) : null;
                  })}
                </motion.div>
              </motion.div>
            )}

            {/* League standings — shows after 1.8s delay */}
            <AnimatePresence>
              {leaderboard && leaderboard.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="bsc-card p-4 mb-4"
                >
                  <p className="bsc-section-title">⚡ League Standings</p>
                  {leaderboard.map((entry, i) => (
                    <motion.div
                      key={entry.teamId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`flex items-center justify-between py-1.5 border-b border-[#1a2030] last:border-0 ${
                        entry.isCurrentTeam ? "-mx-2 px-2 rounded" : ""
                      }`}
                      style={entry.isCurrentTeam ? { background: "rgba(201,168,76,0.05)" } : {}}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#6b7280] w-5">#{entry.rank}</span>
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: TEAM_COLOR_MAP[entry.color] ?? "#6b7280" }}
                        />
                        <span
                          className="font-mono text-xs"
                          style={{ color: entry.isCurrentTeam ? "#c9a84c" : "#e5e7eb", fontWeight: entry.isCurrentTeam ? "bold" : "normal" }}
                        >
                          {entry.teamName}
                        </span>
                        {entry.isCurrentTeam && (
                          <span className="font-mono text-[9px] text-[#c9a84c]">← YOU</span>
                        )}
                      </div>
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color: entry.isCurrentTeam ? "#22c55e" : "#e5e7eb" }}
                      >
                        {entry.score}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.18 }}
              className="space-y-2"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bsc-btn-gold w-full py-3"
                onClick={handleContinue}
              >
                {resolveResult.isGameComplete ? "Claim Your Score →" : `Unlock Concept — ${conceptTitle} →`}
              </motion.button>
              <button className="bsc-btn-ghost w-full py-2 text-xs" onClick={() => router.push("/hq")}>
                Return to HQ
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
    </>
  );
}

// ── Suspense wrapper ───────────────────────────────────────────────────────────

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading mission…</p>
      </div>
    }>
      <PlayInner />
    </Suspense>
  );
}
