"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SessionListItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  archivedAt: string | null;
  teamCount: number;
  studentCount: number;
  voteCount: number;
  missionProgressCount: number;
}

interface TeamFeedItem {
  id: string;
  name: string;
  missionIndex: number;
  missionTitle: string;
  score: number;
  isComplete: boolean;
  activeMembers: number;
  totalMembers: number;
}

interface FeedResponse {
  session: {
    id: string;
    title: string;
    createdAt: string;
    status: string;
    archivedAt: string | null;
  } | null;
  teams: TeamFeedItem[];
  totalTeams: number;
  completedTeams: number;
}

export default function TeacherHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const meRes = await fetch("/api/teacher/me");
      if (!meRes.ok) {
        router.replace("/teacher");
        return;
      }

      const res = await fetch("/api/teacher/sessions");
      if (!res.ok) {
        setError("Failed to load sessions.");
        return;
      }
      const data = await res.json();
      const rows = (data.sessions ?? []) as SessionListItem[];
      setSessions(rows);
      if (!selectedSessionId && rows.length > 0) {
        setSelectedSessionId(rows[0].id);
      }
    } catch {
      setError("Network error while loading sessions.");
    } finally {
      setLoading(false);
    }
  }, [router, selectedSessionId]);

  const fetchFeed = useCallback(async () => {
    if (!selectedSessionId) return;
    try {
      const res = await fetch(`/api/teacher/sessions/${selectedSessionId}/feed`);
      if (!res.ok) {
        setError("Failed to load session details.");
        return;
      }
      const data = (await res.json()) as FeedResponse;
      setFeed(data);
    } catch {
      setError("Network error while loading session details.");
    }
  }, [selectedSessionId]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  async function downloadExport(format: "summary" | "detail") {
    if (!selectedSessionId) return;
    const res = await fetch(
      `/api/teacher/sessions/${selectedSessionId}/export?format=${format}`
    );
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `bsc-${format}-${selectedSessionId}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bsc-card p-6">
          <p className="text-[#6b7280] font-mono text-sm">Loading session history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[#c9a84c] font-mono text-xl font-bold">Session History</h1>
          <p className="text-[#6b7280] font-mono text-xs">
            Archived sessions are read-only. Export any session snapshot below.
          </p>
        </div>
        <button className="bsc-btn-ghost text-xs" onClick={() => router.push("/teacher/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bsc-card p-3 mb-4 border border-[#ef4444]/30">
          <p className="text-[#ef4444] font-mono text-xs">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <div className="bsc-card p-3 max-h-[70vh] overflow-auto">
          <p className="bsc-section-title mb-2">Sessions</p>
          <div className="space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`w-full text-left rounded border px-3 py-2 font-mono text-xs ${
                  selectedSessionId === session.id
                    ? "border-[#c9a84c]/40 bg-[#c9a84c]/10 text-[#e5e7eb]"
                    : "border-[#1a2030] text-[#9ca3af]"
                }`}
              >
                <p className="text-[#e5e7eb]">{session.title}</p>
                <p className="mt-1">{new Date(session.createdAt).toLocaleString()}</p>
                <p className="mt-1">
                  {session.teamCount} teams · {session.studentCount} students · {session.status}
                </p>
              </button>
            ))}
            {sessions.length === 0 && (
              <p className="text-[#6b7280] font-mono text-xs">No sessions found.</p>
            )}
          </div>
        </div>

        <div className="bsc-card p-4">
          {!feed?.session ? (
            <p className="text-[#6b7280] font-mono text-sm">
              Select a session to view read-only details.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-[#e5e7eb] font-mono text-lg font-bold">{feed.session.title}</h2>
                  <p className="text-[#6b7280] font-mono text-xs">
                    Created {new Date(feed.session.createdAt).toLocaleString()} · {feed.completedTeams}/
                    {feed.totalTeams} teams complete
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bsc-btn-ghost text-xs"
                    onClick={() => downloadExport("summary")}
                  >
                    Export Summary
                  </button>
                  <button
                    className="bsc-btn-ghost text-xs"
                    onClick={() => downloadExport("detail")}
                  >
                    Export Detail
                  </button>
                </div>
              </div>

              <div className="overflow-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="text-[#6b7280] border-b border-[#1a2030]">
                      <th className="py-2 pr-2">Team</th>
                      <th className="py-2 pr-2">Mission</th>
                      <th className="py-2 pr-2">Score</th>
                      <th className="py-2 pr-2">Members</th>
                      <th className="py-2 pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feed.teams.map((team) => (
                      <tr key={team.id} className="border-b border-[#1a2030]/50 text-[#9ca3af]">
                        <td className="py-2 pr-2 text-[#e5e7eb]">{team.name}</td>
                        <td className="py-2 pr-2">{team.missionTitle}</td>
                        <td className="py-2 pr-2">{team.score}</td>
                        <td className="py-2 pr-2">
                          {team.activeMembers}/{team.totalMembers}
                        </td>
                        <td className="py-2 pr-2">
                          {team.isComplete ? "Complete" : "In Progress"}
                        </td>
                      </tr>
                    ))}
                    {feed.teams.length === 0 && (
                      <tr>
                        <td className="py-2 text-[#6b7280]" colSpan={5}>
                          No teams in this session.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
