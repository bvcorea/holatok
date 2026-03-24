import { prisma } from "../index";
import type { Persona, Locale } from "@prisma/client";

export async function createChatSession(
  userId: string,
  persona: Persona,
  locale: Locale = "es"
) {
  return prisma.chatSession.create({
    data: { userId, persona, locale },
  });
}

export async function getChatSession(sessionId: string, userId: string) {
  return prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getUserChatSessions(userId: string) {
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: {
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function saveMessage(
  sessionId: string,
  role: "USER" | "ASSISTANT",
  content: string,
  tokens?: number
) {
  const [message] = await Promise.all([
    prisma.chatMessage.create({
      data: { sessionId, role, content, tokens },
    }),
    prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return message;
}

export async function updateSessionTitle(sessionId: string, title: string) {
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: { title },
  });
}
