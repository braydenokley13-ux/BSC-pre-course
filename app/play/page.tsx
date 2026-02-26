"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { MISSIONS } from "@/lib/missions";

type Phase = "scenario" | "voting" | "waiting" | "reveal" | "done";

interface VoteEntry { studentId: string; optionIndex: number }
interface Member { id: string; nickname: string; active: boolean }
interface TeamState {
  team: { id: string; name: string; missionIndex: number; badges: string[]; score: number; completedAt: string | null };
  me: { id: string; nickname: string };
  members: Member[];
  activeCount: number;
  currentMission: typeof MISSIONS[0] | null;
  elapsedSeconds: number;
  votes: VoteEntry[];
  myVote: number | null;
}

interface ResolveResult {
  outcome: number;
  tally: number[];
  narrative: string;
  scoreΔ: number;
  conceptId: string;
  missionId: string;
  isComplete: boolean;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PlayPage() {
  const router = useRouter();
  const [state, setState] = useState<TeamState | null>(null);
  const [phase, setPhase] = useState<Phase>("scenario");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [resolveResult, setResolveResult] = useState<ResolveResult | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const resolvedRef = useRef<string>("");

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) { router.replace("/join"); return; }
      const data: TeamState = await res.json();
      setState(data);

      if (data.team?.completedAt) { router.replace("/complete"); return; }

      // Sync vote state
      const activeIds = data.members.filter((m) => m.active).map((m) => m.id);
      const votedIds = data.votes.map((v) => v.studentId);
      const allVoted = activeIds.length > 0 && activeIds.every((id) => votedIds.includes(id));

      const inVotingPhase =
        phase === "voting" || phase === "waiting" || phase === "scenario";

      if (data.myVote !== null && inVotingPhase && phase !== "waiting") {
        setPhase("waiting");
        setSelectedOption(data.myVote);
      }

