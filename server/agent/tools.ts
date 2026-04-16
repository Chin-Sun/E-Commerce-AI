import type { Tool, ToolCall } from "../_core/llm";
import { invokeLLM } from "../_core/llm";
import type {
  ComparisonResult,
  ProductSearchAdapter,
  ProductSummary,
  ToolResult,
} from "./types";
import { compareService } from "./compareService";

export const AGENT_TOOLS: Tool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search the hardware product catalog. Call this whenever the user asks about " +
        "products, categories, price ranges, or availability. Returns up to 6 results.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Free-text search (product name, material, use case)",
          },
          categoryId: { type: "number", description: "Category ID to filter by" },
          minPrice: { type: "number", description: "Minimum price in store currency" },
          maxPrice: { type: "number", description: "Maximum price in store currency" },
          limit: { type: "number", description: "Max results (1-6, default 6)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product",
      description:
        "Fetch full details (all specs, images, stock) for a single product by ID. " +
        "Use after search_products when the user wants more detail on a specific item.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "Product ID from a prior search_products result",
          },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_products",
      description:
        "Compare 2-4 products side-by-side across all specs and price. " +
        "CALL THIS PROACTIVELY when: the user says 'which one', 'not sure', " +
        "'help me decide', '差不多', '哪个好', 'undecided', or when you have shown " +
        "2+ products and the user has not yet chosen one.",
      parameters: {
        type: "object",
        properties: {
          ids: {
            type: "array",
            items: { type: "number" },
            description: "Array of 2 to 4 product IDs to compare side by side",
          },
        },
        required: ["ids"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_clarification",
      description:
        "Use when the user's request is too vague to search confidently " +
        "(e.g. just 'hardware', 'something cheap', or a very broad category). " +
        "Ask one focused clarifying question. The system will automatically fetch " +
        "2-3 representative product anchors for the user to react to.",
      parameters: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The clarifying question to ask the user",
          },
          searchHint: {
            type: "string",
            description: "Broad keyword for preheating anchor products (e.g. 'bolt', 'bearing')",
          },
        },
        required: ["question"],
      },
    },
  },
];

interface SearchArgs { keyword?: string; categoryId?: number; minPrice?: number; maxPrice?: number; limit?: number }
interface GetArgs { id: number }
interface CompareArgs { ids: number[] }
interface ClarifyArgs { question: string; searchHint?: string }

export async function executeTool(
  tc: ToolCall,
  adapter: ProductSearchAdapter
): Promise<ToolResult> {
  const toolCallId = tc.id;
  const toolName = tc.function.name;
  const args = JSON.parse(tc.function.arguments) as Record<string, unknown>;

  switch (toolName) {
    case "search_products": {
      const a = args as SearchArgs;
      const results = await adapter.search({
        keyword: a.keyword,
        categoryId: a.categoryId,
        minPrice: a.minPrice,
        maxPrice: a.maxPrice,
        limit: a.limit,
      });
      return { toolCallId, toolName, output: results };
    }

    case "get_product": {
      const a = args as unknown as GetArgs;
      const product = await adapter.getById(a.id);
      return { toolCallId, toolName, output: product };
    }

    case "compare_products": {
      const a = args as unknown as CompareArgs;
      const products = (
        await Promise.all(a.ids.map(id => adapter.getById(id)))
      ).filter((p): p is ProductSummary => p !== null);

      const partial = compareService.diff(products);

      // One extra LLM call to generate a short recommendation
      let recommendation = "";
      try {
        const rec = await invokeLLM({
          messages: [
            {
              role: "user",
              content:
                `Given these products: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.nameEn, price: p.price, specs: p.specs })))} ` +
                `and these spec differences: ${compareService.summarize(partial)}, ` +
                `write one sentence recommending which product is best and why.`,
            },
          ],
        });
        const content = rec.choices[0]?.message?.content;
        recommendation = typeof content === "string" ? content : "";
      } catch {
        recommendation = "See spec differences above.";
      }

      const result: ComparisonResult = { ...partial, recommendation };
      return { toolCallId, toolName, output: result };
    }

    case "request_clarification": {
      const a = args as unknown as ClarifyArgs;
      const anchors = a.searchHint
        ? await adapter.search({ keyword: a.searchHint, limit: 3 })
        : await adapter.search({ limit: 3 });
      return {
        toolCallId,
        toolName,
        output: { question: a.question, anchors },
      };
    }

    default:
      return { toolCallId, toolName, output: { error: `Unknown tool: ${toolName}` } };
  }
}
