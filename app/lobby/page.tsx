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
      className="inline-block w-2 h-2 rounded-full bg-[#16a34a]"
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
      if (state && data.members.length !== prevCount) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#dc2626] text-sm">{error}</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[#2563eb] text-2xl"
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

  const teamColor = state ? (TEAM_COLOR_MAP[state.team.color ?? ""] ?? "#2563eb") : "#2563eb";

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
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-xs tracking-[0.2em] text-[#64748b] uppercase mb-4 font-medium"
            >
              Your Team Is
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="font-bold text-5xl tracking-tight"
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
          className="text-[#2563eb] text-3xl font-bold mb-2 tracking-tight"
        >
          {state.team.name}
        </motion.h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[#64748b] text-xs">Team Code:</span>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bsc-badge-gold font-mono tracking-widest text-sm px-3 py-1"
          >
            {state.team.joinCode}
          </motion.span>
        </div>
        <p className="text-[#64748b] text-xs mt-2">
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
            <span className="text-[#64748b] text-xs">{state.members.length} joined</span>
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
                className="flex items-center justify-between py-2.5 border-b border-[#e2e8f0] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full font-mono font-bold text-[9px] flex items-center justify-center"
                    style={{ backgroundColor: av.color, color: av.textColor }}
                    title={av.name}
                  >
                    {av.abbr}
                  </span>
                  <span className="text-sm text-[#0f172a]">
                    {m.nickname}
                  </span>
                  {m.id === state.me.id && (
                    <span className="text-[#2563eb] text-[10px] font-medium">(you)</span>
                  )}
                </div>
                <motion.span
                  animate={m.active ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className={`w-2 h-2 rounded-full ${m.active ? "bg-[#16a34a]" : "bg-[#e2e8f0]"}`}
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
            className="text-[#64748b] text-xs mt-3"
          >
            Waiting for teammates to join…
          </motion.p>
        )}
      </motion.div>

      {/* Start section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bsc-card p-6 text-center"
      >
        <p className="text-[#0f172a] text-sm mb-4">
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
        <p className="text-[#64748b] text-xs mt-3">
          {state.activeCount} active now · Auto-refreshes every 5s
        </p>
      </motion.div>

      {/* Countdown overlay */}
      <AnimatePresence>
        {counting && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/90"
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
                  <span className="font-bold text-[#2563eb]" style={{ fontSize: "8rem" }}>
                    {countNum}
                  </span>
                ) : (
                  <div>
                    <span className="font-bold text-[#16a34a]" style={{ fontSize: "6rem" }}>
                      GO!
                    </span>
                    <p className="text-white/70 text-sm mt-2 tracking-widest uppercase">
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
