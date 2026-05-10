import type { Tool, ToolCall } from "../services/llm";
import { invokeLLM } from "../services/llm";
import type {
  ComparisonResult,
  ProductSearchAdapter,
  ProductSummary,
  ToolResult,
} from "./types";
import { compareService } from "./compareService";
import {
  collectAndValidateShipping,
  placeOrder,
  generatePaymentLink,
  type ShippingInfo,
} from "./orderService";
import {
  checkStockAvailability,
  getCartItems,
  getUserById,
  getUserOrders,
} from "../db/db";

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
      name: "check_stock",
      description:
        "Check whether requested quantities of one or more products are currently in stock. " +
        "Always call this before create_order to avoid placing orders for out-of-stock items.",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "Products and quantities to check",
            items: {
              type: "object",
              properties: {
                productId: { type: "number", description: "Product ID" },
                quantity: { type: "number", description: "Quantity requested" },
              },
              required: ["productId", "quantity"],
            },
          },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "collect_shipping_info",
      description:
        "Validate shipping details provided by the user. " +
        "Returns validation status and which fields (if any) are still missing. " +
        "Skip by passing pickupInStore=true when the user chooses to pick up in store.",
      parameters: {
        type: "object",
        properties: {
          name:         { type: "string", description: "Recipient full name" },
          email:        { type: "string", description: "Contact email" },
          phone:        { type: "string", description: "Contact phone number" },
          address:      { type: "string", description: "Street address" },
          city:         { type: "string", description: "City" },
          state:        { type: "string", description: "State or province" },
          zip:          { type: "string", description: "Postal / ZIP code" },
          country:      { type: "string", description: "Country" },
          notes:        { type: "string", description: "Optional delivery notes" },
          pickupInStore: { type: "boolean", description: "Set true to skip shipping and pick up in store" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_order",
      description:
        "Place a new order. Only call after collect_shipping_info returns valid:true " +
        "and check_stock confirms all items are available. " +
        "If items is omitted, the user's current cart is used.",
      parameters: {
        type: "object",
        properties: {
          shipping: {
            type: "object",
            description: "Validated shipping info. Pass null if pickupInStore was used.",
            properties: {
              name:    { type: "string" },
              email:   { type: "string" },
              phone:   { type: "string" },
              address: { type: "string" },
              city:    { type: "string" },
              state:   { type: "string" },
              zip:     { type: "string" },
              country: { type: "string" },
              notes:   { type: "string" },
            },
            required: ["name", "email", "phone", "address", "city", "state", "zip", "country"],
          },
          items: {
            type: "array",
            description: "Items to order. Omit to use the user's cart.",
            items: {
              type: "object",
              properties: {
                productId: { type: "number" },
                quantity:  { type: "number" },
              },
              required: ["productId", "quantity"],
            },
          },
          pickupInStore: {
            type: "boolean",
            description: "Pass true when the user chose pick-up in store (no shipping required).",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_payment_link",
      description:
        "Generate a payment URL (Stripe) or QR code (WeChat Pay / Alipay) for a pending order. " +
        "Only call after create_order has returned a valid orderId. " +
        "Ask the user which payment method they prefer before calling.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "number", description: "Order ID from create_order" },
          method: {
            type: "string",
            enum: ["stripe", "wechat", "alipay"],
            description: "Payment method chosen by the user",
          },
        },
        required: ["orderId", "method"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_my_orders",
      description:
        "Retrieve the current user's order history. " +
        "Call when the user asks about their orders, order status, or past purchases.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
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
interface CheckStockArgs { items: { productId: number; quantity: number }[] }
interface CollectShippingArgs extends Partial<ShippingInfo> { pickupInStore?: boolean }
interface CreateOrderArgs { shipping?: ShippingInfo | null; items?: { productId: number; quantity: number }[]; pickupInStore?: boolean }
interface GeneratePaymentArgs { orderId: number; method: "stripe" | "wechat" | "alipay" }

export async function executeTool(
  tc: ToolCall,
  adapter: ProductSearchAdapter,
  userId = 0,
  origin = ""
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

    case "check_stock": {
      const a = args as unknown as CheckStockArgs;
      const results = await checkStockAvailability(a.items);
      return { toolCallId, toolName, output: results };
    }

    case "collect_shipping_info": {
      const a = args as unknown as CollectShippingArgs;
      const result = await collectAndValidateShipping(userId, a);
      return { toolCallId, toolName, output: result };
    }

    case "create_order": {
      const a = args as unknown as CreateOrderArgs;
      const shipping = a.pickupInStore ? null : (a.shipping ?? null);
      const result = await placeOrder(userId, shipping, a.items);
      return { toolCallId, toolName, output: result };
    }

    case "generate_payment_link": {
      const a = args as unknown as GeneratePaymentArgs;
      const user = await getUserById(userId);
      const result = await generatePaymentLink(
        a.orderId,
        userId,
        a.method,
        user?.email ?? "",
        user?.name ?? "",
        origin
      );
      return { toolCallId, toolName, output: result };
    }

    case "get_my_orders": {
      const orders = await getUserOrders(userId);
      return { toolCallId, toolName, output: orders };
    }

    default:
      return { toolCallId, toolName, output: { error: `Unknown tool: ${toolName}` } };
  }
}
