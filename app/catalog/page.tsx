"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CONCEPT_CARDS, GLOSSARY_TERMS } from "@/lib/concepts";
import { CONCEPT_CHECKS } from "@/lib/checks";

type CheckPhase = "card" | "check" | "result";
interface CheckResult { q1Correct: boolean; q2Correct: boolean; passed: boolean; attemptNum: number }

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
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setQ1(null);
    setQ2(null);
    setResult(null);
    setPhase("check");
  }

  function handleContinue() {
    router.push("/play");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Concept Card */}
          {(phase === "card" || phase === "check" || phase === "result") && (
            <div className="bsc-card p-6 mb-5 border-[#c9a84c]/40">
              <div className="flex items-center justify-between mb-3">
                <p className="bsc-section-title text-[#c9a84c]">Concept Unlocked</p>
                <span className="bsc-badge-gold">New</span>
              </div>
              <h2 className="text-[#c9a84c] font-mono text-xl font-bold mb-3">{card.title}</h2>
              <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed mb-4">{card.body}</p>
              <div className="border-t border-[#1e2435] pt-3">
                <p className="font-mono text-xs text-[#6b7280] italic">{card.note}</p>
              </div>
            </div>
          )}

          {/* Check Phase */}
          {phase === "card" && (
            <div className="text-center">
              <p className="text-[#e5e7eb] font-mono text-sm mb-4">
                Read the concept above, then take a quick 2-question check to earn your badge.
              </p>
              <button className="bsc-btn-gold px-8 py-3" onClick={() => setPhase("check")}>
                Take the Check →
              </button>
            </div>
          )}

          {phase === "check" && (
            <div className="bsc-card p-6">
              <p className="bsc-section-title mb-4">Quick Check — 2 Questions</p>
              <p className="text-[#6b7280] font-mono text-xs mb-5">
                Both questions must be correct to earn the badge. Unlimited retries.
              </p>

              {/* Q1 */}
              <div className="mb-6">
                <p className="font-mono text-sm text-[#e5e7eb] mb-3">
                  <span className="text-[#c9a84c]">Q1.</span> {check.questions[0].question}
                </p>
                <div className="space-y-2">
                  {check.questions[0].options.map((opt, i) => (
                    <button
                      key={i}
                      className={`w-full text-left px-3 py-2 rounded border font-mono text-sm transition-colors ${
                        q1 === i
                          ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#e5e7eb]"
                          : "border-[#1e2435] text-[#6b7280] hover:border-[#c9a84c]/40 hover:text-[#e5e7eb]"
                      }`}
                      onClick={() => setQ1(i)}
                    >
                      <span className="text-[#6b7280] mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2 */}
              <div className="mb-6">
                <p className="font-mono text-sm text-[#e5e7eb] mb-3">
                  <span className="text-[#c9a84c]">Q2.</span> {check.questions[1].question}
                </p>
                <div className="space-y-2">
                  {check.questions[1].options.map((opt, i) => (
                    <button
                      key={i}
                      className={`w-full text-left px-3 py-2 rounded border font-mono text-sm transition-colors ${
                        q2 === i
                          ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#e5e7eb]"
                          : "border-[#1e2435] text-[#6b7280] hover:border-[#c9a84c]/40 hover:text-[#e5e7eb]"
                      }`}
                      onClick={() => setQ2(i)}
                    >
                      <span className="text-[#6b7280] mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="bsc-btn-gold w-full py-3"
                onClick={handleSubmitCheck}
                disabled={q1 === null || q2 === null || submitting}
              >
                {submitting ? "Checking…" : "Submit Answers"}
              </button>
            </div>
          )}

          {phase === "result" && result && (
            <div className={`bsc-card p-6 border-2 ${result.passed ? "border-[#22c55e]/60" : "border-[#ef4444]/40"}`}>
              <div className="text-center mb-5">
                {result.passed ? (
                  <>
                    <div className="text-[#22c55e] font-mono text-4xl mb-2">✓</div>
                    <h3 className="text-[#22c55e] font-mono font-bold text-lg">Badge Earned!</h3>
                    <p className="text-[#6b7280] font-mono text-xs mt-1">
                      {card.title} · Attempt {result.attemptNum}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-[#ef4444] font-mono text-4xl mb-2">✗</div>
                    <h3 className="text-[#ef4444] font-mono font-bold text-lg">Not quite</h3>
                    <p className="text-[#6b7280] font-mono text-xs mt-1">
                      Re-read the concept card above and try again.
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2 mb-5">
                <div className={`flex items-center gap-2 font-mono text-sm ${result.q1Correct ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  <span>{result.q1Correct ? "✓" : "✗"}</span>
                  <span>Question 1</span>
                </div>
                <div className={`flex items-center gap-2 font-mono text-sm ${result.q2Correct ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  <span>{result.q2Correct ? "✓" : "✗"}</span>
                  <span>Question 2</span>
                </div>
              </div>

              {result.passed ? (
                <button className="bsc-btn-gold w-full py-3" onClick={handleContinue}>
                  Next Mission →
                </button>
              ) : (
                <button className="bsc-btn-ghost w-full py-3" onClick={handleRetry}>
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>

        {/* Glossary sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <div className="bsc-card p-4 sticky top-6 max-h-[80vh] overflow-y-auto">
            <button
              className="flex items-center justify-between w-full mb-3"
              onClick={() => setGlossaryOpen(!glossaryOpen)}
            >
              <span className="bsc-section-title mb-0">Cap Glossary (30)</span>
              <span className="text-[#6b7280] text-xs">{glossaryOpen ? "▲" : "▼"}</span>
            </button>
            {glossaryOpen &&
              GLOSSARY_TERMS.map((group) => (
                <div key={group.group} className="mb-4">
                  <p className="text-[#c9a84c] font-mono text-xs font-bold mb-2">{group.group}</p>
                  {group.terms.map((t) => (
                    <div key={t.term} className="mb-2">
                      <p className="font-mono text-xs text-[#e5e7eb] font-semibold">{t.term}</p>
                      <p className="font-mono text-xs text-[#6b7280] leading-relaxed">{t.def}</p>
                    </div>
                  ))}
                </div>
              ))}
            {!glossaryOpen && (
              <p className="text-[#6b7280] font-mono text-xs">
                30 terms across Cap Rules, Contracts, Trades, and Analytics.
                Click to expand.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] font-mono text-sm">Loading concept…</p></div>}>
      <CatalogContent />
    </Suspense>
  );
}
