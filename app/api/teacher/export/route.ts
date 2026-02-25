export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkTeacherPassword } from "@/lib/auth";
import { MISSIONS } from "@/lib/missions";

function toCSV(rows: Record<string, string | number | boolean | null>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          if (v === null || v === undefined) return "";
          const s = String(v);
          return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-teacher-password");
  if (!password) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authed = await checkTeacherPassword(password);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const format = req.nextUrl.searchParams.get("format") ?? "summary";

  const session = await prisma.session.findFirst({
    where: { status: "active" },
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

  if (!session) {
    return new NextResponse("No active session", { status: 404 });
  }

  if (format === "summary") {
    const rows: Record<string, string | number | boolean | null>[] = [];
    for (const team of session.teams) {
      const badges = JSON.parse(team.badges) as string[];
      for (const student of team.students) {
        const submission = team.finalSubmissions.find((f) => f.studentId === student.id);
        rows.push({
          Team: team.name,
          JoinCode: team.joinCode,
          Nickname: student.nickname,
          MissionsCompleted: team.missionIndex,
          BadgesEarned: badges.length,
          ChecksAttempted: team.catalogAttempts.filter((a) => a.studentId === student.id).length,
          ChecksPassed: team.catalogAttempts.filter((a) => a.studentId === student.id && a.passed).length,
          ClaimCode: submission?.claimCode ?? "",
          Submitted: submission ? "Yes" : "No",
          TeamScore: team.score,
          CompletedGame: team.completedAt ? "Yes" : "No",
        });
      }
    }
    const csv = toCSV(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bsc-summary-${Date.now()}.csv"`,
      },
    });
  }

  // Detail format
  const rows: Record<string, string | number | boolean | null>[] = [];
  for (const team of session.teams) {
    for (const vote of team.votes) {
      const student = team.students.find((s) => s.id === vote.studentId);
      const mission = MISSIONS.find((m) => m.id === vote.missionId);
      rows.push({
        Team: team.name,
        Nickname: student?.nickname ?? "Unknown",
        MissionId: vote.missionId,
        MissionTitle: mission?.title ?? "",
        OptionSelected: vote.optionIndex,
        OptionLabel: mission?.options[vote.optionIndex]?.label ?? "",
        VotedAt: vote.createdAt.toISOString(),
      });
    }
    for (const attempt of team.catalogAttempts) {
      const student = team.students.find((s) => s.id === attempt.studentId);
      rows.push({
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

  const csv = toCSV(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="bsc-detail-${Date.now()}.csv"`,
    },
  });
}
