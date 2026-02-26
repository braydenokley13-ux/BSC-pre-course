"use client";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMissionById, isLegacyMission, Mission, MissionRound } from "@/lib/missions";
import { STATUS_EFFECTS } from "@/lib/statusEffects";
import { CONCEPT_CARDS } from "@/lib/concepts";

// ── Types ────────────────────────────────────────────────────────────────────

type MissionPhase =
  | "loading"
  | "briefing"
  | "voting"
  | "waiting"
  | "rival-alert"
  | "rival-voting"
  | "rival-waiting"
  | "outcome"
  | "error";

interface MemberInfo { id: string; nickname: string; active: boolean; role: string | null }
interface MissionRoundState {
  missionId?: string;
  currentRoundId?: string;
  completedRounds?: Array<{ roundId: string; winningOptionId: string; winningTags: string[] }>;
  allTags?: string[];
  rivalFired?: boolean;
  isResolved?: boolean;
}
interface TeamStateResponse {
  team: { id: string; name: string; score: number };
  me: { id: string; nickname: string; role: string | null };
  members: MemberInfo[];
  activeCount: number;
  missionRoundState: MissionRoundState;
  votes: Array<{ studentId: string; optionIndex: number }>;
}

interface ResolveResult {
  roundId: string;
  winningOptionId: string;
  winningTags: string[];
  tally: number[];
  rivalFired: boolean;
  rivalMessage?: string;
  rivalResponseRound?: MissionRound;
  nextRoundId?: string | null;
  nextRound?: MissionRound;
  isComplete: boolean;
  outcome?: {
    label: string;
    narrative: string;
    scoreΔ: number;
    applyStatus: string[];
    newTeamStatus: string[];
  };
  conceptId?: string;
  missionId?: string;
  isGameComplete?: boolean;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoleTag({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded border tracking-widest uppercase bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/30">
      {title}
    </span>
  );
}

function InfoCardReveal({
  title,
  content,
  delay,
  isRoleRestricted,
}: {
  title: string;
  content: string;
  delay: number;
  isRoleRestricted?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) {
    return (
      <div className="bsc-card p-3 opacity-30 border-dashed">
        <p className="font-mono text-xs text-[#6b7280] animate-pulse">Incoming briefing…</p>
      </div>
    );
  }
  return (
    <div className={`card-reveal bsc-card p-4 ${isRoleRestricted ? "role-card-active" : ""}`}>
      {isRoleRestricted && (
        <p className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1 opacity-70">
          ◈ Role-Restricted — Your Eyes Only
        </p>
      )}
      <p className="text-[10px] font-mono tracking-widest uppercase text-[#6b7280] mb-1">{title}</p>
      <p className="font-mono text-xs text-[#e5e7eb] leading-relaxed">{content}</p>
    </div>
  );
}

// ── Main inner component ──────────────────────────────────────────────────────

function PlayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const missionId = params.get("missionId") ?? "";

  const mission = missionId ? getMissionById(missionId) : null;
  const isLegacy = mission ? isLegacyMission(mission) : false;

  const [phase, setPhase] = useState<MissionPhase>("loading");
  const [teamState, setTeamState] = useState<TeamStateResponse | null>(null);
  const [currentRound, setCurrentRound] = useState<MissionRound | null>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [resolveResult, setResolveResult] = useState<ResolveResult | null>(null);
  const [rivalMessage, setRivalMessage] = useState<string>("");
  const [rivalRound, setRivalRound] = useState<MissionRound | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const missionStarted = useRef(false);
  const resolvedRef = useRef<string>("");

  useEffect(() => {
    if (!missionId) { router.replace("/hq"); return; }
    if (mission && isLegacy) { router.replace("/hq"); return; }
  }, [missionId, mission, isLegacy, router]);

  const startMission = useCallback(async () => {
    if (missionStarted.current) return;
    missionStarted.current = true;
    try {
      const res = await fetch("/api/mission/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setError(err.error ?? "Failed to start mission");
        setPhase("error");
        return;
      }
      const data = (await res.json()) as { currentRound: MissionRound };
      setCurrentRound(data.currentRound);
      setPhase("briefing");
    } catch {
      setError("Network error starting mission");
      setPhase("error");
    }
  }, [missionId]);

