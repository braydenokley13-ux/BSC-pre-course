"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CONCEPT_CARDS } from "@/lib/concepts";

interface TeamState {
  team: { name: string; badges: string[]; score: number; missionIndex: number; completedMissions?: string[] };
  me: { nickname: string };
  gameComplete?: boolean;
}

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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading…</p></div>;
  }

  const badges = state.team.badges;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-[#c9a84c] font-mono text-5xl font-bold mb-2">COMPLETE</div>
        <p className="text-[#e5e7eb] font-mono text-lg">
          {state.me.nickname} · Team {state.team.name}
        </p>
        <p className="text-[#6b7280] font-mono text-sm mt-1">
          {(state.team.completedMissions ?? []).length} missions completed · {badges.length} concepts unlocked · {state.team.score} pts
        </p>
      </div>

      {/* Badges earned */}
      <div className="bsc-card p-6 mb-5">
        <p className="bsc-section-title">Concept Badges Earned</p>
        <div className="grid grid-cols-2 gap-3">
          {CONCEPT_CARDS.map((card) => {
            const earned = badges.includes(card.id);
            return (
              <div
                key={card.id}
                className={`p-3 rounded border font-mono text-xs ${
                  earned
                    ? "border-[#c9a84c]/40 bg-[#c9a84c]/5 text-[#c9a84c]"
                    : "border-[#1e2435] text-[#6b7280] opacity-40"
                }`}
              >
                <span className="mr-1">{earned ? "★" : "○"}</span>
                {card.title}
              </div>
            );
          })}
        </div>
      </div>

      {/* Claim code */}
      <div className="bsc-card p-6 text-center">
        <p className="bsc-section-title">Claim Code</p>
        <p className="text-[#6b7280] font-mono text-xs mb-4">
          Submit this code to your instructor to verify your participation.
        </p>

        {!submitted ? (
          <>
            <p className="text-[#e5e7eb] font-mono text-sm mb-4">
              Generate your unique claim code below. Each student gets their own code.
            </p>
            <button
              className="bsc-btn-gold px-8 py-3"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Generating…" : "Generate My Claim Code"}
            </button>
          </>
        ) : (
          <>
            <div className="bsc-card p-4 mb-4 border-[#c9a84c]/60">
              <p className="text-[#c9a84c] font-mono text-2xl font-bold tracking-widest">
                {claimCode}
              </p>
            </div>
            <button className="bsc-btn-ghost px-6 py-2 mb-4" onClick={copyCode}>
              {copied ? "Copied ✓" : "Copy Code"}
            </button>
            <div className="border border-[#22c55e]/40 bg-[#22c55e]/10 rounded px-4 py-3">
              <p className="text-[#22c55e] font-mono text-sm font-bold">Code received ✓</p>
              <p className="text-[#6b7280] font-mono text-xs mt-1">
                Paste this code in your LMS, Zoom chat, or wherever your instructor requests it.
              </p>
            </div>
          </>
        )}
      </div>

      <p className="text-center text-[#6b7280] font-mono text-xs mt-6">
        You'll go deeper on all 8 concepts in the course. The cap math, analytics models, and
        trade mechanics will click much faster now that you've made the decisions yourself.
      </p>
    </div>
  );
}
