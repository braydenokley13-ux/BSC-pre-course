"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAvatar } from "@/lib/nbaAvatars";

interface Member {
  id: string;
  nickname: string;
  active: boolean;
  avatarId?: string;
}

const TEAM_COLOR_MAP: Record<string, string> = {
  blue: "#3b82f6", gold: "#c9a84c", purple: "#7c3aed", red: "#ef4444",
  green: "#22c55e", teal: "#14b8a6", orange: "#f97316", black: "#6b7280",
};

interface TeamState {
  team: { id: string; name: string; joinCode: string; color?: string; missionIndex: number; completedAt: string | null };
  me: { id: string; nickname: string };
  members: Member[];
  activeCount: number;
  completedMissions?: string[];
}

function PulsingDot() {
  return (
    <motion.span
      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
      transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
      className="inline-block w-2 h-2 rounded-full bg-[#22c55e]"
    />
  );
}

export default function LobbyPage() {
  const router = useRouter();
  const [state, setState] = useState<TeamState | null>(null);
  const [error, setError] = useState("");
  const [prevCount, setPrevCount] = useState(0);
  const [counting, setCounting] = useState(false);
  const [countNum, setCountNum] = useState(3);
  const [showReveal, setShowReveal] = useState(false);
  const [joinToast, setJoinToast] = useState<string | null>(null);
  const [teamFull, setTeamFull] = useState(false);
  const [rivalTeams, setRivalTeams] = useState<Array<{ color: string; codePrefix: string; memberCount: number }>>([]);
  const hasRevealedRef = useRef(false);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) { router.replace("/join"); return; }
      const data = await res.json();
      if (data.team?.completedAt) { router.replace("/complete"); return; }
      if (data.team?.missionIndex > 0 || (data.completedMissions?.length ?? 0) > 0) {
        router.replace("/hq");
        return;
      }

      // Detect new member joins and celebrate
      if (state && data.members.length > prevCount) {
        const newMember = data.members.find(
          (m: Member) => !state.members.some((e) => e.id === m.id)
        );
        if (newMember && newMember.id !== state.me.id) {
          setJoinToast(newMember.nickname);
          setTimeout(() => setJoinToast(null), 2800);
        }
        if (data.members.length === 4 && prevCount < 4) {
          setTeamFull(true);
          setTimeout(() => setTeamFull(false), 2000);
        }
        setPrevCount(data.members.length);
      } else if (state && data.members.length !== prevCount) {
        setPrevCount(data.members.length);
      }

      setState(data);
    } catch {
      setError("Connection error");
    }
  }, [router, state, prevCount]);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 5000);
    return () => clearInterval(id);
  }, [fetchState]);

  useEffect(() => {
    if (!state || hasRevealedRef.current) return;
    hasRevealedRef.current = true;
    setShowReveal(true);
    setTimeout(() => setShowReveal(false), 2400);
  }, [state]);

  useEffect(() => {
    async function fetchRivalTeams() {
      try {
        const res = await fetch("/api/session/teams-status", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json() as { teams: Array<{ color: string; codePrefix: string; memberCount: number }> };
        setRivalTeams(data.teams ?? []);
      } catch { /* silent */ }
    }
    void fetchRivalTeams();
    const id = setInterval(() => void fetchRivalTeams(), 8000);
    return () => clearInterval(id);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#ef4444] font-mono text-sm">{error}</p>
      </div>
    );
  }

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

  const canStart = state.activeCount >= 1;

  function handleEnterHQ() {
    setCounting(true);
    setCountNum(3);
    let n = 3;
    const tick = () => {
      n -= 1;
      if (n > 0) {
        setCountNum(n);
        setTimeout(tick, 700);
      } else {
        setCountNum(0); // "GO!"
        setTimeout(() => router.push("/hq"), 600);
      }
    };
    setTimeout(tick, 700);
  }

  const teamColor = state ? (TEAM_COLOR_MAP[state.team.color ?? ""] ?? "#c9a84c") : "#c9a84c";

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Team reveal overlay */}
      <AnimatePresence>
        {showReveal && state && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020408]"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="font-mono text-xs tracking-[0.3em] text-[#c9a84c] uppercase mb-4"
            >
              Your Team Is
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="font-mono font-bold text-5xl tracking-widest"
              style={{ color: teamColor }}
            >
              {state.team.name}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bsc-card p-6 mb-4 text-center"
      >
        <p className="bsc-section-title">Your Team</p>
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.05em" }}
          animate={{ opacity: 1, letterSpacing: "0.1em" }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-[#c9a84c] font-mono text-3xl font-bold mb-2"
        >
          {state.team.name}
        </motion.h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[#6b7280] font-mono text-xs">Team Code:</span>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bsc-badge-gold font-mono tracking-widest text-sm px-3 py-1"
          >
            {state.team.joinCode}
          </motion.span>
        </div>
        <p className="text-[#6b7280] font-mono text-xs mt-2">
          Share this code with your teammates in Zoom chat
        </p>
      </motion.div>

      {/* Roster */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bsc-card p-6 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="bsc-section-title mb-0">Roster</p>
          <div className="flex items-center gap-2">
            <PulsingDot />
            <span className="text-[#6b7280] font-mono text-xs">{state.members.length} joined</span>
          </div>
        </div>

        <motion.div className="space-y-0">
          <AnimatePresence initial={false}>
            {state.members.map((m, i) => {
              const av = getAvatar(m.avatarId ?? "hawks");
              return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -16, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 16, height: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="flex items-center justify-between py-2.5 border-b border-[#1a2030] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full font-mono font-bold text-[9px] flex items-center justify-center"
                    style={{ backgroundColor: av.color, color: av.textColor }}
                    title={av.name}
                  >
                    {av.abbr}
                  </span>
                  <span className="font-mono text-sm text-[#e5e7eb]">
                    {m.nickname}
                  </span>
                  {m.id === state.me.id && (
                    <span className="text-[#c9a84c] font-mono text-[10px]">(you)</span>
                  )}
                </div>
                <motion.span
                  animate={m.active ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className={`w-2 h-2 rounded-full ${m.active ? "bg-[#22c55e]" : "bg-[#1a2030]"}`}
                />
              </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {state.members.length < 2 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#6b7280] font-mono text-xs mt-3"
          >
            Waiting for teammates to join…
          </motion.p>
        )}
      </motion.div>

      {/* League Activity */}
      {rivalTeams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bsc-card p-4 mb-4"
        >
          <p className="bsc-section-title mb-3">League Activity</p>
          <div className="space-y-2">
            {rivalTeams.map((t, i) => {
              const hex = TEAM_COLOR_MAP[t.color] ?? "#6b7280";
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: hex, boxShadow: `0 0 6px ${hex}80` }} />
                  <span className="font-mono text-[11px] text-[#6b7280] flex-1">
                    Team <span className="text-[#9ca3af]">{t.codePrefix}••</span>
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, s) => (
                      <div
                        key={s}
                        className="w-3.5 h-3.5 rounded-sm border"
                        style={s < t.memberCount
                          ? { background: `${hex}30`, borderColor: hex }
                          : { background: "transparent", borderColor: "#1a2030" }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: hex }}>
                    {t.memberCount}/4
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Start section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bsc-card p-6 text-center"
      >
        <p className="text-[#e5e7eb] font-mono text-sm mb-4">
          8 missions. 8 concepts. One front office philosophy.
        </p>
        {canStart ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bsc-btn-gold w-full py-3"
            onClick={handleEnterHQ}
            disabled={counting}
          >
            Enter Front Office HQ →
          </motion.button>
        ) : (
          <button className="bsc-btn-ghost w-full py-3 cursor-not-allowed opacity-50" disabled>
            Waiting for teammates to join…
          </button>
        )}
        <p className="text-[#6b7280] font-mono text-xs mt-3">
          {state.activeCount} active now · Auto-refreshes every 5s
        </p>
      </motion.div>

      {/* Teammate join toast */}
      <AnimatePresence>
        {joinToast && (
          <motion.div
            key="join-toast"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bsc-card px-5 py-3 flex items-center gap-3 border-[#22c55e]/40"
              style={{ background: "rgba(13,17,32,0.96)" }}>
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: 2, duration: 0.4 }}
                className="text-[#22c55e] font-mono font-bold text-sm"
              >
                +1
              </motion.span>
              <p className="font-mono text-sm text-[#e5e7eb]">
                <span className="text-[#22c55e] font-bold">{joinToast}</span>{" "}
                entered the war room
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team assembled overlay */}
      <AnimatePresence>
        {teamFull && (
          <motion.div
            key="team-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020408]/85"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bsc-card p-10 text-center"
              style={{ boxShadow: "0 0 0 1px rgba(201,168,76,0.5), 0 0 40px rgba(201,168,76,0.12)" }}
            >
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#c9a84c] mb-4"
              >
                ◈ Full Roster
              </motion.p>
              <p className="font-mono font-bold text-[#e5e7eb] text-2xl tracking-widest mb-2">
                TEAM ASSEMBLED
              </p>
              <p className="font-mono text-xs text-[#6b7280]">
                All four executives are in the building.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown overlay */}
      <AnimatePresence>
        {counting && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020408]/90"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={countNum}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="text-center select-none"
              >
                {countNum > 0 ? (
                  <span className="font-mono font-bold text-[#c9a84c]" style={{ fontSize: "8rem" }}>
                    {countNum}
                  </span>
                ) : (
                  <div>
                    <span className="font-mono font-bold text-[#22c55e]" style={{ fontSize: "6rem" }}>
                      GO!
                    </span>
                    <p className="font-mono text-[#6b7280] text-sm mt-2 tracking-widest uppercase">
                      Entering Front Office HQ…
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
