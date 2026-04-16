import type { Message } from "../_core/llm";

// ── Per-round structured output ───────────────────────────────────────────────
export type AgentStatus = "PENDING" | "NEED_CLARIFICATION" | "DONE";

export interface AgentRound {
  thought: string;
  action: { tool: string; params: Record<string, unknown> } | null;
  observation: unknown | null;
  comparison: string | null;
  status: AgentStatus;
}

// ── Internal state machine ────────────────────────────────────────────────────
export type AgentPhase = "thinking" | "acting" | "done" | "error";

export interface AgentState {
  phase: AgentPhase;
  messages: Message[];
  iterations: number;
  maxIterations: number;
  rounds: AgentRound[];
  collectedProducts: ProductSummary[];
  comparison?: ComparisonResult;
  anchors?: ProductSummary[];
  finalMessage?: string;
  status: AgentStatus;
}

// ── Product domain ────────────────────────────────────────────────────────────
export interface ProductSummary {
  id: number;
  nameEn: string;
  nameZh: string;
  price: string;
  currency: string;
  stock: number;
  images: string[];
  specs: Record<string, string>;
  categoryId: number;
}

// ── CompareService output ─────────────────────────────────────────────────────
export interface SpecDiff {
  key: string;
  values: Record<number, string | undefined>;
  hasDifference: boolean;
}

export interface ComparisonResult {
  products: ProductSummary[];
  specDiffs: SpecDiff[];
  priceRange: { min: string; max: string; currency: string };
  recommendation: string;
}

// ── Adapter contract ──────────────────────────────────────────────────────────
export interface ProductSearchQuery {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export interface ProductSearchAdapter {
  search(q: ProductSearchQuery): Promise<ProductSummary[]>;
  getById(id: number): Promise<ProductSummary | null>;
}

// ── Tool execution ────────────────────────────────────────────────────────────
export interface ToolResult {
  toolCallId: string;
  toolName: string;
  output: unknown;
}

// ── tRPC response ─────────────────────────────────────────────────────────────
export interface AgentResponse {
  message: string;
  status: AgentStatus;
  rounds: AgentRound[];
  products?: ProductSummary[];
  anchors?: ProductSummary[];
  comparison?: ComparisonResult;
  nextPrompts?: string[];
}
