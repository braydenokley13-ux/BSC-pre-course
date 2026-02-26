"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROOM_LAYOUT, RoomMeta } from "@/lib/missionGraph";
import { STATUS_EFFECTS } from "@/lib/statusEffects";

interface TeamInfo {
  id: string;
  name: string;
  score: number;
  completedMissions: string[];
  teamStatus: string[];
  completedAt: string | null;
}
interface MeInfo { id: string; nickname: string; role: string | null }
interface MissionRoundState { missionId?: string; isResolved?: boolean }

interface TeamStateResponse {
  team: TeamInfo;
  me: MeInfo;
  unlockedMissions: string[];
  completedMissions: string[];
  teamStatus: string[];
  missionRoundState: MissionRoundState;
  gameComplete: boolean;
}

function roomStatus(
  room: RoomMeta,
  completed: string[],
  unlocked: string[]
): "completed" | "active" | "unlocked" | "locked" {
  if (completed.includes(room.missionId)) return "completed";
  if (unlocked.includes(room.missionId)) return "unlocked";
  return "locked";
}

function StatusPill({ id, positive }: { id: string; positive: boolean }) {
  const effect = STATUS_EFFECTS[id];
  if (!effect) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
        positive
          ? "bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/30"
          : "bg-[#ef4444]/10 text-[#ef4444]/70 border-[#ef4444]/25"
      }`}
      title={effect.description}
    >
      <span>{effect.icon}</span>
      <span className="tracking-wider uppercase">{effect.label}</span>
    </span>
  );
}

export default function HQPage() {
  const router = useRouter();
  const [state, setState] = useState<TeamStateResponse | null>(null);
  const [error, setError] = useState("");
  // ID of room the avatar is "standing in" — starts null (entrance)
  const [avatarRoom, setAvatarRoom] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/team/state", { credentials: "include" });
      if (res.status === 401) { router.replace("/join"); return; }
      const data: TeamStateResponse = await res.json();
      if (data.team.completedAt || data.gameComplete) {
        router.replace("/complete");
        return;
      }
      setState(data);
      // Position avatar at last in-progress mission if any
      const rsm = data.missionRoundState;
      if (rsm?.missionId && !rsm.isResolved) {
        setAvatarRoom(rsm.missionId);
      }
    } catch {
      setError("Connection error");
    }
  }, [router]);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 8000);
    return () => clearInterval(id);
  }, [fetchState]);

  function handleRoomClick(room: RoomMeta, status: ReturnType<typeof roomStatus>) {
    if (status === "locked") return;
    setAvatarRoom(room.missionId);
    router.push(`/play?missionId=${room.missionId}`);
  }

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
        <p className="text-[#6b7280] font-mono text-sm animate-pulse">Loading HQ…</p>
      </div>
    );
  }

  const { team, me, unlockedMissions, completedMissions, teamStatus } = state;
  const totalRooms = ROOM_LAYOUT.length;
  const completedCount = completedMissions.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* ── Top status bar ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-[#6b7280] font-mono text-xs tracking-widest uppercase mb-0.5">
            General Manager
          </p>
          <h1 className="text-[#c9a84c] font-mono text-2xl font-bold">{team.name}</h1>
          <p className="text-[#6b7280] font-mono text-xs mt-1">
            Welcome back, <span className="text-[#e5e7eb]">{me.nickname}</span>
            {me.role && (
              <span className="ml-2 text-[#c9a84c]">— {me.role.toUpperCase()}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[#6b7280] font-mono text-xs uppercase tracking-widest">Score</p>
            <p className="text-[#c9a84c] font-mono text-xl font-bold">{team.score}</p>
          </div>
          <div className="text-right">
            <p className="text-[#6b7280] font-mono text-xs uppercase tracking-widest">Missions</p>
            <p className="text-[#e5e7eb] font-mono text-xl font-bold">
              {completedCount}<span className="text-[#6b7280] text-sm">/{totalRooms}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Status effects ──────────────────────────────────────────── */}
      {teamStatus.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {teamStatus.map((sid) => (
            <StatusPill
              key={sid}
              id={sid}
              positive={STATUS_EFFECTS[sid]?.positive ?? false}
            />
          ))}
        </div>
      )}

      {/* ── Progress bar ────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex justify-between text-[10px] font-mono text-[#6b7280] tracking-widest uppercase mb-1">
          <span>Floor Progress</span>
          <span>{completedCount} of {totalRooms} departments cleared</span>
        </div>
        <div className="h-1.5 bg-[#1e2435] rounded overflow-hidden">
          <div
            className="h-full bg-[#c9a84c] rounded transition-all duration-700"
            style={{ width: `${(completedCount / totalRooms) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Instruction ─────────────────────────────────────────────── */}
      <p className="text-[#6b7280] font-mono text-xs mb-5 text-center tracking-wide">
        Select an unlocked department to begin your mission.
        {unlockedMissions.length === 0 && completedCount === 0 && (
          <span className="text-[#c9a84c] ml-2">Start with the Cap Room.</span>
        )}
      </p>

      {/* ── HQ Floor Map Grid ───────────────────────────────────────── */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "auto",
        }}
      >
        {ROOM_LAYOUT.map((room) => {
          const status = roomStatus(room, completedMissions, unlockedMissions);
          const isAvatar = avatarRoom === room.missionId;

          return (
            <div
              key={room.missionId}
              style={{
                gridColumn: room.gridCol,
                gridRow: room.gridRow,
              }}
              className={[
                "hq-room relative",
                status === "completed" ? "hq-room-completed" : "",
                status === "unlocked" ? "hq-room-unlocked" : "",
                status === "active" ? "hq-room-active" : "",
                status === "locked" ? "hq-room-locked" : "",
              ].join(" ")}
              onClick={() => handleRoomClick(room, status)}
              role={status !== "locked" ? "button" : undefined}
              tabIndex={status !== "locked" ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleRoomClick(room, status);
              }}
            >
              {/* Avatar indicator */}
              {isAvatar && (
                <span
                  className="absolute top-2 right-2 text-base leading-none avatar-walk"
                  title="You are here"
                >
                  🏃
                </span>
              )}

              {/* Completed checkmark */}
              {status === "completed" && (
                <span className="absolute top-2 right-2 text-[#22c55e] text-xs font-mono">✓</span>
              )}

              {/* Locked icon */}
              {status === "locked" && (
                <span className="absolute top-2 right-2 text-[#1e2435] text-xs">⬡</span>
              )}

              {/* Room content */}
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#6b7280] mb-1">
                {room.department}
              </p>
              <p
                className={`font-mono text-sm font-bold mb-1 ${
                  status === "locked" ? "text-[#2a3040]" : "text-[#e5e7eb]"
                }`}
              >
                {room.roomName}
              </p>
              <p
                className={`font-mono text-[11px] leading-snug ${
                  status === "locked"
                    ? "text-[#1e2435]"
                    : status === "completed"
                    ? "text-[#22c55e]/60"
                    : "text-[#6b7280]"
                }`}
              >
                {status === "completed"
                  ? "Mission complete."
                  : status === "locked"
                  ? "— classified —"
                  : room.tagline}
              </p>

              {/* Unlocked CTA */}
              {(status === "unlocked" || status === "active") && (
                <div className="mt-2">
                  <span className="text-[#c9a84c] font-mono text-[10px] tracking-widest uppercase">
                    Enter →
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom hint ─────────────────────────────────────────────── */}
      <p className="text-center text-[#6b7280] font-mono text-[10px] tracking-widest uppercase mt-8">
        Auto-refreshes · Missions unlock as prerequisites are cleared
      </p>
    </div>
  );
}
