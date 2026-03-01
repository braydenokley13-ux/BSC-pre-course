"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CONCEPT_CARDS, GLOSSARY_TERMS } from "@/lib/concepts";
import { GlossaryPanel } from "@/components/GlossaryPanel";

type CheckPhase = "card" | "adaptive" | "result";

interface AdaptiveQuestionPayload {
  id: string;
  stem: string;
  options: [string, string, string, string];
}

interface AdaptiveStartResponse {
  attemptId: string;
  question: AdaptiveQuestionPayload;
  askedCount: number;
  minQuestions: number;
  maxQuestions: number;
  currentEstimate: {
    masteryScore: number;
    uncertainty: number;
  };
}

interface AdaptiveContinueResponse {
  done: false;
  askedCount: number;
  minQuestions: number;
  maxQuestions: number;
  currentEstimate: {
    masteryScore: number;
    uncertainty: number;
  };
  nextQuestion: AdaptiveQuestionPayload;
}

interface AdaptiveDoneResponse {
  done: true;
  masteryScore: number;
  uncertainty: number;
  questionCount: number;
  objectiveBreakdown: Array<{
    objectiveId: string;
    askedCount: number;
    correctCount: number;
    missRate: number;
  }>;
  misconceptionsTop: Array<{ tag: string; count: number }>;
  recommendationBand: "heavy" | "medium" | "light";
  lowConfidence: boolean;
}

type AdaptiveAnswerResponse = AdaptiveContinueResponse | AdaptiveDoneResponse;

const staggerList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" as const } },
};

function recommendationText(band: "heavy" | "medium" | "light"): string {
  if (band === "heavy") return "Teach this concept heavily in class.";
  if (band === "medium") return "Review this concept with guided practice.";
  return "Light review is enough for this concept.";
}

function recommendationColor(band: "heavy" | "medium" | "light"): string {
  if (band === "heavy") return "text-[#ef4444]";
  if (band === "medium") return "text-[#2563eb]";
  return "text-[#16a34a]";
}

