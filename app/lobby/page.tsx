"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GAME_SITUATION_COUNT } from "@/lib/missions";

interface Member {
  id: string;
  nickname: string;
  active: boolean;
}

interface TeamState {
  team: {
    id: string;
    name: string;
    joinCode: string;
    missionIndex: number;
    currentNodeId?: string;
    completedAt: string | null;
  };
  me: { id: string; nickname: string };
  members: Member[];
  activeCount: number;
}

export default function LobbyPage() {
  const router = useRouter();
  const [state, setState] = useState<TeamState | null>(null);
  const [error, setError] = useState("");

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/join");
        return;
      }
      const data = await res.json();
      if (data.team?.completedAt) {
        router.replace("/complete");
        return;
      }
      if (data.team?.missionIndex > 0 || data.team?.currentNodeId !== "m1_cap_crunch") {
        router.replace("/play");
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
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Connecting to team...</p>
      </div>
    );
  }

  const canStart = state.activeCount >= 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bsc-broadcast-shell p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="bsc-section-title mb-1">Team Lobby</p>
            <h1 className="text-[#c9a84c] font-mono text-3xl font-bold">{state.team.name}</h1>
          </div>
          <div className="bsc-badge-gold text-sm px-3 py-1 tracking-widest">{state.team.joinCode}</div>
        </div>

        <div className="bsc-score-grid mb-4">
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Joined</p>
            <p className="bsc-score-value">{state.members.length}</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Active Now</p>
            <p className="bsc-score-value">{state.activeCount}</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Situations</p>
            <p className="bsc-score-value">{GAME_SITUATION_COUNT}</p>
          </div>
          <div className="bsc-score-tile">
            <p className="bsc-score-label">Status</p>
            <p className="bsc-score-value">{canStart ? "Ready" : "Waiting"}</p>
          </div>
        </div>

        <div className="bsc-live-ticker mb-4">
          <span className="bsc-live-label">Live Desk</span>
          <div className="min-w-0 overflow-hidden">
            <span className="ticker-text bsc-live-track">
              Share this code with your teammates in chat. The game starts as soon as your group is ready.
            </span>
          </div>
        </div>

        <div className="bsc-card p-6 mb-4">
          <p className="bsc-section-title">Roster ({state.members.length} joined)</p>
          <div className="space-y-2">
            {state.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-2 border-b border-[#1e2435] last:border-0"
              >
                <span className="font-mono text-sm text-[#e5e7eb]">
                  {m.nickname}
                  {m.id === state.me.id && (
                    <span className="text-[#c9a84c] text-xs ml-2">(you)</span>
                  )}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${m.active ? "bg-[#22c55e] pulse-gold" : "bg-[#6b7280]"}`}
                />
              </div>
            ))}
          </div>
          {state.members.length < 2 && (
            <p className="text-[#6b7280] font-mono text-xs mt-3">
              Waiting for teammates to join...
            </p>
          )}
        </div>

        <div className="bsc-card p-6 text-center">
          <p className="text-[#e5e7eb] font-mono text-sm mb-4">
            8 situations. 8 key concepts. Build your team identity.
          </p>
          {canStart ? (
            <button
              className="bsc-btn-gold w-full py-3"
              onClick={() => router.push("/play")}
            >
              Start the Game
            </button>
          ) : (
            <button className="bsc-btn-ghost w-full py-3 cursor-not-allowed" disabled>
              Waiting for teammates to join...
            </button>
          )}
          <p className="text-[#6b7280] font-mono text-xs mt-3">
            {state.activeCount} active now · Updates every 5s
          </p>
        </div>
      </div>
    </div>
  );
}