  const fetchState = useCallback(async () => {
    if (!missionId) return;
    try {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) { router.replace("/join"); return; }
      const data: TeamStateResponse = await res.json();
      setTeamState(data);

      const rsm = data.missionRoundState;

      // Need to start the mission?
      if (rsm?.missionId !== missionId && !missionStarted.current) {
        await startMission();
        return;
      }

      // Already resolved — nothing to do in poll (outcome phase handles it)
      if (rsm?.isResolved && rsm?.missionId === missionId) return;

      // Auto-resolve when all active members have voted
      if (phase === "waiting" || phase === "rival-waiting") {
        const roundId =
          phase === "rival-waiting" ? "rival-response" : (rsm?.currentRoundId ?? "");
        const votedIds = data.votes.map((v) => v.studentId);
        const activeIds = data.members.filter((m) => m.active).map((m) => m.id);
        const allVoted =
          activeIds.length > 0 && activeIds.every((id) => votedIds.includes(id));
        if (allVoted && !resolving) {
          const key = `${missionId}-${roundId}`;
          if (resolvedRef.current !== key) {
            resolvedRef.current = key;
            await handleResolveRound(roundId);
          }
        }
      }
    } catch {
      // silent
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId, phase, resolving, startMission, router]);

  useEffect(() => {
    void fetchState();
    const id = setInterval(() => void fetchState(), 4000);
    return () => clearInterval(id);
  }, [fetchState]);

