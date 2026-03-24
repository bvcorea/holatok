import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { auth } from "@/auth";
import { PERSONAS, type PersonaKey } from "@/lib/personas";
import { createChatSession, saveMessage, updateSessionTitle } from "@repo/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json() as {
    messages: Array<{ role: string; content: string }>;
    persona: PersonaKey;
    sessionId?: string;
  };

  const { messages, persona, sessionId } = body;
  const personaConfig = PERSONAS[persona];
  if (!personaConfig) {
    return new Response("Invalid persona", { status: 400 });
  }

  // Create session on first message
  let activeSessionId = sessionId;
  if (!activeSessionId && messages.length === 1) {
    const newSession = await createChatSession(
      session.user.id,
      persona,
      "es"
    );
    activeSessionId = newSession.id;
  }

  // Save user message
  const lastUserMessage = messages[messages.length - 1];
  if (activeSessionId && lastUserMessage?.role === "user") {
    await saveMessage(activeSessionId, "USER", lastUserMessage.content);

    // Auto-title on first message
    if (messages.length === 1) {
      const title = lastUserMessage.content.slice(0, 60);
      await updateSessionTitle(activeSessionId, title);
    }
  }

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
  });

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: personaConfig.systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    maxOutputTokens: 600,
    onFinish: async ({ text, usage }) => {
      if (activeSessionId) {
        await saveMessage(
          activeSessionId,
          "ASSISTANT",
          text,
          usage.outputTokens ?? 0
        );
      }
    },
  });

  return result.toTextStreamResponse({
    headers: {
      "x-session-id": activeSessionId ?? "",
    },
  });
}
