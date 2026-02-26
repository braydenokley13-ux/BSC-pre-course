"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CONCEPT_CARDS, GLOSSARY_TERMS } from "@/lib/concepts";
import { CONCEPT_CHECKS } from "@/lib/checks";

type CheckPhase = "card" | "check" | "result";
interface CheckResult { q1Correct: boolean; q2Correct: boolean; passed: boolean; attemptNum: number }

// ── Stagger variants ───────────────────────────────────────────────────────────

const staggerList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" as const } },
};

// ── Catalog main content ───────────────────────────────────────────────────────

function CatalogContent() {
  const router = useRouter();
  const params = useSearchParams();
  const conceptId = params.get("concept") ?? "";

  const card = CONCEPT_CARDS.find((c) => c.id === conceptId);
  const check = CONCEPT_CHECKS.find((c) => c.conceptId === conceptId);

  const [phase, setPhase] = useState<CheckPhase>("card");
  const [q1, setQ1] = useState<number | null>(null);
  const [q2, setQ2] = useState<number | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  // Reset state when conceptId changes
  useEffect(() => {
    setPhase("card");
    setQ1(null);
    setQ2(null);
    setResult(null);
    setFeedbackVisible(false);
  }, [conceptId]);

  if (!card || !check) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#ef4444] font-mono text-sm">Unknown concept: {conceptId}</p>
      </div>
    );
  }

  async function handleSubmitCheck() {
    if (q1 === null || q2 === null) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/catalog/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptId, q1Answer: q1, q2Answer: q2 }),
        credentials: "include",
      });
      const data: CheckResult = await res.json();
      setResult(data);
      setPhase("result");
      setFeedbackVisible(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setQ1(null);
    setQ2(null);
    setResult(null);
    setFeedbackVisible(false);
    setPhase("check");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-5">
        {/* ── LEFT PANEL: Dossier sidebar ──────────────────────────────────── */}
        <div className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bsc-card p-0 sticky top-[80px] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1a2030]">
              <p className="font-mono text-[10px] tracking-widest uppercase text-[#c9a84c]">GM Case Files</p>
              <p className="font-mono text-[9px] text-[#6b7280] mt-0.5">Classified Intelligence</p>
            </div>
            <motion.ul
              variants={staggerList}
              initial="hidden"
              animate="show"
              className="py-2"
            >
              {CONCEPT_CARDS.map((c) => {
                const isCurrent = c.id === conceptId;
                return (
                  <motion.li
                    key={c.id}
                    variants={fadeSlideUp}
                  >
                    <button
                      onClick={() => router.push(`/catalog?concept=${c.id}`)}
                      className={`w-full text-left px-4 py-2.5 transition-colors font-mono text-xs flex items-center gap-2 ${
                        isCurrent
                          ? "bg-[#c9a84c]/10 text-[#c9a84c] border-l-2 border-[#c9a84c]"
                          : "text-[#6b7280] hover:text-[#e5e7eb] hover:bg-[#1a2030]/50 border-l-2 border-transparent"
                      }`}
                    >
                      <span className="text-[10px]">
                        {isCurrent ? "▶" : "◦"}
                      </span>
                      <span className="leading-tight">{c.title}</span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>
        </div>

        {/* ── RIGHT PANEL: Active file ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* File header */}
          <motion.div
            key={conceptId + "-header"}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="bsc-card p-4 mb-4 border-[#c9a84c]/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5 rounded">
                  Classification: GM Only
                </span>
                <span className="bsc-badge-gold">Active File</span>
              </div>
              <button
                className="text-[#6b7280] font-mono text-xs hover:text-[#e5e7eb] transition-colors"
                onClick={() => router.push("/hq")}
              >
                ← HQ
              </button>
            </div>
            <h2 className="text-[#c9a84c] font-mono text-xl font-bold leading-tight">
              {card.title}
            </h2>
          </motion.div>

          {/* Concept card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={conceptId + "-card"}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bsc-card p-6 mb-4 relative overflow-hidden gm-watermark"
            >
              <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed mb-5">{card.body}</p>
              <div className="border-t border-[#1a2030] pt-4">
                <p className="font-mono text-xs text-[#6b7280] italic">{card.note}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── PHASE: card → proceed to check ─────────────────────────────── */}
          {phase === "card" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-4"
            >
              <p className="text-[#6b7280] font-mono text-sm mb-4">
                Study the file above, then verify your intelligence.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bsc-btn-gold px-8 py-3"
                onClick={() => setPhase("check")}
              >
                Verify Intelligence →
              </motion.button>
            </motion.div>
          )}

          {/* ── PHASE: check ────────────────────────────────────────────────── */}
          <AnimatePresence>
            {phase === "check" && (
              <motion.div
                key="check-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="bsc-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <p className="bsc-section-title mb-0">Verify Intelligence</p>
                  <div className="flex-1 h-px bg-[#c9a84c]/20" />
                  <span className="text-[10px] font-mono text-[#6b7280]">2 questions · unlimited retries</span>
                </div>

                {/* Q1 */}
                <div className="mb-6">
                  <p className="font-mono text-sm text-[#e5e7eb] mb-3">
                    <span className="text-[#c9a84c] font-bold">Q1.</span> {check.questions[0].question}
                  </p>
                  <motion.div
                    variants={staggerList}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    {check.questions[0].options.map((opt, i) => (
                      <motion.button
                        key={i}
                        variants={fadeSlideUp}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full text-left px-3 py-2.5 rounded border font-mono text-sm transition-colors ${
                          q1 === i
                            ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#e5e7eb]"
                            : "border-[#1a2030] text-[#6b7280] hover:border-[#c9a84c]/40 hover:text-[#e5e7eb]"
                        }`}
                        onClick={() => setQ1(i)}
                      >
                        <span className="text-[#6b7280] mr-2">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>

                {/* Q2 */}
                <div className="mb-6">
                  <p className="font-mono text-sm text-[#e5e7eb] mb-3">
                    <span className="text-[#c9a84c] font-bold">Q2.</span> {check.questions[1].question}
                  </p>
                  <motion.div
                    variants={staggerList}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    {check.questions[1].options.map((opt, i) => (
                      <motion.button
                        key={i}
                        variants={fadeSlideUp}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full text-left px-3 py-2.5 rounded border font-mono text-sm transition-colors ${
                          q2 === i
                            ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#e5e7eb]"
                            : "border-[#1a2030] text-[#6b7280] hover:border-[#c9a84c]/40 hover:text-[#e5e7eb]"
                        }`}
                        onClick={() => setQ2(i)}
                      >
                        <span className="text-[#6b7280] mr-2">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>

                <motion.button
                  whileHover={q1 !== null && q2 !== null ? { scale: 1.02 } : {}}
                  whileTap={q1 !== null && q2 !== null ? { scale: 0.98 } : {}}
                  className="bsc-btn-gold w-full py-3"
                  onClick={handleSubmitCheck}
                  disabled={q1 === null || q2 === null || submitting}
                >
                  {submitting ? "Checking…" : "File My Report →"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── PHASE: result ───────────────────────────────────────────────── */}
          <AnimatePresence>
            {phase === "result" && result && feedbackVisible && (
              <motion.div
                key="result-panel"
                initial={{ opacity: 0, scale: 0.97, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className={`bsc-card p-6 border-2 ${result.passed ? "border-[#22c55e]/50" : "border-[#ef4444]/40"}`}
              >
                <div className="text-center mb-5">
                  {result.passed ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
                        className="text-[#22c55e] font-mono text-5xl mb-3"
                      >
                        ✓
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="text-[#22c55e] font-mono font-bold text-lg"
                      >
                        Intelligence Confirmed
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.38 }}
                        className="text-[#6b7280] font-mono text-xs mt-1"
                      >
                        {card.title} · Attempt {result.attemptNum}
                      </motion.p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 14, delay: 0.1 }}
                        className="text-[#ef4444] font-mono text-5xl mb-3"
                      >
                        ✗
                      </motion.div>
                      <h3 className="text-[#ef4444] font-mono font-bold text-lg">Unconfirmed</h3>
                      <p className="text-[#6b7280] font-mono text-xs mt-1">
                        Re-read the file above and try again.
                      </p>
                    </>
                  )}
                </div>

                <motion.div
                  variants={staggerList}
                  initial="hidden"
                  animate="show"
                  className="space-y-2 mb-5"
                >
                  {[
                    { correct: result.q1Correct, label: "Question 1" },
                    { correct: result.q2Correct, label: "Question 2" },
                  ].map(({ correct, label }) => (
                    <motion.div
                      key={label}
                      variants={fadeSlideUp}
                      className={`flex items-center gap-2 font-mono text-sm ${correct ? "text-[#22c55e]" : "text-[#ef4444]"}`}
                    >
                      <span>{correct ? "✓" : "✗"}</span>
                      <span>{label}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {result.passed ? (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bsc-btn-gold w-full py-3"
                    onClick={() => router.push("/hq")}
                  >
                    Next Mission →
                  </motion.button>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bsc-btn-ghost w-full py-3"
                    onClick={handleRetry}
                  >
                    Try Again
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FAR RIGHT: Glossary sidebar ──────────────────────────────────── */}
        <div className="w-56 flex-shrink-0 hidden xl:block">
          <div className="bsc-card sticky top-[80px] max-h-[80vh] overflow-y-auto">
            <button
              className="flex items-center justify-between w-full px-4 py-3 border-b border-[#1a2030]"
              onClick={() => setGlossaryOpen(!glossaryOpen)}
            >
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#6b7280]">Cap Glossary</span>
              <motion.span
                animate={{ rotate: glossaryOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-[#6b7280] text-xs"
              >
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {!glossaryOpen ? (
                <motion.div
                  key="closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-3"
                >
                  <p className="text-[#6b7280] font-mono text-xs leading-relaxed">
                    30 terms across Cap Rules, Contracts, Trades, and Analytics.
                  </p>
                  <button
                    onClick={() => setGlossaryOpen(true)}
                    className="text-[#c9a84c] font-mono text-xs mt-2 hover:underline"
                  >
                    Expand →
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 space-y-4">
                    {GLOSSARY_TERMS.map((group) => (
                      <div key={group.group}>
                        <p className="text-[#c9a84c] font-mono text-[10px] font-bold mb-2 tracking-widest uppercase">
                          {group.group}
                        </p>
                        {group.terms.map((t) => (
                          <div key={t.term} className="mb-2">
                            <p className="font-mono text-xs text-[#e5e7eb] font-semibold">{t.term}</p>
                            <p className="font-mono text-[10px] text-[#6b7280] leading-relaxed">{t.def}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading concept…</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
