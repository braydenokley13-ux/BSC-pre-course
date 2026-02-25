import { NextRequest } from "next/server";
import { parseStudentToken } from "@/lib/iron";
import { prisma } from "@/lib/prisma";

export async function getStudentFromRequest(req: NextRequest) {
  const token = parseStudentToken(req.headers.get("cookie"));
  if (!token) return null;
  return prisma.student.findUnique({ where: { token } });
}
