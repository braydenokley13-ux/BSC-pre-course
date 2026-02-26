"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BranchState, MissionNode } from "@/lib/missions";
import { GAME_SITUATION_COUNT } from "@/lib/missions";

interface MemberInfo {
  id: string;
  nickname: string;
  active: boolean;
}

interface TeamStateResponse {
  team: {
    id: string;
    name: string;
    score: number;
    missionIndex: number;
    branchState: BranchState;
    badges: string[];
    completedAt: string | null;
  };
  me: {
    id: string;
    nickname: string;
  };
  members: MemberInfo[];
  activeCount: number;
  currentMission: MissionNode | null;
  elapsedSeconds: number;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function toMeterPercent(value: number): number {
  const normalized = ((value + 8) / 16) * 100;
  return Math.max(0, Math.min(100, normalized));
}

function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

export default function HQPage() {
  const router = useRouter();
  const [state, setState] = useState<TeamStateResponse | null>(null);
  const [error, setError] = useState("");

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/join");
        return;
      }

      const data: TeamStateResponse = await res.json();
      if (data.team.completedAt || data.team.missionIndex >= GAME_SITUATION_COUNT) {
        router.replace("/complete");
        return;
      }

      setState(data);
    } catch {
      setError("Connection error");
    }
  }, [router]);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 5000);
    return () => clearInterval(id);
  }, [fetchState]);

  const branchMetrics: Array<{ key: keyof BranchState; label: string }> = useMemo(
    () => [
      { key: "capFlex", label: "Cap Flex" },
      { key: "starPower", label: "Star Power" },
      { key: "dataTrust", label: "Data Trust" },
      { key: "culture", label: "Culture" },
      { key: "riskHeat", label: "Risk Heat" },
    ],
    []
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#ef4444] font-mono text-sm">{error}</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading HQ...</p>
      </div>
    );
  }

  const progress = Math.min(state.team.missionIndex, GAME_SITUATION_COUNT);
  const nextMission = state.currentMission;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      <div className="bsc-broadcast-shell p-5">
        <div className="bsc-score-grid mb-4">
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Team</p>
            <p className="bsc-score-value">{state.team.name}</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Progress</p>
            <p className="bsc-score-value">{progress}/{GAME_SITUATION_COUNT}</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Score</p>
            <p className="bsc-score-value">{state.team.score}</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Elapsed</p>
            <p className="bsc-score-value">{formatElapsed(state.elapsedSeconds)}</p>
          </div>
        </div>

        <div className="bsc-live-ticker mb-5">
          <span className="bsc-live-label">Live Desk</span>
          <div className="min-w-0 overflow-hidden">
            <span className="ticker-text bsc-live-track">
              Review your team status, then enter the next situation when your group is ready.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <div className="space-y-4">
            <div className="bsc-card p-5">
              <p className="bsc-section-title mb-2">Mission Control</p>
              <p className="text-[#c9a84c] font-mono text-lg font-bold mb-1">
                {nextMission ? nextMission.title : "All situations complete"}
              </p>
              <p className="font-mono text-xs text-[#6b7280]">
                {nextMission
                  ? "Continue into the next decision round."
                  : "Your team has no remaining situations."}
              </p>
              <button
                className="bsc-btn-gold mt-4"
                onClick={() => router.push(nextMission ? "/play" : "/complete")}
              >
                {nextMission ? "Enter Next Situation ->" : "Open Completion Page ->"}
              </button>
            </div>

            <div className="bsc-card p-5">
              <p className="bsc-section-title mb-2">Team Roster</p>
              <div className="flex flex-wrap gap-2">
                {state.members.map((member) => (
                  <span
                    key={member.id}
                    className={`font-mono text-xs px-2 py-0.5 rounded border ${
                      member.active
                        ? "border-[#22c55e]/40 text-[#22c55e]"
                        : "border-[#1e2435] text-[#6b7280]"
                    }`}
                  >
                    {member.nickname}
                    {member.id === state.me.id ? " *" : ""}
                  </span>
                ))}
              </div>
              <p className="text-[#6b7280] font-mono text-xs mt-3">
                {state.activeCount}/{state.members.length} active now
              </p>
            </div>

            <div className="bsc-card p-5">
              <p className="bsc-section-title mb-2">Badges</p>
              {state.team.badges.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {state.team.badges.map((badgeId) => (
                    <span key={badgeId} className="bsc-badge-gold text-xs">
                      {badgeId}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#6b7280] font-mono text-xs">No concept badges yet.</p>
              )}
            </div>
          </div>

          <div className="bsc-card p-5">
            <p className="bsc-section-title">Decision Signals</p>
            <div className="bsc-metric-list">
              {branchMetrics.map((metric) => {
                const value = state.team.branchState[metric.key];
                return (
                  <div key={metric.key} className="bsc-metric-row">
                    <div className="bsc-metric-head">
                      <span className="bsc-metric-name">{metric.label}</span>
                      <span className="bsc-metric-value">{formatSigned(value)}</span>
                    </div>
                    <div className="bsc-metric-bar">
                      <div
                        className="bsc-metric-fill"
                        style={{ width: `${toMeterPercent(value)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
