import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/json";
import {
  GAME_SITUATION_COUNT,
  getDefaultNodeIdForStep,
  getMissionById,
  getMissionNode,
  isLegacyMission,
} from "@/lib/missions";

interface TeacherFeedQueryOptions {
  sessionId?: string;
}

export interface TeamFeedItem {
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

export interface TeacherFeedResponse {
  session: {
    id: string;
    title: string;
    createdAt: Date;
    status: string;
    archivedAt: Date | null;
  } | null;
  sessionId?: string;
  title?: string;
  createdAt?: Date;
  teams?: TeamFeedItem[];
  totalTeams?: number;
  completedTeams?: number;
}

export function toCSV(rows: Record<string, string | number | boolean | null>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const value = row[h];
          if (value === null || value === undefined) return "";
          const asString = String(value);
          return asString.includes(",") || asString.includes('"') || asString.includes("\n")
            ? `"${asString.replace(/"/g, '""')}"`
            : asString;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export async function loadTeacherFeed(
  options: TeacherFeedQueryOptions = {}
): Promise<TeacherFeedResponse> {
  const session = options.sessionId
    ? await prisma.session.findUnique({
        where: { id: options.sessionId },
        include: {
          teams: {
            include: {
              students: { select: { id: true, nickname: true, lastSeenAt: true } },
              missionProgress: true,
              catalogAttempts: true,
              finalSubmissions: {
                select: { studentId: true, claimCode: true, submittedAt: true },
              },
            },
          },
        },
      })
    : await prisma.session.findFirst({
        where: { status: "active" },
        include: {
          teams: {
            include: {
              students: { select: { id: true, nickname: true, lastSeenAt: true } },
              missionProgress: true,
              catalogAttempts: true,
              finalSubmissions: {
                select: { studentId: true, claimCode: true, submittedAt: true },
              },
            },
          },
        },
      });

  if (!session) return { session: null };

  const now = new Date();
  const activeCutoff = new Date(now.getTime() - 60 * 1000);
  const stuckCutoff = new Date(now.getTime() - 3 * 60 * 1000);

  const teams: TeamFeedItem[] = session.teams.map((team) => {
    const badges = parseJson<string[]>(team.badges, []);
    const roundState = parseJson<{ missionId?: string; currentRoundId?: string; isResolved?: boolean }>(
      team.missionRoundState,
      {}
    );
    const activeMembers = team.students.filter((student) => student.lastSeenAt >= activeCutoff);
    const isStuck = !team.completedAt && team.lastProgressAt < stuckCutoff && activeMembers.length > 0;
    const elapsedSeconds = Math.floor((now.getTime() - team.lastProgressAt.getTime()) / 1000);
    const fallbackMissionId = getDefaultNodeIdForStep(Math.min(team.missionIndex + 1, GAME_SITUATION_COUNT));
    const missionIdForTitle = roundState.missionId || team.currentNodeId || fallbackMissionId;
    const missionTitle = (() => {
      const mission = getMissionById(missionIdForTitle);
      if (mission && !isLegacyMission(mission)) return mission.title;
      return getMissionNode(missionIdForTitle)?.title ?? "In Progress";
    })();

    const checkPassRate =
      team.catalogAttempts.length > 0
        ? Math.round(
            (team.catalogAttempts.filter((attempt) => attempt.passed).length /
              team.catalogAttempts.length) *
              100
          )
        : null;

    return {
      id: team.id,
      name: team.name,
      joinCode: team.joinCode,
      missionIndex: team.missionIndex,
      missionTitle: team.missionIndex >= GAME_SITUATION_COUNT ? "Complete" : missionTitle,
      score: team.score,
      badges,
      badgeCount: badges.length,
      isComplete: !!team.completedAt,
      isStuck,
      elapsedSeconds,
      totalMembers: team.students.length,
      activeMembers: activeMembers.length,
      members: team.students.map((student) => ({
        id: student.id,
        nickname: student.nickname,
        active: student.lastSeenAt >= activeCutoff,
      })),
      claimCodesSubmitted: team.finalSubmissions.length,
      checkPassRate,
      teamStateVersion: team.teamStateVersion,
      activeMissionId:
        roundState.missionId && !roundState.isResolved ? roundState.missionId : null,
      activeRoundId:
        roundState.currentRoundId && !roundState.isResolved ? roundState.currentRoundId : null,
      hasActiveRound: !!roundState.missionId && !roundState.isResolved,
    };
  });

  return {
    session: {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      status: session.status,
      archivedAt: session.archivedAt,
    },
    sessionId: session.id,
    title: session.title,
    createdAt: session.createdAt,
    teams,
    totalTeams: teams.length,
    completedTeams: teams.filter((team) => team.isComplete).length,
  };
}

export async function buildSessionExport(sessionId: string, format: "summary" | "detail") {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      teams: {
        include: {
          students: true,
          missionProgress: { orderBy: { completedAt: "asc" } },
          catalogAttempts: true,
          finalSubmissions: true,
          votes: true,
        },
      },
    },
  });

  if (!session) return null;

  if (format === "summary") {
    const rows: Record<string, string | number | boolean | null>[] = [];
    for (const team of session.teams) {
      const badges = parseJson<string[]>(team.badges, []);
      for (const student of team.students) {
        const submission = team.finalSubmissions.find((item) => item.studentId === student.id);
        rows.push({
          Session: session.title,
          Team: team.name,
          JoinCode: team.joinCode,
          Nickname: student.nickname,
          MissionsCompleted: team.missionIndex,
          BadgesEarned: badges.length,
          ChecksAttempted: team.catalogAttempts.filter((item) => item.studentId === student.id).length,
          ChecksPassed: team.catalogAttempts.filter(
            (item) => item.studentId === student.id && item.passed
          ).length,
          ClaimCode: submission?.claimCode ?? "",
          Submitted: submission ? "Yes" : "No",
          TeamScore: team.score,
          CompletedGame: team.completedAt ? "Yes" : "No",
        });
      }
    }
    return toCSV(rows);
  }

  const rows: Record<string, string | number | boolean | null>[] = [];
  for (const team of session.teams) {
    for (const vote of team.votes) {
      const student = team.students.find((item) => item.id === vote.studentId);
      const compatMission = getMissionNode(vote.missionId);
      const richMission = getMissionById(vote.missionId);
      let optionLabel = "";

      if (richMission && !isLegacyMission(richMission)) {
        const round =
          richMission.rounds.find((item) => item.id === vote.roundId) ??
          (vote.roundId === "rival-response" ? richMission.rivalCounter?.responseRound : undefined);
        optionLabel = round?.options[vote.optionIndex]?.label ?? "";
      } else {
        optionLabel = compatMission?.options[vote.optionIndex]?.label ?? "";
      }

      rows.push({
        Session: session.title,
        Team: team.name,
        Nickname: student?.nickname ?? "Unknown",
        MissionId: vote.missionId,
        RoundId: vote.roundId,
        MissionTitle:
          (richMission && !isLegacyMission(richMission) ? richMission.title : undefined) ??
          compatMission?.title ??
          "",
        OptionSelected: vote.optionIndex,
        OptionLabel: optionLabel,
        VotedAt: vote.createdAt.toISOString(),
      });
    }

    for (const attempt of team.catalogAttempts) {
      const student = team.students.find((item) => item.id === attempt.studentId);
      rows.push({
        Session: session.title,
        Team: team.name,
        Nickname: student?.nickname ?? "Unknown",
        ConceptId: attempt.conceptId,
        Q1Answer: attempt.q1Answer,
        Q1Correct: attempt.q1Correct,
        Q2Answer: attempt.q2Answer,
        Q2Correct: attempt.q2Correct,
        Passed: attempt.passed,
        AttemptNum: attempt.attemptNum,
        CreatedAt: attempt.createdAt.toISOString(),
      });
    }
  }

  return toCSV(rows);
}
