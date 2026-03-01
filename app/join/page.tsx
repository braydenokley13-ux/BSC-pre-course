"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NBA_AVATARS } from "@/lib/nbaAvatars";

type JoinMode = "join" | "recover";

// ── Clean intro splash ───────────────────────────────────────────────────────

function CinematicIntro({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timings = [500, 1100, 1700, 2600];
    const timers = timings.map((t, i) =>
      setTimeout(() => setStep(i + 1), t)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (step >= 4) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  return (
    <AnimatePresence>
      {step < 4 && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          <div className="relative z-10 text-center px-6">
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  key="title"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="font-bold text-[#2563eb] mb-2"
                  style={{ fontSize: "clamp(1.8rem, 6vw, 3rem)", letterSpacing: "-0.02em" }}
                >
                  BOW SPORTS CAPITAL
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {step >= 2 && (
                <motion.p
                  key="sub"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-[#64748b] tracking-widest uppercase text-sm mb-6 font-medium"
                >
                  Front Office Simulator
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {step >= 3 && (
                <motion.p
                  key="tag"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-[#0f172a] text-lg font-semibold"
                >
                  Step into the War Room
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onDone}
            className="absolute top-4 right-6 text-[10px] text-[#94a3b8] hover:text-[#64748b] transition-colors tracking-widest uppercase"
          >
            skip →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Avatar picker ───────────────────────────────────────────────────────────

function AvatarPicker({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <label className="bsc-label">Pick Your Team Logo</label>
      <div className="grid grid-cols-6 gap-1.5 mt-1">
        {NBA_AVATARS.map((av) => (
          <button
            key={av.id}
            type="button"
            onClick={() => onChange(av.id)}
            title={av.name}
            className={`relative flex items-center justify-center rounded-full w-10 h-10 font-mono font-bold text-[9px] transition-all ${
              selected === av.id
                ? "ring-2 ring-[#2563eb] ring-offset-2 ring-offset-white scale-110"
                : "opacity-70 hover:opacity-100 hover:scale-105"
            }`}
            style={{ backgroundColor: av.color, color: av.textColor }}
          >
            {av.abbr}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function JoinPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [mode, setMode] = useState<JoinMode>("join");
  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState("warriors");
  const [joinCode, setJoinCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [issuedRecoveryCode, setIssuedRecoveryCode] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          joinCode: joinCode.trim().toUpperCase(),
          avatarId,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.canRecover) {
          setMode("recover");
          setError(
            "You already have a seat with this nickname. Use the recovery form below to return to that seat."
          );
          return;
        }
        setError(data.error ?? "We could not join your team. Please check your code and try again.");
        return;
      }

      if (data.recoveryCode) {
        setIssuedRecoveryCode(data.recoveryCode as string);
        return;
      }

      router.push("/lobby");
    } catch {
      setError("There was a network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/team/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: joinCode.trim().toUpperCase(),
          nickname: nickname.trim(),
          recoveryCode: recoveryCode.trim(),
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Recovery failed. Please check each field and try again.");
        return;
      }
      router.push("/lobby");
    } catch {
      setError("There was a network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function continueAfterSavingCode() {
    if (!issuedRecoveryCode) return;
    try {
      localStorage.setItem("bsc-latest-recovery-code", issuedRecoveryCode);
      localStorage.setItem(
        "bsc-latest-recovery-meta",
        JSON.stringify({
          nickname: nickname.trim(),
          joinCode: joinCode.trim().toUpperCase(),
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // no-op if storage is not available
    }
    router.push("/lobby");
  }

  return (
    <>
      {/* Intro overlay */}
      {showIntro && <CinematicIntro onDone={() => setShowIntro(false)} />}

      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="text-[#2563eb] font-bold text-4xl mb-3 tracking-tight">
              GM Seat
            </div>
            <p className="text-[#64748b] text-sm leading-relaxed">
              Enter your team with your join code, or recover your original seat if you lost access.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="bsc-card p-6"
          >
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                className={`bsc-btn-ghost text-xs py-2 ${mode === "join" ? "border-[#2563eb]/40 text-[#0f172a] bg-[#eff6ff]" : ""}`}
                onClick={() => {
                  setMode("join");
                  setError("");
                }}
                type="button"
              >
                Join Team
              </button>
              <button
                className={`bsc-btn-ghost text-xs py-2 ${mode === "recover" ? "border-[#2563eb]/40 text-[#0f172a] bg-[#eff6ff]" : ""}`}
                onClick={() => {
                  setMode("recover");
                  setError("");
                }}
                type="button"
              >
                Recover Seat
              </button>
            </div>

            <form onSubmit={mode === "join" ? handleJoin : handleRecover} className="space-y-4">
              <div>
                <label className="bsc-label" htmlFor="nickname">
                  Your Nickname
                </label>
                <input
                  id="nickname"
                  className="bsc-input"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="Enter the same nickname you use in class."
                  maxLength={24}
                  required
                />
              </div>

              {/* Avatar picker — join mode only */}
              {mode === "join" && (
                <AvatarPicker selected={avatarId} onChange={setAvatarId} />
              )}

              <div>
                <label className="bsc-label" htmlFor="joinCode">
                  Team Join Code
                </label>
                <input
                  id="joinCode"
                  className="bsc-input font-mono uppercase tracking-widest"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  placeholder="Enter your team code from your instructor."
                  maxLength={10}
                  required
                />
              </div>

              {mode === "recover" && (
                <div>
                  <label className="bsc-label" htmlFor="recoveryCode">
                    Recovery Code
                  </label>
                  <input
                    id="recoveryCode"
                    className="bsc-input font-mono uppercase tracking-widest"
                    value={recoveryCode}
                    onChange={(event) => setRecoveryCode(event.target.value.toUpperCase())}
                    placeholder="Enter your saved recovery code."
                    maxLength={12}
                    required
                  />
                </div>
              )}

              {error && (
                <div className="border border-[#fecaca] bg-[#fef2f2] rounded-md px-3 py-2">
                  <p className="text-[#dc2626] text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="bsc-btn-gold w-full py-3"
                disabled={
                  loading ||
                  !nickname.trim() ||
                  !joinCode.trim() ||
                  (mode === "recover" && !recoveryCode.trim())
                }
              >
                {loading
                  ? mode === "join"
                    ? "Joining..."
                    : "Recovering..."
                  : mode === "join"
                  ? "Join Team and Continue →"
                  : "Recover My Seat →"}
              </button>
            </form>

            <p className="text-[#64748b] text-xs mt-4 leading-relaxed">
              Save your recovery code when it appears. It is the safest way to get back in if your
              browser cookie or device changes.
            </p>
          </motion.div>

          <p className="text-center text-[#64748b] text-xs mt-4">
            Instructor?{" "}
            <a href="/teacher" className="text-[#2563eb] hover:underline">
              Open teacher dashboard →
            </a>
          </p>
        </div>

        <AnimatePresence>
          {issuedRecoveryCode && (
            <motion.div
              className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bsc-card p-6 w-full max-w-md"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
              >
                <p className="bsc-section-title mb-2">Save This Recovery Code</p>
                <p className="text-[#64748b] text-xs mb-3">
                  Write this down now. Use it to recover your seat if you lose access later.
                </p>
                <div className="border border-[#bfdbfe] bg-[#eff6ff] rounded-md px-3 py-3 mb-4">
                  <p className="text-[#2563eb] font-mono text-2xl tracking-widest text-center">
                    {issuedRecoveryCode}
                  </p>
                </div>
                <button className="bsc-btn-gold w-full py-3" onClick={continueAfterSavingCode}>
                  I Saved My Code. Continue →
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
