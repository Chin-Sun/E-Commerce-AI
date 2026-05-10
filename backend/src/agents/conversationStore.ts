import { eq } from "drizzle-orm";
import { getDb } from "../db/db";
import { chatSessions, type StoredMessage } from "../../../data/drizzle/schema";
import { invokeLLM } from "../services/llm";
import type { Message } from "../services/llm";

export type { StoredMessage };

export type ConversationSession = {
  messages: StoredMessage[];
  summary: string | null;
};

const KEEP_RECENT_TURNS = 6;   // last 6 turns (12 messages) always sent to LLM
const TOKEN_THRESHOLD   = 3000; // trigger summary when stored history exceeds this

// ~2 chars per token for mixed Chinese/English
function estimateTokens(messages: StoredMessage[]): number {
  return Math.ceil(
    messages.reduce((sum, m) => sum + m.content.length, 0) / 2
  );
}

export async function loadSession(userId: number): Promise<ConversationSession> {
  const db = await getDb();
  if (!db) return { messages: [], summary: null };

  const rows = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .limit(1);

  if (!rows[0]) return { messages: [], summary: null };
  return { messages: rows[0].messages, summary: rows[0].summary ?? null };
}

export function buildLLMContext(
  session: ConversationSession,
  newUserMessage: string
): Message[] {
  const recentWindow = session.messages.slice(-(KEEP_RECENT_TURNS * 2));
  const context: Message[] = [];

  if (session.summary) {
    context.push({
      role: "system",
      content: `[Earlier conversation context]: ${session.summary}`,
    });
  }

  for (const m of recentWindow) {
    context.push({ role: m.role, content: m.content });
  }

  context.push({ role: "user", content: newUserMessage });
  return context;
}

export async function appendAndPersist(
  userId: number,
  userMessage: string,
  assistantMessage: string,
  session: ConversationSession
): Promise<void> {
  try {
    const updated: StoredMessage[] = [
      ...session.messages,
      { role: "user",      content: userMessage },
      { role: "assistant", content: assistantMessage },
    ];

    let messages = updated;
    let summary  = session.summary;

    if (estimateTokens(updated) > TOKEN_THRESHOLD) {
      const keepCount = KEEP_RECENT_TURNS * 2;
      const older     = updated.slice(0, updated.length - keepCount);
      const recent    = updated.slice(-keepCount);
      summary  = await generateSummary(older, session.summary);
      messages = recent;
    }

    const db = await getDb();
    if (!db) return;

    await db
      .insert(chatSessions)
      .values({ userId, messages, summary: summary ?? undefined })
      .onDuplicateKeyUpdate({ set: { messages, summary: summary ?? null } });
  } catch (err) {
    console.error("[conversationStore] persist failed:", err);
  }
}

async function generateSummary(
  older: StoredMessage[],
  prevSummary: string | null
): Promise<string> {
  const transcript = older
    .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const userPrompt = prevSummary
    ? `You previously summarized the conversation as:\n"${prevSummary}"\n\nExtend that summary to include:\n${transcript}`
    : `Summarize the following conversation in 3–5 sentences, focusing on products discussed, user preferences, and decisions made:\n${transcript}`;

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a concise summarizer. Produce a factual summary for use as context in future turns.",
      },
      { role: "user", content: userPrompt },
    ],
  });

  const msg = result.choices[0].message;
  if (typeof msg.content === "string") return msg.content;
  return (msg.content as Array<{ type: string; text?: string }>)
    .filter(p => p.type === "text")
    .map(p => p.text ?? "")
    .join("");
}