  async function handleVote(optionIdx: number) {
    if (!currentRound) return;
    setSelectedOptionIdx(optionIdx);
    setPhase("waiting");
    try {
      const res = await fetch("/api/mission/vote-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, roundId: currentRound.id, optionIndex: optionIdx }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch {
      setPhase("voting");
      setSelectedOptionIdx(null);
    }
  }

  async function handleRivalVote(optionIdx: number) {
    setSelectedOptionIdx(optionIdx);
    setPhase("rival-waiting");
    try {
      const res = await fetch("/api/mission/vote-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, roundId: "rival-response", optionIndex: optionIdx }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch {
      setPhase("rival-voting");
      setSelectedOptionIdx(null);
    }
  }

  async function handleResolveRound(roundId: string) {
    if (resolving) return;
    setResolving(true);
    try {
      const res = await fetch("/api/mission/resolve-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, roundId }),
        credentials: "include",
      });
      const data: ResolveResult = await res.json();
      setResolveResult(data);

      if (data.rivalFired && data.rivalResponseRound) {
        setRivalMessage(data.rivalMessage ?? "");
        setRivalRound(data.rivalResponseRound);
        setSelectedOptionIdx(null);
        setPhase("rival-alert");
        return;
      }
      if (data.isComplete) { setPhase("outcome"); return; }
      if (data.nextRound) {
        setCurrentRound(data.nextRound);
        setSelectedOptionIdx(null);
        setPhase("voting");
      }
    } catch {
      setError("Failed to resolve round — try refreshing");
      setPhase("error");
    } finally {
      setResolving(false);
    }
  }

  function handleContinue() {
    if (resolveResult?.isGameComplete) { router.push("/complete"); return; }
    if (resolveResult?.conceptId) { router.push(`/catalog?concept=${resolveResult.conceptId}`); return; }
    router.push("/hq");
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!missionId || !mission || isLegacy) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Redirecting…</p>
      </div>
    );
  }
  if (phase === "error") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-[#ef4444] font-mono text-sm mb-4">{error}</p>
          <button className="bsc-btn-ghost" onClick={() => router.push("/hq")}>← Back to HQ</button>
        </div>
      </div>
    );
  }
  if (phase === "loading" || !teamState) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Entering the building…</p>
      </div>
    );
  }

  const richMission = mission as Mission;
  const { me, members, activeCount } = teamState;
  const myRole = richMission.roles.find((r) => r.id === me.role) ?? null;
  const myInfoCards = richMission.infoCards.filter(
    (c) => !c.roleOnly || c.roleOnly === me.role
  );
  const conceptTitle =
    CONCEPT_CARDS.find((c) => c.id === richMission.conceptId)?.title ?? richMission.conceptId;

  // ── Briefing ──────────────────────────────────────────────────────────────

  if (phase === "briefing") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-5">
          <button className="text-[#6b7280] font-mono text-xs hover:text-[#e5e7eb]" onClick={() => router.push("/hq")}>
            ← HQ
          </button>
          <span className="text-[#1e2435]">|</span>
          <span className="text-[#c9a84c] font-mono text-xs tracking-widest uppercase">{richMission.department}</span>
          <span className="text-[#1e2435]">|</span>
          <span className="text-[#e5e7eb] font-mono text-sm font-bold">{richMission.title}</span>
        </div>

        <div className="bsc-card p-5 mb-4">
          <p className="bsc-section-title">Situation</p>
          <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{richMission.scenario}</p>
        </div>

        {myRole && (
          <div className="bsc-card p-4 mb-4 role-card-active border-[#c9a84c]/30">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-2">Your Role</p>
            <p className="font-mono text-sm font-bold text-[#e5e7eb] mb-1">{myRole.title}</p>
            <p className="font-mono text-xs text-[#6b7280] mb-3">{myRole.description}</p>
            <div className="border-t border-[#c9a84c]/20 pt-3 private-reveal">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1 opacity-70">◈ Private Intelligence</p>
              <p className="font-mono text-xs text-[#e5e7eb] leading-relaxed">{myRole.privateInfo}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {members.map((m) => (
            <span
              key={m.id}
              className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                m.id === me.id ? "border-[#c9a84c] text-[#c9a84c]"
                : m.active ? "border-[#22c55e]/30 text-[#22c55e]"
                : "border-[#1e2435] text-[#6b7280]"
              }`}
            >
              {m.nickname}
              {m.role && <span className="opacity-60 ml-1">({m.role})</span>}
              {m.id === me.id && " ●"}
            </span>
          ))}
        </div>

        <div className="space-y-3 mb-5">
          {myInfoCards.map((card) => (
            <InfoCardReveal
              key={card.title}
              title={card.title}
              content={card.content}
              delay={card.revealDelay}
              isRoleRestricted={!!card.roleOnly}
            />
          ))}
        </div>

        <button
          className="bsc-btn-gold w-full py-3"
          onClick={() => { if (currentRound) setPhase("voting"); }}
          disabled={!currentRound}
        >
          {currentRound ? "I've Read the Briefing — Begin Voting →" : "Preparing mission…"}
        </button>
      </div>
    );
  }

  // ── Voting / waiting ──────────────────────────────────────────────────────

  if ((phase === "voting" || phase === "waiting") && currentRound) {
    const votedIds = teamState.votes.map((v) => v.studentId);
    const activeIds = members.filter((m) => m.active).map((m) => m.id);
    const votedCount = activeIds.filter((id) => votedIds.includes(id)).length;
    const canReveal = votedCount >= activeCount && activeCount > 0;

    return (
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in round-enter">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button className="text-[#6b7280] font-mono text-xs hover:text-[#e5e7eb]" onClick={() => setPhase("briefing")}>← Briefing</button>
            <span className="text-[#1e2435]">|</span>
            <span className="text-[#c9a84c] font-mono text-xs tracking-widest uppercase">{richMission.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {myRole && <RoleTag title={myRole.title} />}
            <span className="text-[#6b7280] font-mono text-xs">{votedCount}/{activeCount} voted</span>
          </div>
        </div>

        <div className="bsc-card p-4 mb-4">
          <p className="bsc-section-title">Decision Point</p>
          <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{currentRound.prompt}</p>
          {currentRound.context && (
            <p className="font-mono text-xs text-[#6b7280] mt-2 leading-relaxed border-t border-[#1e2435] pt-2">
              {currentRound.context}
            </p>
          )}
        </div>

        <div className="space-y-3 mb-5">
          {currentRound.options.map((opt, i) => {
            const isSelected = selectedOptionIdx === i;
            const disabled = phase === "waiting";
            return (
              <button
                key={opt.id}
                className={`mission-option text-left w-full ${isSelected ? "selected" : ""} ${disabled ? "cursor-default" : ""}`}
                onClick={() => !disabled && void handleVote(i)}
                disabled={disabled}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded border font-mono text-xs flex items-center justify-center mt-0.5 ${isSelected ? "border-[#c9a84c] bg-[#c9a84c] text-black" : "border-[#1e2435] text-[#6b7280]"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div>
                    <p className="font-mono text-sm text-[#e5e7eb]">{opt.label}</p>
                    <p className="font-mono text-xs text-[#6b7280] mt-0.5 leading-relaxed">{opt.description}</p>
                    {opt.requiresStatus && (
                      <p className="font-mono text-[10px] text-[#c9a84c] mt-1">
                        Requires: {STATUS_EFFECTS[opt.requiresStatus]?.label ?? opt.requiresStatus}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {phase === "waiting" && (
          <div className="text-center">
            <p className="text-[#6b7280] font-mono text-xs animate-pulse mb-3">
              {votedCount}/{activeCount} votes in — waiting for teammates…
            </p>
            {canReveal && (
              <button className="bsc-btn-gold" onClick={() => void handleResolveRound(currentRound.id)} disabled={resolving}>
                {resolving ? "Counting…" : "Reveal Results →"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Rival alert ───────────────────────────────────────────────────────────

  if (phase === "rival-alert") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
        <div className="ticker-bar mb-4">
          <span className="ticker-text">⚡ BREAKING — LEAGUE DEVELOPMENT ALERT &nbsp;&nbsp;&nbsp; ⚡ BREAKING — LEAGUE DEVELOPMENT ALERT</span>
        </div>
        <div className="rival-alert bsc-card p-5 mb-5">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#ef4444] mb-2">Rival Move Detected</p>
          <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{rivalMessage}</p>
        </div>
        {rivalRound && (
          <button className="bsc-btn-gold w-full py-3" onClick={() => { setCurrentRound(rivalRound); setSelectedOptionIdx(null); setPhase("rival-voting"); }}>
            Respond →
          </button>
        )}
      </div>
    );
  }

  // ── Rival voting / waiting ────────────────────────────────────────────────

  if ((phase === "rival-voting" || phase === "rival-waiting") && rivalRound) {
    const votedIds = teamState.votes.map((v) => v.studentId);
    const activeIds = members.filter((m) => m.active).map((m) => m.id);
    const votedCount = activeIds.filter((id) => votedIds.includes(id)).length;
    const canReveal = votedCount >= activeCount && activeCount > 0;

    return (
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in round-enter">
        <div className="ticker-bar mb-4">
          <span className="ticker-text">RIVAL RESPONSE REQUIRED — FRONT OFFICE DECISION PENDING</span>
        </div>
        <div className="flex items-center justify-between mb-5">
          <span className="text-[#ef4444] font-mono text-xs tracking-widest uppercase">⚡ Responding to Rival Move</span>
          <span className="text-[#6b7280] font-mono text-xs">{votedCount}/{activeCount} voted</span>
        </div>
        <div className="bsc-card p-4 mb-4">
          <p className="bsc-section-title">How do you respond?</p>
          <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{rivalRound.prompt}</p>
        </div>
        <div className="space-y-3 mb-5">
          {rivalRound.options.map((opt, i) => {
            const isSelected = selectedOptionIdx === i;
            const disabled = phase === "rival-waiting";
            return (
              <button
                key={opt.id}
                className={`mission-option text-left w-full ${isSelected ? "selected" : ""} ${disabled ? "cursor-default" : ""}`}
                onClick={() => !disabled && void handleRivalVote(i)}
                disabled={disabled}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded border font-mono text-xs flex items-center justify-center mt-0.5 ${isSelected ? "border-[#c9a84c] bg-[#c9a84c] text-black" : "border-[#1e2435] text-[#6b7280]"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div>
                    <p className="font-mono text-sm text-[#e5e7eb]">{opt.label}</p>
                    <p className="font-mono text-xs text-[#6b7280] mt-0.5 leading-relaxed">{opt.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {phase === "rival-waiting" && (
          <div className="text-center">
            <p className="text-[#6b7280] font-mono text-xs animate-pulse mb-3">{votedCount}/{activeCount} responses in…</p>
            {canReveal && (
              <button className="bsc-btn-gold" onClick={() => void handleResolveRound("rival-response")} disabled={resolving}>
                {resolving ? "Processing…" : "Confirm Response →"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Outcome ───────────────────────────────────────────────────────────────

  if (phase === "outcome" && resolveResult?.outcome) {
    const { outcome } = resolveResult;
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[#c9a84c] font-mono text-xs tracking-widest uppercase">{richMission.title}</span>
          <span className="text-[#1e2435]">|</span>
          <span className="bsc-badge-green">Mission Complete</span>
        </div>

        <div className="bsc-card p-5 mb-4 border-[#22c55e]/30">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#22c55e] mb-2">Outcome</p>
          <p className="font-mono text-sm font-bold text-[#e5e7eb] mb-3">{outcome.label}</p>
          <p className="font-mono text-sm text-[#e5e7eb] leading-relaxed">{outcome.narrative}</p>
        </div>

        <div className="bsc-card p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#6b7280] mb-1">Points Earned</p>
              <p className="score-pop text-[#22c55e] font-mono text-2xl font-bold">+{outcome.scoreΔ}</p>
            </div>
            {outcome.applyStatus.length > 0 && (
              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#6b7280] mb-1">Status Applied</p>
                <div className="flex flex-wrap gap-1 justify-end">
                  {outcome.applyStatus.map((sid) => {
                    const eff = STATUS_EFFECTS[sid];
                    return eff ? (
                      <span key={sid} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${eff.positive ? "bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/30" : "bg-[#ef4444]/10 text-[#ef4444]/70 border-[#ef4444]/25"}`} title={eff.description}>
                        {eff.icon} {eff.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="bsc-btn-gold w-full py-3 mb-2" onClick={handleContinue}>
          {resolveResult.isGameComplete ? "Claim Your Score →" : `Unlock Concept — ${conceptTitle} →`}
        </button>
        <button className="bsc-btn-ghost w-full py-2 text-xs" onClick={() => router.push("/hq")}>
          Return to HQ
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading…</p>
    </div>
  );
}

// ── Suspense wrapper ──────────────────────────────────────────────────────────

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading mission…</p>
      </div>
    }>
      <PlayInner />
    </Suspense>
  );
}
