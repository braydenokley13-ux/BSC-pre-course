"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MISSIONS } from "@/lib/missions";

interface TeamData {
  id: string;
  name: string;
  joinCode: string;
  missionIndex: number;
  missionTitle: string;
  score: number;
  badges: string[];
  badgeCount: number;
  isComplete: boolean;
  isStuck: boolean;
  elapsedSeconds: number;
  totalMembers: number;
  activeMembers: number;
  members: { id: string; nickname: string; active: boolean }[];
  claimCodesSubmitted: number;
  checkPassRate: number | null;
  teamStateVersion: number;
  activeMissionId: string | null;
  activeRoundId: string | null;
  hasActiveRound: boolean;
}

interface FeedData {
  session: { id: string; title: string; createdAt: string; status: string } | null;
  sessionId: string;
  title: string;
  createdAt: string;
  teams: TeamData[];
  totalTeams: number;
  completedTeams: number;
}

interface RecentAction {
  id: string;
  teamId: string;
  actionType: string;
  createdAt: string;
  success: boolean;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
}

interface AlertData {
  teamId: string;
  severity: "low" | "medium" | "high";
  type: string;
  ageSeconds: number;
  message: string;
}

interface AnalyticsData {
  sessionId: string;
  participationRate: number;
  medianVoteLatencySeconds: number | null;
  decisionInsights: Array<{
    missionId: string;
    missionTitle: string;
    roundId: string;
    totalVotes: number;
    options: Array<{
      optionIndex: number;
      label: string;
      picks: number;
      pickRate: number;
    }>;
  }>;
  conceptInsights: Array<{
    conceptId: string;
    avgMastery: number;
    studentsMeasured: number;
    heavyPct: number;
    mediumPct: number;
    lightPct: number;
    priorityScore: number;
    teachingPriority: "heavy" | "medium" | "light";
  }>;
  classConceptMastery: Array<{
    conceptId: string;
    avgMastery: number;
    meanUncertainty: number;
    studentsMeasured: number;
    heavyCount: number;
    mediumCount: number;
    lightCount: number;
    priorityScore: number;
    teachingPriority: "heavy" | "medium" | "light";
  }>;
  teamConceptMastery: Array<{
    teamId: string;
    teamName: string;
    conceptId: string;
    avgMastery: number;
    variance: number;
    studentsMeasured: number;
  }>;
  objectiveWeakness: Array<{
    conceptId: string;
    objectiveId: string;
    missRate: number;
    uncertaintyRate: number;
    topMisconceptions: string[];
    recommendedAction: string;
  }>;
  decisionVsMastery: Array<{
    missionId: string;
    missionTitle: string;
    roundId: string;
    lowBandTopOption: string | null;
    highBandTopOption: string | null;
    divergence: number;
  }>;
  focusRecommendations: {
    heavyConcepts: string[];
    mediumConcepts: string[];
    lightConcepts: string[];
  };
  missionBottlenecks: Array<{
    missionId: string;
    missionTitle: string;
    medianSeconds: number;
    samples: number;
  }>;
  totals: {
    students: number;
    votes: number;
    adaptiveAssessments: number;
  };
}

type TeacherActionType = "force-resolve" | "clear-round-votes" | "jump-mission" | "reset";

interface PendingAction {
  teamId: string;
  teamName: string;
  actionType: TeacherActionType;
  expectedStateVersion: number;
  missionIdInput: string;
}

