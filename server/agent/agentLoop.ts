import { invokeLLM, invokeLLMStream, type Message, type ToolCall } from "../_core/llm";
import { compareService } from "./compareService";
import { AGENT_TOOLS, executeTool } from "./tools";
import { loadSession, buildLLMContext, appendAndPersist } from "./conversationStore";
import type {
  AgentResponse,
  AgentRound,
  AgentState,
  AgentStatus,
  ComparisonResult,
  ProductSearchAdapter,
  ProductSummary,
  ToolResult,
} from "./types";

const SYSTEM_MESSAGE: Message = {
  role: "system",
  content: `You are a proactive hardware product expert assistant. Always reply in the user's language.

Rules:
1. Always call search_products before answering product questions — never guess about inventory.
2. Call request_clarification if the user's need is too vague to search effectively.
3. Call compare_products PROACTIVELY when:
   - You have shown 2 or more products and the user has not committed to one
   - The user says: "which one", "not sure", "help me decide", "差不多", "哪个", "undecided", "比较"
4. Be concise. Mention product IDs (e.g. "Product #12") in your text so the UI can render cards.
5. When you have enough information, stop calling tools and give a final answer.
6. PARALLEL TOOLS: When multiple independent lookups are needed (e.g. details on product #5 AND #7, or two category searches), call ALL relevant tools in a single response — do not wait for one result before calling the next.`,
};

function extractProducts(toolResults: ToolResult[]): ProductSummary[] {
  const out: ProductSummary[] = [];
  for (const tr of toolResults) {
    if (tr.toolName === "search_products" && Array.isArray(tr.output)) {
      out.push(...(tr.output as ProductSummary[]));
    }
    if (tr.toolName === "get_product" && tr.output && typeof tr.output === "object") {
      out.push(tr.output as ProductSummary);
    }
    if (tr.toolName === "compare_products" && tr.output && typeof tr.output === "object") {
      const cr = tr.output as ComparisonResult;
      if (Array.isArray(cr.products)) out.push(...cr.products);
    }
  }
  return out;
}

