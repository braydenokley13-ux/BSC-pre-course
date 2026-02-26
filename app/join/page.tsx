"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function JoinPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<"nickname" | "joinCode" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), joinCode: joinCode.trim().toUpperCase() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to join");
        return;
      }
      router.push("/lobby");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4">
      <div className="w-full max-w-md">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={mounted ? {
              textShadow: [
                "0 0 8px rgba(201,168,76,0.2)",
                "0 0 24px rgba(201,168,76,0.5)",
                "0 0 8px rgba(201,168,76,0.2)",
              ],
            } : {}}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-[#c9a84c] font-mono text-5xl font-bold mb-3 tracking-widest"
          >
            GM SEAT
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="text-[#6b7280] font-mono text-sm leading-relaxed"
          >
            You&apos;re about to run a front office. 8 decisions stand between you and a championship.
          </motion.p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bsc-card p-6"
        >
          <p className="bsc-section-title">Join Your Team</p>

          <form onSubmit={handleJoin} className="space-y-5">
            {/* Nickname field */}
            <div className="relative">
              <motion.label
                animate={{
                  y: focused === "nickname" || nickname ? -20 : 0,
                  scale: focused === "nickname" || nickname ? 0.82 : 1,
                  color: focused === "nickname" ? "#c9a84c" : "#6b7280",
                  originX: 0,
                }}
                transition={{ duration: 0.18 }}
                htmlFor="nickname"
                className="absolute left-3 top-2.5 font-mono text-xs pointer-events-none origin-left"
                style={{ transformOrigin: "left" }}
              >
                Your Name
              </motion.label>
              <input
                id="nickname"
                className="bsc-input pt-5 pb-2"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onFocus={() => setFocused("nickname")}
                onBlur={() => setFocused(null)}
                placeholder={focused === "nickname" ? "e.g. Jordan, LeBron, Giannis" : ""}
                maxLength={24}
                required
                autoFocus
              />
            </div>

            {/* Join code field */}
            <div className="relative">
              <motion.label
                animate={{
                  y: focused === "joinCode" || joinCode ? -20 : 0,
                  scale: focused === "joinCode" || joinCode ? 0.82 : 1,
                  color: focused === "joinCode" ? "#c9a84c" : "#6b7280",
                  originX: 0,
                }}
                transition={{ duration: 0.18 }}
                htmlFor="joinCode"
                className="absolute left-3 top-2.5 font-mono text-xs pointer-events-none origin-left"
                style={{ transformOrigin: "left" }}
              >
                Team Code
              </motion.label>
              <input
                id="joinCode"
                className="bsc-input pt-5 pb-2 uppercase tracking-widest"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onFocus={() => setFocused("joinCode")}
                onBlur={() => setFocused(null)}
                placeholder={focused === "joinCode" ? "e.g. LAKERS7" : ""}
                maxLength={8}
                required
              />
              <p className="text-[#6b7280] font-mono text-[10px] mt-1.5 ml-1">
                Get this from your instructor or breakout room chat
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="border border-[#ef4444]/40 bg-[#ef4444]/8 rounded px-3 py-2"
                  style={{ background: "rgba(239,68,68,0.06)" }}
                >
                  <p className="text-[#ef4444] font-mono text-xs">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={!loading && nickname.trim() && joinCode.trim() ? { scale: 1.02 } : {}}
              whileTap={!loading && nickname.trim() && joinCode.trim() ? { scale: 0.98 } : {}}
              className="bsc-btn-gold w-full py-3"
              disabled={loading || !nickname.trim() || !joinCode.trim()}
            >
              {loading ? "Joining…" : "Enter the Front Office →"}
            </motion.button>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center text-[#6b7280] font-mono text-xs mt-4"
        >
          Instructor?{" "}
          <a href="/teacher" className="text-[#c9a84c] hover:underline">
            Open teacher dashboard →
          </a>
        </motion.p>
      </div>
    </div>
  );
}