function formatElapsed(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function actionLabel(actionType: TeacherActionType): string {
  switch (actionType) {
    case "force-resolve":
      return "Force Resolve";
    case "clear-round-votes":
      return "Clear Round Votes";
    case "jump-mission":
      return "Jump Mission";
    case "reset":
      return "Reset Team";
    default:
      return actionType;
  }
}

function apiPathForAction(actionType: TeacherActionType): string {
  switch (actionType) {
    case "force-resolve":
      return "/api/teacher/team/force-resolve";
    case "clear-round-votes":
      return "/api/teacher/team/clear-round-votes";
    case "jump-mission":
      return "/api/teacher/team/jump-mission";
    case "reset":
      return "/api/teacher/team/reset";
    default:
      return "/api/teacher/team/reset";
  }
}

function StatCard({
  label,
  value,
  color = "#e5e7eb",
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="bsc-card p-4 text-center">
      <p className="bsc-section-title">{label}</p>
      <p className="font-mono text-xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [inFlightByTeam, setInFlightByTeam] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      const [feedRes, actionsRes, alertsRes, analyticsRes] = await Promise.all([
        fetch("/api/teacher/feed"),
        fetch("/api/teacher/actions/recent?limit=20"),
        fetch("/api/teacher/alerts"),
        fetch("/api/teacher/analytics"),
      ]);

      if (feedRes.status === 401) {
        router.replace("/teacher");
        return;
      }

      const feedData = (await feedRes.json()) as FeedData;
      if (!feedData.session) {
        router.replace("/teacher/setup");
        return;
      }
      setFeed(feedData);

      if (actionsRes.ok) {
        const actionsData = await actionsRes.json();
        setRecentActions(actionsData.actions ?? []);
      }
      if (alertsRes.ok) {
        const alertsData = (await alertsRes.json()) as AlertData[];
        setAlerts(alertsData);
      }
      if (analyticsRes.ok) {
        const analyticsData = (await analyticsRes.json()) as AnalyticsData;
        setAnalytics(analyticsData);
      }
      setError("");
    } catch {
      setError("Connection error");
    }
  }, [router]);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/teacher/me");
      if (!res.ok) {
        router.replace("/teacher");
        return;
      }
      const data = await res.json();
      if (!data?.activeSession) {
        router.replace("/teacher/setup");
        return;
      }
      setAuthChecked(true);
      await fetchAll();
    }
    checkAuth();
  }, [fetchAll, router]);

  useEffect(() => {
    if (!authChecked) return;
    const id = setInterval(() => {
      void fetchAll();
    }, 5000);
    return () => clearInterval(id);
  }, [authChecked, fetchAll]);

  const teamById = useMemo(() => {
    const map = new Map<string, TeamData>();
    for (const team of feed?.teams ?? []) {
      map.set(team.id, team);
    }
    return map;
  }, [feed?.teams]);

  async function downloadExport(format: "summary" | "detail") {
    const res = await fetch(`/api/teacher/export?format=${format}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `bsc-${format}-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    await fetch("/api/teacher/logout", { method: "POST" });
    router.replace("/teacher");
  }

  async function handleArchive() {
    if (!confirm("Archive this live session? This ends gameplay but keeps data read-only.")) return;
    setArchiving(true);
    await fetch("/api/session/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setArchiving(false);
    router.push("/teacher/setup");
  }

  function openActionModal(team: TeamData, actionType: TeacherActionType) {
    setActionError("");
    setPendingAction({
      teamId: team.id,
      teamName: team.name,
      actionType,
      expectedStateVersion: team.teamStateVersion,
      missionIdInput: team.activeMissionId ?? "",
    });
  }

  async function submitAction() {
    if (!pendingAction) return;
    setActionError("");
    const teamId = pendingAction.teamId;
    setInFlightByTeam((prev) => ({
      ...prev,
      [teamId]: actionLabel(pendingAction.actionType),
    }));

    const body: Record<string, unknown> = {
      teamId: pendingAction.teamId,
      expectedStateVersion: pendingAction.expectedStateVersion,
    };
    if (pendingAction.actionType === "jump-mission") {
      body.missionId = pendingAction.missionIdInput.trim();
      if (!body.missionId) {
        setActionError("Mission ID is required.");
        setInFlightByTeam((prev) => {
          const next = { ...prev };
          delete next[teamId];
          return next;
        });
        return;
      }
    }

    try {
      const res = await fetch(apiPathForAction(pendingAction.actionType), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Action failed");
        return;
      }
      setPendingAction(null);
      await fetchAll();
    } catch {
      setActionError("Network error while running action.");
    } finally {
      setInFlightByTeam((prev) => {
        const next = { ...prev };
        delete next[teamId];
        return next;
      });
    }
  }

  if (!authChecked || !feed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[#c9a84c] font-mono text-2xl"
        >
          ◈
        </motion.div>
      </div>
    );
  }

  const inProgress = feed.teams.filter((team) => !team.isComplete && team.activeMembers > 0).length;
  const stuck = feed.teams.filter((team) => team.isStuck).length;
  const highAlerts = alerts.filter((item) => item.severity === "high").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-[#c9a84c] font-mono text-xl font-bold">{feed.title}</h1>
          <p className="text-[#6b7280] font-mono text-xs mt-0.5">
            {feed.completedTeams}/{feed.totalTeams} teams complete · Refreshes every 5s
          </p>
          {error && <p className="text-[#ef4444] font-mono text-xs mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="bsc-btn-ghost text-xs" onClick={() => downloadExport("summary")}>
            Export Summary
          </button>
          <button className="bsc-btn-ghost text-xs" onClick={() => downloadExport("detail")}>
            Export Detail
          </button>
          <button className="bsc-btn-ghost text-xs" onClick={() => router.push("/teacher/history")}>
            Session History
          </button>
          <button
            className="bsc-btn-ghost text-xs text-[#ef4444] border-[#ef4444]/40 hover:border-[#ef4444]"
            onClick={handleArchive}
            disabled={archiving}
          >
            {archiving ? "Archiving..." : "Archive Session"}
          </button>
          <button className="bsc-btn-ghost text-xs" onClick={logout}>
            Logout
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard label="Teams" value={feed.totalTeams} />
        <StatCard label="Completed" value={feed.completedTeams} color="#22c55e" />
        <StatCard label="In Progress" value={inProgress} color="#c9a84c" />
        <StatCard label="Stuck" value={stuck} color="#ef4444" />
        <StatCard label="High Alerts" value={highAlerts} color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {feed.teams.length === 0 && (
              <div className="bsc-card p-6 text-center col-span-full">
                <p className="font-mono text-sm text-[#6b7280]">No teams have joined this session yet.</p>
                <p className="font-mono text-xs text-[#374151] mt-1">Share the join code with students to get started.</p>
              </div>
            )}
            {feed.teams.map((team, index) => {
              const actionInFlight = inFlightByTeam[team.id] ?? null;
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bsc-card p-5 border-2 ${
                    team.isComplete
                      ? "border-[#22c55e]/40"
                      : team.isStuck
                      ? "border-[#ef4444]/50"
                      : "border-[#1a2030]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[#e5e7eb] font-mono font-bold">{team.name}</span>
                      <span className="text-[#6b7280] font-mono text-xs ml-2">{team.joinCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {team.isComplete && <span className="bsc-badge-green">Done</span>}
                      {team.isStuck && <span className="bsc-badge-red">Stuck</span>}
                      <span className="text-[#6b7280] font-mono text-xs">{team.score}pts</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono text-xs text-[#6b7280]">
                        {team.isComplete ? "Complete" : team.missionTitle}
                      </span>
                      <span className="font-mono text-xs text-[#6b7280]">⏱ {formatElapsed(team.elapsedSeconds)}</span>
                    </div>
                    <div className="h-1.5 bg-[#1a2030] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#c9a84c] rounded-full"
                        style={{
                          width: `${MISSIONS.length > 0 ? (team.missionIndex / MISSIONS.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 font-mono text-[10px] text-[#6b7280]">
                      <span>v{team.teamStateVersion}</span>
                      <span>{team.activeMissionId ? `${team.activeMissionId} / ${team.activeRoundId}` : "No active round"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {team.badgeCount > 0 ? (
                      Array.from({ length: team.badgeCount }).map((_, idx) => (
                        <span key={idx} className="bsc-badge-gold text-xs">
                          ★
                        </span>
                      ))
                    ) : (
                      <span className="text-[#6b7280] font-mono text-xs">No badges yet</span>
                    )}
                  </div>

                  <div className="border-t border-[#1a2030] pt-3">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {team.members.map((member) => (
                        <span
                          key={member.id}
                          className={`font-mono text-xs px-1.5 py-0.5 rounded border ${
                            member.active
                              ? "border-[#22c55e]/40 text-[#22c55e]"
                              : "border-[#1a2030] text-[#6b7280]"
                          }`}
                        >
                          {member.nickname}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs text-[#6b7280] mb-3">
                      <span>{team.activeMembers}/{team.totalMembers} active</span>
                      {team.checkPassRate !== null && <span>Check: {team.checkPassRate}%</span>}
                      <span>Codes: {team.claimCodesSubmitted}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="bsc-btn-ghost text-xs py-2"
                        onClick={() => openActionModal(team, "force-resolve")}
                        disabled={!team.hasActiveRound || !!actionInFlight}
                      >
                        Force Resolve
                      </button>
                      <button
                        className="bsc-btn-ghost text-xs py-2"
                        onClick={() => openActionModal(team, "clear-round-votes")}
                        disabled={!team.hasActiveRound || !!actionInFlight}
                      >
                        Clear Votes
                      </button>
                      <button
                        className="bsc-btn-ghost text-xs py-2"
                        onClick={() => openActionModal(team, "jump-mission")}
                        disabled={!!actionInFlight}
                      >
                        Jump Mission
                      </button>
                      <button
                        className="bsc-btn-ghost text-xs py-2 text-[#ef4444] border-[#ef4444]/40"
                        onClick={() => openActionModal(team, "reset")}
                        disabled={!!actionInFlight}
                      >
                        Reset Team
                      </button>
                    </div>
                    {actionInFlight && (
                      <p className="text-[#c9a84c] font-mono text-xs mt-2">
                        {actionInFlight} is in progress...
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="bsc-card p-4">
            <p className="bsc-section-title mb-2">Live Alerts</p>
            {alerts.length === 0 ? (
              <p className="text-[#6b7280] font-mono text-xs">No active alerts.</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 8).map((alert) => {
                  const team = teamById.get(alert.teamId);
                  const color =
                    alert.severity === "high"
                      ? "#ef4444"
                      : alert.severity === "medium"
                      ? "#c9a84c"
                      : "#6b7280";
                  return (
                    <div key={`${alert.teamId}-${alert.type}-${alert.ageSeconds}`} className="border border-[#1a2030] rounded px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-[#e5e7eb]">{team?.name ?? alert.teamId}</span>
                        <span className="font-mono text-[10px]" style={{ color }}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-[#9ca3af]">{alert.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bsc-card p-4">
            <p className="bsc-section-title mb-2">Teaching Analytics</p>
            {!analytics ? (
              <p className="text-[#6b7280] font-mono text-xs">Loading analytics...</p>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                <p className="text-[#9ca3af]">
                  Participation: <span className="text-[#e5e7eb]">{analytics.participationRate}%</span>
                </p>
                <p className="text-[#9ca3af]">
                  Median vote latency:{" "}
                  <span className="text-[#e5e7eb]">
                    {analytics.medianVoteLatencySeconds == null
                      ? "N/A"
                      : `${analytics.medianVoteLatencySeconds}s`}
                  </span>
                </p>
                <p className="text-[#9ca3af]">
                  Students: <span className="text-[#e5e7eb]">{analytics.totals.students}</span> · Votes:{" "}
                  <span className="text-[#e5e7eb]">{analytics.totals.votes}</span> · Adaptive checks:{" "}
                  <span className="text-[#e5e7eb]">{analytics.totals.adaptiveAssessments}</span>
                </p>
                <div className="pt-2 border-t border-[#1a2030]">
                  <p className="text-[#6b7280] mb-1">Teach heavily</p>
                  {analytics.focusRecommendations.heavyConcepts.length === 0 ? (
                    <p className="text-[#6b7280]">No heavy-priority concepts yet.</p>
                  ) : (
                    analytics.focusRecommendations.heavyConcepts.slice(0, 4).map((concept) => (
                      <p key={concept} className="text-[#ef4444]">
                        {concept}
                      </p>
                    ))
                  )}
                </div>
                <div className="pt-2 border-t border-[#1a2030]">
                  <p className="text-[#6b7280] mb-1">Class Concept Mastery</p>
                  {analytics.classConceptMastery.length === 0 ? (
                    <p className="text-[#6b7280]">No adaptive concept data yet.</p>
                  ) : (
                    analytics.classConceptMastery.slice(0, 3).map((item) => (
                      <p key={item.conceptId} className="text-[#9ca3af]">
                        {item.conceptId}:{" "}
                        <span className="text-[#e5e7eb]">
                          {item.avgMastery.toFixed(2)} / 4 ({item.teachingPriority})
                        </span>
                      </p>
                    ))
                  )}
                </div>
                <div className="pt-2 border-t border-[#1a2030]">
                  <p className="text-[#6b7280] mb-1">Team Variance Watch</p>
                  {analytics.teamConceptMastery.length === 0 ? (
                    <p className="text-[#6b7280]">No team-level mastery data yet.</p>
                  ) : (
                    analytics.teamConceptMastery
                      .slice()
                      .sort((a, b) => b.variance - a.variance)
                      .slice(0, 3)
                      .map((item) => (
                      <p key={`${item.teamId}-${item.conceptId}`} className="text-[#9ca3af]">
                        {item.teamName} · {item.conceptId}:{" "}
                        <span className="text-[#e5e7eb]">
                          {item.avgMastery.toFixed(2)} / 4 · variance {item.variance.toFixed(2)}
                        </span>
                      </p>
                    ))
                  )}
                </div>
                <div className="pt-2 border-t border-[#1a2030]">
                  <p className="text-[#6b7280] mb-1">Objective Weak Spots</p>
                  {analytics.objectiveWeakness.length === 0 ? (
                    <p className="text-[#6b7280]">No objective weakness data yet.</p>
                  ) : (
                    analytics.objectiveWeakness.slice(0, 3).map((row) => (
                      <p key={`${row.conceptId}-${row.objectiveId}`} className="text-[#9ca3af]">
                        {row.objectiveId}:{" "}
                        <span className="text-[#e5e7eb]">{row.missRate}% miss</span> ·{" "}
                        {row.recommendedAction}
                      </p>
                    ))
                  )}
                </div>
                <div className="pt-2 border-t border-[#1a2030]">
                  <p className="text-[#6b7280] mb-1">Decision vs Mastery</p>
                  {analytics.decisionVsMastery.length === 0 ? (
                    <p className="text-[#6b7280]">No decision/mastery divergence yet.</p>
                  ) : (
                    analytics.decisionVsMastery.slice(0, 2).map((row) => (
                      <p key={`${row.missionId}-${row.roundId}`} className="text-[#9ca3af]">
                        {row.missionTitle}: <span className="text-[#e5e7eb]">{row.divergence}% divergence</span>
                      </p>
                    ))
                  )}
                </div>
                <div className="pt-2 border-t border-[#1a2030]">
                  <p className="text-[#6b7280] mb-1">Top bottlenecks</p>
                  {analytics.missionBottlenecks.length === 0 ? (
                    <p className="text-[#6b7280]">Not enough event data yet.</p>
                  ) : (
                    analytics.missionBottlenecks.slice(0, 3).map((item) => (
                      <p key={item.missionId} className="text-[#9ca3af]">
                        {item.missionTitle}:{" "}
                        <span className="text-[#e5e7eb]">{item.medianSeconds}s</span> ({item.samples})
                      </p>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bsc-card p-4">
            <p className="bsc-section-title mb-2">Recent Actions</p>
            {recentActions.length === 0 ? (
              <p className="text-[#6b7280] font-mono text-xs">No actions logged yet.</p>
            ) : (
              <div className="space-y-2">
                {recentActions.map((item) => {
                  const team = teamById.get(item.teamId);
                  return (
                    <div key={item.id} className="border border-[#1a2030] rounded px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-[#e5e7eb]">
                          {team?.name ?? item.teamId}
                        </span>
                        <span
                          className={`font-mono text-[10px] ${
                            item.success ? "text-[#22c55e]" : "text-[#ef4444]"
                          }`}
                        >
                          {item.success ? "SUCCESS" : "FAILED"}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-[#9ca3af]">
                        {item.actionType} · {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bsc-card p-5 w-full max-w-md">
            <p className="bsc-section-title mb-2">Confirm Action</p>
            <p className="font-mono text-sm text-[#e5e7eb] mb-3">
              {actionLabel(pendingAction.actionType)} for {pendingAction.teamName}.
            </p>
            <p className="font-mono text-xs text-[#6b7280] mb-3">
              This action is logged and may change live gameplay state.
            </p>
            {pendingAction.actionType === "jump-mission" && (
              <div className="mb-3">
                <label className="bsc-label" htmlFor="jumpMission">
                  Mission ID
                </label>
                <input
                  id="jumpMission"
                  className="bsc-input"
                  value={pendingAction.missionIdInput}
                  onChange={(event) =>
                    setPendingAction((prev) =>
                      prev ? { ...prev, missionIdInput: event.target.value } : prev
                    )
                  }
                  placeholder="e.g. revenue-mix"
                />
              </div>
            )}
            {actionError && <p className="text-[#ef4444] font-mono text-xs mb-3">{actionError}</p>}
            <div className="flex gap-2">
              <button className="bsc-btn-ghost flex-1" onClick={() => setPendingAction(null)}>
                Cancel
              </button>
              <button className="bsc-btn-gold flex-1" onClick={submitAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
