import { describe, expect, it } from "vitest";
import { appRouter } from "../routes/routers";
import { COOKIE_NAME } from "@shared/const";
import type { TrpcContext } from "../middleware/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as any,
  };
}

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    phoneNumber: null,
    loginMethod: "email",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {}, get: () => "localhost:3000" } as any,
    res: { clearCookie: () => {} } as any,
  };
}

describe("category.list", () => {
  it("returns an array of categories", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.category.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("product.list", () => {
  it("returns items array and total count", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.product.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("filters by search term", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.product.list({ search: "bearing" });
    expect(result).toHaveProperty("items");
  });
});

describe("product.featured", () => {
  it("returns featured products", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.product.featured();
    expect(result).toHaveProperty("items");
    expect(result.items.length).toBeLessThanOrEqual(8);
  });
});

describe("cart operations", () => {
  it("requires authentication for cart.get", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.cart.get()).rejects.toThrow();
  });

  it("allows authenticated user to get cart", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.cart.get();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("order operations", () => {
  it("requires authentication for myOrders", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.order.myOrders()).rejects.toThrow();
  });

  it("allows authenticated user to list orders", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.order.myOrders();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("admin operations", () => {
  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("allows admin to get stats", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalProducts");
    expect(result).toHaveProperty("totalOrders");
    expect(result).toHaveProperty("totalRevenue");
    expect(result).toHaveProperty("lowStock");
  });
});
