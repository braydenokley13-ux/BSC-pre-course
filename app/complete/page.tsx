"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CONCEPT_CARDS } from "@/lib/concepts";

interface TeamState {
  team: { name: string; badges: string[]; score: number; missionIndex: number; completedMissions?: string[]; completedAt?: string | null };
  me: { nickname: string };
  gameComplete?: boolean;
}

// ── Animated score counter ─────────────────────────────────────────────────────

function ScoreCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (target === 0) return;
    const duration = 1800; // ms
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

// ── Main ───────────────────────────────────────────────────────────────────────

export default function CompletePage() {
  const router = useRouter();
  const [state, setState] = useState<TeamState | null>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

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
    load();
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
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

      {/* Badge grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bsc-card p-6 mb-5"
      >
        <p className="bsc-section-title mb-4">Concept Badges Earned</p>
        <motion.div
          className="grid grid-cols-2 gap-3"
        >
          {CONCEPT_CARDS.map((card, i) => {
            const earned = badges.includes(card.id);
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 1.0 + i * 0.08,
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
        transition={{ delay: 1.1 }}
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
        transition={{ delay: 1.3 }}
        className="text-center text-[#6b7280] font-mono text-xs mt-6 leading-relaxed"
      >
        You'll go deeper on all 8 concepts in the course. The cap math, analytics models, and
        trade mechanics will click much faster now that you've made the decisions yourself.
      </motion.p>
    </div>
  );
}