function deduplicateById(products: ProductSummary[]): ProductSummary[] {
  const seen = new Set<number>();
  return products.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

function generateNextPrompts(state: AgentState): string[] {
  if (state.comparison) {
    return ["Add the recommended product to cart", "Tell me more about the top pick"];
  }
  if (state.collectedProducts.length >= 2) {
    return ["Compare these products", "Which one has the best value?"];
  }
  if (state.collectedProducts.length === 1) {
    return ["Add to cart", "Show me similar products"];
  }
  return ["Show me popular products", "What categories do you carry?"];
}

function buildResponse(state: AgentState): AgentResponse {
  return {
    message: state.finalMessage ?? "I couldn't process your request.",
    status: state.status,
    rounds: state.rounds,
    products: state.collectedProducts.length ? state.collectedProducts : undefined,
    anchors: state.anchors,
    comparison: state.comparison,
    nextPrompts: generateNextPrompts(state),
  };
}

export async function runAgentLoop(
  userId: number,
  newUserMessage: string,
  adapter: ProductSearchAdapter
): Promise<AgentResponse> {
  const session      = await loadSession(userId);
  const userMessages = buildLLMContext(session, newUserMessage);

  let state: AgentState = {
    phase: "thinking",
    messages: [SYSTEM_MESSAGE, ...userMessages],
    iterations: 0,
    maxIterations: 5,
    rounds: [],
    collectedProducts: [],
    status: "PENDING",
  };

  while (state.phase !== "done" && state.phase !== "error") {
    // ── THINKING ─────────────────────────────────────────────────────────────
    const llmResult = await invokeLLM({
      messages: state.messages,
      tools: AGENT_TOOLS,
    });
    const choice = llmResult.choices[0].message;
    const thought =
      typeof choice.content === "string"
        ? choice.content
        : Array.isArray(choice.content)
          ? choice.content
              .filter(p => p.type === "text")
              .map(p => (p as { type: "text"; text: string }).text)
              .join("")
          : "";

    // No tool calls → DONE
    if (!choice.tool_calls?.length) {
      const round: AgentRound = {
        thought,
        action: null,
        observation: null,
        comparison: null,
        status: "DONE",
      };
      state = {
        ...state,
        phase: "done",
        status: "DONE",
        rounds: [...state.rounds, round],
        finalMessage: thought,
      };
      break;
    }

    // ── ACTING ────────────────────────────────────────────────────────────────
    state = { ...state, phase: "acting", iterations: state.iterations + 1 };
    if (state.iterations > state.maxIterations) {
      state = { ...state, phase: "error", status: "DONE", finalMessage: thought };
      break;
    }

    const toolResults = await Promise.all(
      choice.tool_calls.map(tc => executeTool(tc, adapter))
    );

    // ── OBSERVING: build rounds ───────────────────────────────────────────────
    const newRounds: AgentRound[] = choice.tool_calls.map((tc, i) => {
      const tr = toolResults[i];
      let comparison: string | null = null;
      let roundStatus: AgentStatus = "PENDING";

      if (tr.toolName === "compare_products" && tr.output) {
        const cr = tr.output as ComparisonResult;
        const partial = compareService.diff(cr.products);
        comparison = compareService.summarize(partial);
      }
      if (tr.toolName === "request_clarification") {
        roundStatus = "NEED_CLARIFICATION";
      }

      const params = JSON.parse(tc.function.arguments) as Record<string, unknown>;

      return {
        thought,
        action: { tool: tr.toolName, params },
        observation: tr.output,
        comparison,
        status: roundStatus,
      };
    });

    // NEED_CLARIFICATION → exit immediately, return anchors
    const clarRound = newRounds.find(r => r.status === "NEED_CLARIFICATION");
    if (clarRound) {
      const clarTr = toolResults.find(t => t.toolName === "request_clarification")!;
      const clarOutput = clarTr.output as { question: string; anchors: ProductSummary[] };
      const clarResponse = buildResponse({
        ...state,
        rounds: [...state.rounds, clarRound],
        anchors: clarOutput.anchors,
        status: "NEED_CLARIFICATION",
        finalMessage: clarOutput.question,
      });
      appendAndPersist(userId, newUserMessage, clarResponse.message, session);
      return clarResponse;
    }

    // Collect products and comparison from this iteration
    const newProducts = extractProducts(toolResults);
    const compareTr = toolResults.find(t => t.toolName === "compare_products");
    const compareResult = compareTr?.output as ComparisonResult | undefined;

    // Re-inject assistant + tool results into messages, loop back to THINKING
    state = {
      ...state,
      phase: "thinking",
      messages: [
        ...state.messages,
        {
          role: "assistant",
          content: thought,
          // Cast to any: the Message type doesn't include tool_calls directly
          // but invokeLLM returns them; we pass them back for proper context threading
          ...(choice.tool_calls.length ? { tool_calls: choice.tool_calls } : {}),
        } as Message,
        ...toolResults.map(tr => ({
          role: "tool" as const,
          tool_call_id: tr.toolCallId,
          content: JSON.stringify(tr.output),
        })),
      ],
      rounds: [...state.rounds, ...newRounds],
      collectedProducts: deduplicateById([
        ...state.collectedProducts,
        ...newProducts,
      ]),
      comparison: compareResult ?? state.comparison,
    };
  }

  const response = buildResponse(state);

  // fire-and-forget: does not block response to client
  appendAndPersist(userId, newUserMessage, response.message, session);

  return response;
}

/* ── Streaming variant ──────────────────────────────────────────────────────── */

export type AgentStreamEvent =
  | { type: "tool_start"; tools: string[] }
  | { type: "token"; content: string }
  | { type: "result"; data: AgentResponse }
  | { type: "error"; message: string };

export async function* runAgentLoopStream(
  userId: number,
  newUserMessage: string,
  adapter: ProductSearchAdapter
): AsyncGenerator<AgentStreamEvent> {
  const session      = await loadSession(userId);
  const userMessages = buildLLMContext(session, newUserMessage);

  let state: AgentState = {
    phase: "thinking",
    messages: [SYSTEM_MESSAGE, ...userMessages],
    iterations: 0,
    maxIterations: 5,
    rounds: [],
    collectedProducts: [],
    status: "PENDING",
  };

  while (state.phase !== "done" && state.phase !== "error") {
    // ── Stream one LLM turn ────────────────────────────────────────────────────
    let accContent = "";
    let isToolCallTurn = false;
    // Map from index → accumulated ToolCall (built up from deltas)
    const tcMap = new Map<number, { id: string; name: string; args: string }>();

    for await (const chunk of invokeLLMStream({ messages: state.messages, tools: AGENT_TOOLS })) {
      if (chunk.type === "content" && chunk.text) {
        accContent += chunk.text;
        if (!isToolCallTurn) {
          yield { type: "token", content: chunk.text };
        }
      } else if (chunk.type === "tool_call_delta") {
        isToolCallTurn = true;
        const entry = tcMap.get(chunk.index) ?? { id: "", name: "", args: "" };
        if (chunk.id)   entry.id   += chunk.id;
        if (chunk.name) entry.name += chunk.name;
        if (chunk.args) entry.args += chunk.args;
        tcMap.set(chunk.index, entry);
      }
      // "done" chunk just signals stream end — loop exits naturally
    }

    if (!isToolCallTurn) {
      // ── Final text response — already streamed token by token ────────────────
      state = {
        ...state,
        phase: "done",
        status: "DONE",
        finalMessage: accContent,
        rounds: [
          ...state.rounds,
          { thought: accContent, action: null, observation: null, comparison: null, status: "DONE" },
        ],
      };
      break;
    }

    // ── Tool call turn ─────────────────────────────────────────────────────────
    state = { ...state, phase: "acting", iterations: state.iterations + 1 };
    if (state.iterations > state.maxIterations) {
      state = { ...state, phase: "error", status: "DONE", finalMessage: accContent };
      break;
    }

    const toolCalls: ToolCall[] = Array.from(tcMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([, tc]) => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.name, arguments: tc.args },
      }));

    yield { type: "tool_start", tools: toolCalls.map(tc => tc.function.name) };

    const toolResults = await Promise.all(
      toolCalls.map(tc => executeTool(tc, adapter))
    );

    // Check for clarification early exit
    const clarTr = toolResults.find(t => t.toolName === "request_clarification");
    if (clarTr) {
      const clarOutput = clarTr.output as { question: string; anchors: ProductSummary[] };
      const clarState: AgentState = {
        ...state,
        anchors: clarOutput.anchors,
        status: "NEED_CLARIFICATION",
        finalMessage: clarOutput.question,
        rounds: [
          ...state.rounds,
          {
            thought: accContent,
            action: { tool: "request_clarification", params: {} },
            observation: clarOutput,
            comparison: null,
            status: "NEED_CLARIFICATION",
          },
        ],
      };
      const response = buildResponse(clarState);
      appendAndPersist(userId, newUserMessage, response.message, session);
      yield { type: "result", data: response };
      return;
    }

    // Collect products and comparison
    const newProducts = extractProducts(toolResults);
    const compareTr   = toolResults.find(t => t.toolName === "compare_products");
    const compareResult = compareTr?.output as ComparisonResult | undefined;

    const newRounds: AgentRound[] = toolCalls.map((tc, i) => {
      const tr = toolResults[i];
      let comparison: string | null = null;
      if (tr.toolName === "compare_products" && tr.output) {
        const cr = tr.output as ComparisonResult;
        comparison = compareService.summarize(compareService.diff(cr.products));
      }
      const params = JSON.parse(tc.function.arguments) as Record<string, unknown>;
      return { thought: accContent, action: { tool: tr.toolName, params }, observation: tr.output, comparison, status: "PENDING" as AgentStatus };
    });

    state = {
      ...state,
      phase: "thinking",
      messages: [
        ...state.messages,
        { role: "assistant", content: accContent, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) } as Message,
        ...toolResults.map(tr => ({
          role: "tool" as const,
          tool_call_id: tr.toolCallId,
          content: JSON.stringify(tr.output),
        })),
      ],
      rounds: [...state.rounds, ...newRounds],
      collectedProducts: deduplicateById([...state.collectedProducts, ...newProducts]),
      comparison: compareResult ?? state.comparison,
    };
  }

  const response = buildResponse(state);
  appendAndPersist(userId, newUserMessage, response.message, session);
  yield { type: "result", data: response };
}
