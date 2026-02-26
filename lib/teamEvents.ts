import { prisma } from "@/lib/prisma";

export interface TeamEventInput {
  sessionId: string;
  teamId: string;
  eventType: string;
  payload?: Record<string, unknown>;
  createdAt?: Date;
}

export async function recordTeamEvent(input: TeamEventInput) {
  await prisma.teamEvent.create({
    data: {
      sessionId: input.sessionId,
      teamId: input.teamId,
      eventType: input.eventType,
      payloadJson: JSON.stringify(input.payload ?? {}),
      ...(input.createdAt ? { createdAt: input.createdAt } : {}),
    },
  });
}
