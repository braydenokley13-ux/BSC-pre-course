"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { BranchState, MissionNode } from "@/lib/missions";
import { GAME_SITUATION_COUNT } from "@/lib/missions";
import { GLOSSARY_TERMS, getAllGlossaryTerms } from "@/lib/concepts";
import { GlossaryPanel } from "@/components/GlossaryPanel";

type Phase = "scenario" | "waiting" | "runoff" | "reveal" | "done";

interface VoteEntry { studentId: string; optionIndex: number }
interface Member { id: string; nickname: string; active: boolean }
interface RunoffInfo { optionIndexes: number[]; endsAt: string }

interface TeamState {
  team: {
    id: string;
    name: string;
    missionIndex: number;
    currentNodeId: string;
    branchState: BranchState;
    badges: string[];
    score: number;
    completedAt: string | null;
  };
  me: { id: string; nickname: string };
  members: Member[];
  activeCount: number;
  currentMission: MissionNode | null;
  runoff: RunoffInfo | null;
  elapsedSeconds: number;
  votes: VoteEntry[];
  myVote: number | null;
}

interface ResolveRunoffResult {
  requiresRunoff: true;
  runoffOptions: number[];
  runoffEndsAt: string;
}

interface ResolveOutcomeResult {
  outcome: number;
  tally: number[];
  narrative: string;
  scoreΔ: number;
  conceptId: string;
  missionId: string;
  isComplete: boolean;
  nextNodeId: string | null;
  tieBreakMethod?: "majority" | "random-after-runoff";
}

type ResolveResult = ResolveRunoffResult | ResolveOutcomeResult;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function isRunoffResult(input: ResolveResult): input is ResolveRunoffResult {
  return (input as ResolveRunoffResult).requiresRunoff === true;
}

