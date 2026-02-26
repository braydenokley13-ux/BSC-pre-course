"use client";
import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CONCEPT_CARDS, GLOSSARY_TERMS, getAllGlossaryTerms } from "@/lib/concepts";
import { CONCEPT_CHECKS } from "@/lib/checks";
import { GlossaryPanel } from "@/components/GlossaryPanel";

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
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  const glossaryTermsById = useMemo(() => {
    return new Map(getAllGlossaryTerms().map((term) => [term.id, term]));
  }, []);

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
    router.push("/hq");
  }

  function renderTermChips(termIds: string[]) {
    if (!termIds.length) return null;
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {termIds.map((termId) => {
          const term = glossaryTermsById.get(termId);
          if (!term) return null;
          const selected = selectedTermId === termId;
          return (
            <button
              key={termId}
              type="button"
              onClick={() => setSelectedTermId(termId)}
              className={`px-2 py-1 rounded border font-mono text-[11px] transition-colors ${
                selected
                  ? "border-[#c9a84c] bg-[#c9a84c]/15 text-[#f3e6b0]"
                  : "border-[#1e2435] text-[#9ca3af] hover:border-[#c9a84c]/40"
              }`}
              title={term.def}
            >
              {term.term}
            </button>
          );
        })}
      </div>
    );
  }

  const highlightedTerms = [
    ...card.termIds,
    ...(check.questions[0].termIds ?? []),
    ...(check.questions[1].termIds ?? []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 min-w-0">
          {selectedTermId && glossaryTermsById.get(selectedTermId) && (
            <div className="bsc-card p-3 mb-4 border-[#c9a84c]/40">
              <p className="font-mono text-xs text-[#c9a84c] font-bold mb-1">{glossaryTermsById.get(selectedTermId)?.term}</p>
              <p className="font-mono text-xs text-[#e5e7eb]">{glossaryTermsById.get(selectedTermId)?.def}</p>
            </div>
          )}

          {(phase === "card" || phase === "check" || phase === "result") && (
            <div className="bsc-card p-6 mb-5 border-[#c9a84c]/40">
              <div className="flex items-center justify-between mb-3">
                <p className="bsc-section-title text-[#c9a84c]">Concept Unlocked</p>
                <span className="bsc-badge-gold">New</span>
              </div>
              <h2 className="text-[#c9a84c] font-mono text-xl font-bold mb-3">{card.title}</h2>
              <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed mb-4">{card.body}</p>
              {renderTermChips(card.termIds)}
              <div className="border-t border-[#1e2435] pt-3 mt-4">
                <p className="font-mono text-xs text-[#6b7280] italic">{card.note}</p>
              </div>
            </div>
          )}

          {phase === "card" && (
            <div className="text-center">
              <p className="text-[#e5e7eb] font-mono text-sm mb-4">
                Read the concept, then do a quick 2-question check.
              </p>
              <button className="bsc-btn-gold px-8 py-3" onClick={() => setPhase("check")}>
                Start Check
              </button>
            </div>
          )}

          {phase === "check" && (
            <div className="bsc-card p-6">
              <p className="bsc-section-title mb-4">Quick Check - 2 Questions</p>
              <p className="text-[#6b7280] font-mono text-xs mb-5">
                Get both right to earn the badge. You can retry.
              </p>

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
                {renderTermChips(check.questions[0].termIds)}
              </div>

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
                {renderTermChips(check.questions[1].termIds)}
              </div>

              <button
                className="bsc-btn-gold w-full py-3"
                onClick={handleSubmitCheck}
                disabled={q1 === null || q2 === null || submitting}
              >
                {submitting ? "Checking..." : "Submit Answers"}
              </button>
            </div>
          )}

          {phase === "result" && result && (
            <div className={`bsc-card p-6 border-2 ${result.passed ? "border-[#22c55e]/60" : "border-[#ef4444]/40"}`}>
              <div className="text-center mb-5">
                {result.passed ? (
                  <>
                    <div className="text-[#22c55e] font-mono text-4xl mb-2">✓</div>
                    <h3 className="text-[#22c55e] font-mono font-bold text-lg">Badge Earned</h3>
                    <p className="text-[#6b7280] font-mono text-xs mt-1">
                      {card.title} · Attempt {result.attemptNum}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-[#ef4444] font-mono text-4xl mb-2">✗</div>
                    <h3 className="text-[#ef4444] font-mono font-bold text-lg">Try again</h3>
                    <p className="text-[#6b7280] font-mono text-xs mt-1">
                      Re-read the concept and retry.
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
                  Next Situation
                </button>
              ) : (
                <button className="bsc-btn-ghost w-full py-3" onClick={handleRetry}>
                  Retry Check
                </button>
              )}
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-6">
            <GlossaryPanel
              groups={GLOSSARY_TERMS}
              highlightedTermIds={highlightedTerms}
              onTermSelect={(id) => setSelectedTermId(id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] font-mono text-sm">Loading concept...</p></div>}>
      <CatalogContent />
    </Suspense>
  );
}