      if (allVoted && inVotingPhase && !resolving) {
        const key = `${data.team.missionIndex}-${data.currentMission?.id}`;
        if (resolvedRef.current !== key) {
          resolvedRef.current = key;
          handleResolve();
        }
      }
    } catch {
      setError("Connection error");
    }
  }, [phase, resolving, router]);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 5000);
    return () => clearInterval(id);
  }, [fetchState]);

  async function handleVote(optionIndex: number) {
    setSelectedOption(optionIndex);
    setPhase("waiting");
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIndex }),
      credentials: "include",
    });
  }

  async function handleResolve() {
    if (resolving) return;
    setResolving(true);
    try {
      const res = await fetch("/api/mission/resolve", {
        method: "POST",
        credentials: "include",
      });
      const data: ResolveResult = await res.json();
      setResolveResult(data);
      setPhase("reveal");
    } catch {
      setError("Failed to resolve — try refreshing");
    } finally {
      setResolving(false);
    }
  }

  function handleContinue() {
    if (resolveResult?.isComplete) {
      router.push("/complete");
    } else {
      router.push(`/catalog?concept=${resolveResult?.conceptId}`);
    }
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#ef4444] font-mono text-sm">{error}</p></div>;
  }
  if (!state || !state.currentMission) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading mission…</p></div>;
  }

  const mission = state.currentMission;
  const myVotedOption = state.myVote;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="bsc-badge-gold">Mission {mission.missionNumber}/8</span>
          <span className="text-[#c9a84c] font-mono font-bold">{mission.title}</span>
        </div>
        <div className="flex items-center gap-4 text-[#6b7280] font-mono text-xs">
          <span>Team: {state.team.name}</span>
          <span>⏱ {formatElapsed(state.elapsedSeconds)}</span>
          <span>Score: {state.team.score}</span>
        </div>
      </div>

      {/* Team presence */}
      <div className="flex items-center gap-2 mb-5">
        {state.members.map((m) => (
          <span
            key={m.id}
            className={`font-mono text-xs px-2 py-0.5 rounded border ${
              m.id === state.me.id
                ? "border-[#c9a84c] text-[#c9a84c]"
                : m.active
                ? "border-[#22c55e]/40 text-[#22c55e]"
                : "border-[#1e2435] text-[#6b7280]"
            }`}
          >
            {m.nickname}
            {m.id === state.me.id && " ●"}
          </span>
        ))}
      </div>

      {/* Scenario card */}
      <div className="bsc-card p-5 mb-5">
        <p className="bsc-section-title">Situation</p>
        <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{mission.scenario}</p>
      </div>

      {/* Options */}
      {phase !== "reveal" && (
        <div>
          <p className="bsc-section-title mb-3">
            {phase === "scenario" ? "What do you do? Vote privately — results hidden until all votes are in." :
             phase === "waiting" ? "Waiting for teammates to vote…" : ""}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {((mission as any).options ?? []).map((opt: any, i: number) => {
              const isSelected = myVotedOption === i || selectedOption === i;
              const canVote = phase === "scenario" || (phase === "voting");
              return (
                <button
                  key={i}
                  className={`mission-option text-left w-full ${isSelected ? "selected" : ""} ${phase === "waiting" ? "cursor-default" : ""}`}
                  onClick={() => canVote && handleVote(i)}
                  disabled={phase === "waiting" || phase === "done"}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded border font-mono text-xs flex items-center justify-center mt-0.5 ${isSelected ? "border-[#c9a84c] bg-[#c9a84c] text-black" : "border-[#1e2435] text-[#6b7280]"}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div>
                      <p className="font-mono text-sm text-[#e5e7eb]">{opt.label}</p>
                      <p className="font-mono text-xs text-[#6b7280] mt-0.5">{opt.note}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {phase === "waiting" && (
            <div className="mt-4 text-center">
              <p className="text-[#6b7280] font-mono text-xs animate-pulse">
                {state.votes.length}/{state.activeCount} votes in — waiting for the rest of the team…
              </p>
              {state.votes.length >= state.activeCount && (
                <button className="bsc-btn-gold mt-3" onClick={handleResolve} disabled={resolving}>
                  {resolving ? "Counting votes…" : "Reveal Results →"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reveal */}
      {phase === "reveal" && resolveResult && (
        <div className="animate-fade-in">
          <p className="bsc-section-title mb-3">Vote Results</p>
          <div className="grid grid-cols-1 gap-3 mb-5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {((mission as any).options ?? []).map((opt: any, i: number) => {
              const isWinner = i === resolveResult.outcome;
              const voteCount = resolveResult.tally[i] ?? 0;
              const total = resolveResult.tally.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((voteCount / total) * 100) : 0;
              return (
                <div
                  key={i}
                  className={`mission-option ${isWinner ? "winning" : "losing"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded border font-mono text-xs flex items-center justify-center ${isWinner ? "border-[#22c55e] bg-[#22c55e] text-black" : "border-[#1e2435] text-[#6b7280]"}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-mono text-sm text-[#e5e7eb]">{opt.label}</span>
                    </div>
                    <span className={`font-mono text-xs ${isWinner ? "text-[#22c55e] font-bold" : "text-[#6b7280]"}`}>
                      {voteCount} vote{voteCount !== 1 ? "s" : ""} ({pct}%)
                    </span>
                  </div>
                  {/* Vote bar */}
                  <div className="h-1 bg-[#1e2435] rounded overflow-hidden">
                    <div className={`h-full rounded transition-all duration-500 ${isWinner ? "bg-[#22c55e]" : "bg-[#6b7280]/40"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Narrative */}
          <div className="bsc-card p-5 mb-5 border-[#22c55e]/40">
            <p className="bsc-section-title text-[#22c55e] mb-2">Outcome</p>
            <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">
              {resolveResult.narrative}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="bsc-badge-green">+{resolveResult.scoreΔ} pts</span>
              <span className="text-[#6b7280] font-mono text-xs">Concept Unlocked →</span>
            </div>
          </div>

          <button className="bsc-btn-gold w-full py-3" onClick={handleContinue}>
            Unlock Concept Card →
          </button>
        </div>
      )}
    </div>
  );
}