export default function PlayPage() {
  const router = useRouter();
  const [state, setState] = useState<TeamState | null>(null);
  const [phase, setPhase] = useState<Phase>("scenario");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [resolveResult, setResolveResult] = useState<ResolveOutcomeResult | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const [selectedGlossaryTermId, setSelectedGlossaryTermId] = useState<string | null>(null);
  const resolvedRef = useRef<string>("");

  const glossaryTermsById = useMemo(() => {
    return new Map(getAllGlossaryTerms().map((term) => [term.id, term]));
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/join");
        return;
      }

      const data: TeamState = await res.json();
      setState(data);

      if (data.team?.completedAt) {
        router.replace("/complete");
        return;
      }

      const activeIds = data.members.filter((m) => m.active).map((m) => m.id);
      const votedIds = data.votes.map((v) => v.studentId);
      const allActiveVoted = activeIds.length > 0 && activeIds.every((id) => votedIds.includes(id));
      const runoffEndsAtMs = data.runoff ? new Date(data.runoff.endsAt).getTime() : 0;
      const runoffActive = !!data.runoff && runoffEndsAtMs > Date.now();
      const runoffExpired = !!data.runoff && runoffEndsAtMs <= Date.now();

      if (data.myVote !== null && phase !== "waiting" && phase !== "reveal") {
        setPhase("waiting");
        setSelectedOption(data.myVote);
      }

      if (runoffActive && phase !== "reveal" && data.myVote === null) {
        setPhase("runoff");
      }

      if (!runoffActive && phase === "runoff" && data.myVote === null) {
        setPhase("scenario");
      }

      const inVotingPhase = phase === "scenario" || phase === "waiting" || phase === "runoff";
      const shouldResolve = allActiveVoted || runoffExpired;

      if (inVotingPhase && shouldResolve && !resolving && data.currentMission) {
        const key = `${data.team.missionIndex}-${data.currentMission.id}-${data.votes.length}-${runoffActive}`;
        if (resolvedRef.current !== key) {
          resolvedRef.current = key;
          handleResolve();
        }
      }
    } catch {
      setError("Connection issue. Try refreshing.");
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

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIndex }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Vote failed" }));
      setError(data.error ?? "Vote failed");
      setPhase("scenario");
      return;
    }

    fetchState();
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
      if (!res.ok) {
        setError("Could not finish this vote yet.");
        return;
      }

      if (isRunoffResult(data)) {
        setResolveResult(null);
        setSelectedOption(null);
        setPhase("runoff");
        await fetchState();
        return;
      }

      setResolveResult(data);
      setPhase("reveal");
    } catch {
      setError("Could not resolve votes. Refresh and try again.");
    } finally {
      setResolving(false);
    }
  }

  function handleContinue() {
    if (!resolveResult) return;
    if (resolveResult.isComplete) {
      router.push("/complete");
      return;
    }
    router.push(`/catalog?concept=${resolveResult.conceptId}`);
  }

  function renderTermChips(termIds: string[]) {
    if (!termIds.length) return null;
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {termIds.map((termId) => {
          const term = glossaryTermsById.get(termId);
          if (!term) return null;
          const selected = selectedGlossaryTermId === termId;
          return (
            <button
              key={termId}
              type="button"
              className={`px-2 py-1 rounded border font-mono text-[11px] transition-colors ${
                selected
                  ? "border-[#c9a84c] bg-[#c9a84c]/15 text-[#f3e6b0]"
                  : "border-[#1e2435] text-[#9ca3af] hover:border-[#c9a84c]/40"
              }`}
              onClick={() => setSelectedGlossaryTermId(termId)}
              title={term.def}
            >
              {term.term}
            </button>
          );
        })}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#ef4444] font-mono text-sm">{error}</p>
      </div>
    );
  }

  if (!state || !state.currentMission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading situation...</p>
      </div>
    );
  }

  const mission = state.currentMission;
  const myVotedOption = state.myVote;
  const runoffActive = !!state.runoff && new Date(state.runoff.endsAt).getTime() > Date.now();
  const runoffRemaining = runoffActive ? Math.max(0, Math.ceil((new Date(state.runoff!.endsAt).getTime() - Date.now()) / 1000)) : 0;
  const runoffOptions = runoffActive ? state.runoff!.optionIndexes : null;
  const highlightedTerms =
    selectedOption !== null
      ? [...mission.termIds, ...mission.options[selectedOption].termIds]
      : mission.termIds;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="bsc-badge-gold">Situation {mission.step}/{GAME_SITUATION_COUNT}</span>
              <span className="text-[#c9a84c] font-mono font-bold">{mission.title}</span>
            </div>
            <div className="flex items-center gap-4 text-[#6b7280] font-mono text-xs">
              <span>Team: {state.team.name}</span>
              <span>Time: {formatElapsed(state.elapsedSeconds)}</span>
              <span>Score: {state.team.score}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-5 flex-wrap">
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

          {selectedGlossaryTermId && glossaryTermsById.get(selectedGlossaryTermId) && (
            <div className="bsc-card p-3 mb-4 border-[#c9a84c]/40">
              <p className="font-mono text-xs text-[#c9a84c] font-bold mb-1">
                {glossaryTermsById.get(selectedGlossaryTermId)?.term}
              </p>
              <p className="font-mono text-xs text-[#e5e7eb]">
                {glossaryTermsById.get(selectedGlossaryTermId)?.def}
              </p>
            </div>
          )}

          <div className="bsc-card p-5 mb-5">
            <p className="bsc-section-title">Situation</p>
            <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{mission.scenario}</p>
            {renderTermChips(mission.termIds)}
          </div>

          {phase !== "reveal" && (
            <div>
              <p className="bsc-section-title mb-3">
                {phase === "scenario" && "Pick one option. Votes stay hidden until reveal."}
                {phase === "waiting" && "Waiting for teammates to finish voting..."}
                {phase === "runoff" && "Runoff vote: choose between tied options only."}
              </p>

              <div className="grid grid-cols-1 gap-3">
                {mission.options.map((opt, i) => {
                  const isSelected = myVotedOption === i || selectedOption === i;
                  const isRunoffChoice = !runoffOptions || runoffOptions.includes(i);
                  const canVote = (phase === "scenario" || phase === "runoff") && isRunoffChoice;
                  return (
                    <button
                      key={i}
                      className={`mission-option text-left w-full ${isSelected ? "selected" : ""} ${
                        phase === "waiting" ? "cursor-default" : ""
                      } ${runoffOptions && !isRunoffChoice ? "opacity-40" : ""}`}
                      onClick={() => canVote && handleVote(i)}
                      disabled={phase === "waiting" || phase === "done" || !canVote}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded border font-mono text-xs flex items-center justify-center mt-0.5 ${
                            isSelected
                              ? "border-[#c9a84c] bg-[#c9a84c] text-black"
                              : "border-[#1e2435] text-[#6b7280]"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <div>
                          <p className="font-mono text-sm text-[#e5e7eb]">{opt.label}</p>
                          <p className="font-mono text-xs text-[#6b7280] mt-0.5">{opt.note}</p>
                          {renderTermChips(opt.termIds)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {phase === "waiting" && (
                <div className="mt-4 text-center">
                  <p className="text-[#6b7280] font-mono text-xs animate-pulse">
                    {state.votes.length}/{state.activeCount} votes in
                    {runoffActive ? " (runoff round)" : ""}...
                  </p>
                  {runoffActive && (
                    <p className="text-[#c9a84c] font-mono text-xs mt-1">Runoff timer: {runoffRemaining}s</p>
                  )}
                  {state.votes.length >= state.activeCount && (
                    <button className="bsc-btn-gold mt-3" onClick={handleResolve} disabled={resolving}>
                      {resolving ? "Resolving..." : "Reveal Results ->"}
                    </button>
                  )}
                </div>
              )}

              {phase === "runoff" && runoffActive && (
                <div className="mt-4 text-center">
                  <p className="text-[#6b7280] font-mono text-xs">
                    Tied options: {state.runoff?.optionIndexes.map((i) => String.fromCharCode(65 + i)).join(", ")}
                  </p>
                  <p className="text-[#c9a84c] font-mono text-xs mt-1">Runoff ends in {runoffRemaining}s</p>
                </div>
              )}
            </div>
          )}

          {phase === "reveal" && resolveResult && (
            <div className="animate-fade-in">
              <p className="bsc-section-title mb-3">Vote Results</p>
              <div className="grid grid-cols-1 gap-3 mb-5">
                {mission.options.map((opt, i) => {
                  const isWinner = i === resolveResult.outcome;
                  const voteCount = resolveResult.tally[i] ?? 0;
                  const total = resolveResult.tally.reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((voteCount / total) * 100) : 0;
                  return (
                    <div key={i} className={`mission-option ${isWinner ? "winning" : "losing"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded border font-mono text-xs flex items-center justify-center ${
                              isWinner
                                ? "border-[#22c55e] bg-[#22c55e] text-black"
                                : "border-[#1e2435] text-[#6b7280]"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="font-mono text-sm text-[#e5e7eb]">{opt.label}</span>
                        </div>
                        <span className={`font-mono text-xs ${isWinner ? "text-[#22c55e] font-bold" : "text-[#6b7280]"}`}>
                          {voteCount} vote{voteCount !== 1 ? "s" : ""} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1 bg-[#1e2435] rounded overflow-hidden">
                        <div
                          className={`h-full rounded transition-all duration-500 ${isWinner ? "bg-[#22c55e]" : "bg-[#6b7280]/40"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bsc-card p-5 mb-5 border-[#22c55e]/40">
                <p className="bsc-section-title text-[#22c55e] mb-2">Outcome</p>
                <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{resolveResult.narrative}</p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="bsc-badge-green">+{resolveResult.scoreΔ} pts</span>
                  {resolveResult.tieBreakMethod === "random-after-runoff" && (
                    <span className="text-[#f59e0b] font-mono text-xs">Runoff tie broke by random draw.</span>
                  )}
                  <span className="text-[#6b7280] font-mono text-xs">Concept card unlocked</span>
                </div>
              </div>

              <button className="bsc-btn-gold w-full py-3" onClick={handleContinue}>
                Open Concept Card
              </button>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-6">
            <GlossaryPanel
              groups={GLOSSARY_TERMS}
              highlightedTermIds={highlightedTerms}
              title={undefined}
              onTermSelect={(id) => setSelectedGlossaryTermId(id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