function CatalogContent() {
  const router = useRouter();
  const params = useSearchParams();
  const conceptId = params.get("concept") ?? "";

  const card = useMemo(() => CONCEPT_CARDS.find((c) => c.id === conceptId), [conceptId]);
  const [phase, setPhase] = useState<CheckPhase>("card");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestionPayload | null>(null);
  const [currentEstimate, setCurrentEstimate] = useState<{ masteryScore: number; uncertainty: number } | null>(null);
  const [askedCount, setAskedCount] = useState(0);
  const [minQuestions, setMinQuestions] = useState(3);
  const [maxQuestions, setMaxQuestions] = useState(7);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<AdaptiveDoneResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAdaptive, setLoadingAdaptive] = useState(false);
  const [error, setError] = useState("");
  const [track, setTrack] = useState("201");

  useEffect(() => {
    fetch("/api/team/state", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d?.track) setTrack(d.track as string); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPhase("card");
    setAttemptId(null);
    setCurrentQuestion(null);
    setCurrentEstimate(null);
    setAskedCount(0);
    setSelectedOption(null);
    setResult(null);
    setError("");
  }, [conceptId]);

  async function startAdaptiveAttempt() {
    if (!card) return;
    setError("");
    setLoadingAdaptive(true);
    try {
      const res = await fetch("/api/catalog/adaptive/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conceptId: card.id }),
      });
      const data = (await res.json()) as AdaptiveStartResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not start adaptive assessment.");
        return;
      }

      setAttemptId(data.attemptId);
      setCurrentQuestion(data.question);
      setAskedCount(data.askedCount);
      setMinQuestions(data.minQuestions);
      setMaxQuestions(data.maxQuestions);
      setCurrentEstimate(data.currentEstimate);
      setSelectedOption(null);
      setPhase("adaptive");
    } catch {
      setError("Network error while starting adaptive assessment.");
    } finally {
      setLoadingAdaptive(false);
    }
  }

  async function submitAdaptiveAnswer() {
    if (!attemptId || !currentQuestion || selectedOption == null || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/catalog/adaptive/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          attemptId,
          questionId: currentQuestion.id,
          selectedIndex: selectedOption,
        }),
      });
      const data = (await res.json()) as (AdaptiveAnswerResponse & { error?: string });
      if (!res.ok) {
        setError(data.error ?? "Could not submit answer.");
        return;
      }

      if (data.done) {
        setResult(data);
        setPhase("result");
        return;
      }

      setAskedCount(data.askedCount);
      setCurrentQuestion(data.nextQuestion);
      setCurrentEstimate(data.currentEstimate);
      setMinQuestions(data.minQuestions);
      setMaxQuestions(data.maxQuestions);
      setSelectedOption(null);
    } catch {
      setError("Network error while submitting answer.");
    } finally {
      setSubmitting(false);
    }
  }

  async function startRetake() {
    setPhase("card");
    setResult(null);
    setAttemptId(null);
    setCurrentQuestion(null);
    setSelectedOption(null);
    await startAdaptiveAttempt();
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#ef4444] font-mono text-sm">Unknown concept: {conceptId}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-5">
        <div className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bsc-card p-0 sticky top-[80px] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e2e8f0]">
              <p className="font-mono text-[10px] tracking-widest uppercase text-[#2563eb]">GM Case Files</p>
              <p className="font-mono text-[9px] text-[#64748b] mt-0.5">Adaptive Assessment</p>
            </div>
            <motion.ul variants={staggerList} initial="hidden" animate="show" className="py-2">
              {CONCEPT_CARDS.map((concept) => {
                const isCurrent = concept.id === conceptId;
                return (
                  <motion.li key={concept.id} variants={fadeSlideUp}>
                    <button
                      onClick={() => router.push(`/catalog?concept=${concept.id}`)}
                      className={`w-full text-left px-4 py-2.5 transition-colors font-mono text-xs flex items-center gap-2 ${
                        isCurrent
                          ? "bg-[#eff6ff] text-[#2563eb] border-l-2 border-[#2563eb]"
                          : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] border-l-2 border-transparent"
                      }`}
                    >
                      <span className="text-[10px]">{isCurrent ? "▶" : "◦"}</span>
                      <span className="leading-tight">{concept.title}</span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <motion.div
            key={conceptId + "-header"}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="bsc-card p-4 mb-4 border-[#2563eb]/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#2563eb] border border-[#2563eb]/30 px-2 py-0.5 rounded">
                  Classification: GM Only
                </span>
                <span className="bsc-badge-gold">Adaptive Mode</span>
              </div>
              <button
                className="text-[#64748b] font-mono text-xs hover:text-[#0f172a] transition-colors"
                onClick={() => router.push("/hq")}
              >
                ← HQ
              </button>
            </div>
            <h2 className="text-[#2563eb] font-mono text-xl font-bold leading-tight">{card.title}</h2>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={conceptId + "-card"}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bsc-card p-6 mb-4 relative overflow-hidden gm-watermark"
            >
              <p className="font-mono text-sm text-[#0f172a] leading-relaxed mb-5">{card.body}</p>
              <div className="border-t border-[#e2e8f0] pt-4">
                <p className="font-mono text-xs text-[#64748b] italic">{card.note}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="border border-[#ef4444]/40 bg-[#ef4444]/10 rounded px-3 py-2 mb-4">
              <p className="text-[#ef4444] font-mono text-xs">{error}</p>
            </div>
          )}

          {phase === "card" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-4"
            >
              <p className="text-[#64748b] font-mono text-sm mb-4">
                Start an adaptive check. You will answer between {minQuestions} and {maxQuestions} questions.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bsc-btn-gold px-8 py-3"
                onClick={startAdaptiveAttempt}
                disabled={loadingAdaptive}
              >
                {loadingAdaptive ? "Loading..." : "Start Adaptive Check →"}
              </motion.button>
            </motion.div>
          )}

          <AnimatePresence>
            {phase === "adaptive" && currentQuestion && (
              <motion.div
                key="adaptive-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="bsc-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <p className="bsc-section-title mb-0">Adaptive Assessment</p>
                  <div className="flex-1 h-px bg-[#dbeafe]" />
                  <span className="text-[10px] font-mono text-[#64748b]">
                    Question {askedCount} of up to {maxQuestions}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="font-mono text-sm text-[#0f172a] mb-2">{currentQuestion.stem}</p>
                  {currentEstimate && (
                    <p className="font-mono text-[11px] text-[#64748b]">
                      Current estimate: {currentEstimate.masteryScore.toFixed(2)} / 4.00
                    </p>
                  )}
                </div>

                <motion.div variants={staggerList} initial="hidden" animate="show" className="space-y-2 mb-6">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      variants={fadeSlideUp}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left px-3 py-2.5 rounded border font-mono text-sm transition-colors ${
                        selectedOption === index
                          ? "border-[#2563eb] bg-[#eff6ff] text-[#0f172a]"
                          : "border-[#e2e8f0] text-[#64748b] hover:border-[#2563eb]/40 hover:text-[#0f172a]"
                      }`}
                      onClick={() => setSelectedOption(index)}
                    >
                      <span className="text-[#64748b] mr-2">{index + 1}.</span>
                      {option}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.button
                  whileHover={selectedOption !== null ? { scale: 1.02 } : {}}
                  whileTap={selectedOption !== null ? { scale: 0.98 } : {}}
                  className="bsc-btn-gold w-full py-3"
                  onClick={submitAdaptiveAnswer}
                  disabled={selectedOption === null || submitting}
                >
                  {submitting ? "Saving..." : "Submit and Continue →"}
                </motion.button>
                <p className="text-[#64748b] font-mono text-[11px] mt-2">
                  Answers are scored at the end so we can estimate understanding more accurately.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === "result" && result && (
              <motion.div
                key="result-panel"
                initial={{ opacity: 0, scale: 0.97, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="bsc-card p-6 border-2 border-[#2563eb]/40"
              >
                <div className="text-center mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
                    className="text-[#2563eb] font-mono text-5xl mb-3"
                  >
                    ◎
                  </motion.div>
                  <h3 className="text-[#0f172a] font-mono font-bold text-lg">Adaptive Summary Complete</h3>
                  <p className="text-[#64748b] font-mono text-xs mt-1">
                    {result.questionCount} questions · Mastery {result.masteryScore.toFixed(2)} / 4.00
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="border border-[#e2e8f0] rounded px-3 py-3">
                    <p className="text-[#64748b] font-mono text-xs">Recommendation Band</p>
                    <p className={`font-mono text-sm mt-1 ${recommendationColor(result.recommendationBand)}`}>
                      {result.recommendationBand.toUpperCase()}
                    </p>
                    <p className="text-[#64748b] font-mono text-xs mt-1">
                      {recommendationText(result.recommendationBand)}
                    </p>
                  </div>
                  <div className="border border-[#e2e8f0] rounded px-3 py-3">
                    <p className="text-[#64748b] font-mono text-xs">Confidence</p>
                    <p className="font-mono text-sm mt-1 text-[#0f172a]">
                      {result.lowConfidence ? "Lower confidence estimate" : "Stable estimate"}
                    </p>
                    <p className="text-[#64748b] font-mono text-xs mt-1">
                      Uncertainty: {result.uncertainty.toFixed(2)}
                    </p>
                  </div>
                </div>

                {result.objectiveBreakdown.length > 0 && (
                  <div className="border border-[#e2e8f0] rounded px-3 py-3 mb-4">
                    <p className="text-[#64748b] font-mono text-xs mb-2">Objective Breakdown</p>
                    <div className="space-y-1">
                      {result.objectiveBreakdown.slice(0, 4).map((item) => (
                        <p key={item.objectiveId} className="text-[#64748b] font-mono text-xs">
                          {item.objectiveId}: {item.correctCount}/{item.askedCount} correct · {item.missRate}% miss
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {result.misconceptionsTop.length > 0 && (
                  <div className="border border-[#e2e8f0] rounded px-3 py-3 mb-4">
                    <p className="text-[#64748b] font-mono text-xs mb-2">Top Misconceptions</p>
                    <div className="space-y-1">
                      {result.misconceptionsTop.slice(0, 3).map((row) => (
                        <p key={row.tag} className="text-[#64748b] font-mono text-xs">
                          {row.tag}: {row.count}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button className="bsc-btn-gold w-full py-3" onClick={() => router.push("/hq")}>
                    Continue to HQ →
                  </button>
                  <button className="bsc-btn-ghost w-full py-3" onClick={startRetake}>
                    Retake Adaptive Check
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-56 flex-shrink-0 hidden xl:block sticky top-[80px] max-h-[80vh] overflow-y-auto">
          <GlossaryPanel
            groups={GLOSSARY_TERMS}
            track={track}
            title={`Cap Glossary${track === "101" ? " (Track 101)" : ""}`}
          />
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="text-[#64748b] font-mono text-sm p-6">Loading...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
