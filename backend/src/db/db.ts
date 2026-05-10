import { eq, and, like, sql, inArray, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  categories,
  Category,
  products,
  Product,
  InsertProduct,
  cartItems,
  CartItem,
  orders,
  Order,
  InsertOrder,
  orderItems,
  OrderItem,
  phoneVerifications,
} from "../../../data/drizzle/schema";
import { ENV } from "../utils/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/* ─── User Helpers ─── */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();

  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return rows[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function checkStockAvailability(
  items: { productId: number; quantity: number }[]
): Promise<{ productId: number; available: number; sufficient: boolean }[]> {
  const db = await getDb();
  if (!db) return [];
  const ids = items.map(i => i.productId);
  const rows = await db
    .select({ id: products.id, stock: products.stock })
    .from(products)
    .where(inArray(products.id, ids));
  const stockMap = new Map(rows.map(r => [r.id, r.stock]));
  return items.map(i => {
    const available = stockMap.get(i.productId) ?? 0;
    return { productId: i.productId, available, sufficient: available >= i.quantity };
  });
}

export async function decrementProductStock(
  productId: number,
  quantity: number
): Promise<{ newStock: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(products)
    .set({ stock: sql`GREATEST(0, ${products.stock} - ${quantity})` })
    .where(eq(products.id, productId));
  const rows = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  return { newStock: rows[0]?.stock ?? 0 };
}

/* ─── Category Helpers ─── */

export async function listCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0];
}

/* ─── Product Helpers ─── */

interface ProductFilter {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export async function listProducts(filter: ProductFilter = {}) {
  const db = await getDb();
  if (!db) return { items: [] as Product[], total: 0 };

  const conditions = [];
  if (filter.isActive !== undefined)
    conditions.push(eq(products.isActive, filter.isActive));
  if (filter.categoryId)
    conditions.push(eq(products.categoryId, filter.categoryId));
  if (filter.search) {
    conditions.push(
      sql`(${products.nameEn} LIKE ${`%${filter.search}%`} OR ${products.nameZh} LIKE ${`%${filter.search}%`} OR ${products.sku} LIKE ${`%${filter.search}%`})`
    );
  }
  if (filter.minPrice)
    conditions.push(sql`${products.price} >= ${filter.minPrice}`);
  if (filter.maxPrice)
    conditions.push(sql`${products.price} <= ${filter.maxPrice}`);

  const where = conditions.length ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(filter.limit ?? 50)
      .offset(filter.offset ?? 0),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return rows[0];
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return { id: result[0].insertId };
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

/* ─── Cart Helpers ─── */

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
  if (!items.length) return [];

  const productIds = items.map(i => i.productId);
  const prods = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));
  const prodMap = new Map(prods.map(p => [p.id, p]));

  return items.map(item => ({ ...item, product: prodMap.get(item.productId) }));
}

export async function addToCart(
  userId: number,
  productId: number,
  quantity: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
    )
    .limit(1);

  if (existing.length) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function updateCartQuantity(
  userId: number,
  itemId: number,
  quantity: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
  }
}

export async function removeFromCart(userId: number, itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

/* ─── Order Helpers ─── */

export async function createOrder(
  data: InsertOrder,
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values(data);
  const orderId = result[0].insertId;

  if (items.length) {
    await db
      .insert(orderItems)
      .values(items.map(item => ({ ...item, orderId })));
  }
  return { id: orderId };
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order) return undefined;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));
  return { ...order, items };
}

export async function updateOrderStatus(id: number, status: Order["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function listAllOrders(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return { items: [] as Order[], total: 0 };
  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(orders),
  ]);
  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function updateOrderStripeIds(
  id: number,
  sessionId: string,
  paymentId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: Record<string, string> = { stripeSessionId: sessionId };
  if (paymentId) data.stripePaymentId = paymentId;
  await db.update(orders).set(data).where(eq(orders.id, id));
}

/* ─── Phone Verification Helpers ─── */

export async function createPhoneVerification(
  phone: string,
  code: string,
  expiresAt: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(phoneVerifications).values({ phone, code, expiresAt });
}

/** Returns a verification created in the last 60 seconds (rate-limit check). */
export async function getRecentPhoneVerification(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const oneMinuteAgo = new Date(Date.now() - 60_000);
  const rows = await db
    .select()
    .from(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.phone, phone),
        eq(phoneVerifications.used, false),
        sql`${phoneVerifications.createdAt} > ${oneMinuteAgo}`
      )
    )
    .limit(1);
  return rows[0];
}

/**
 * Verify the OTP.  Returns the verification row on success (and marks it used),
 * or null if the code is wrong / expired / already used.
 */
export async function verifyPhoneOtp(phone: string, code: string) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.phone, phone),
        eq(phoneVerifications.code, code),
        eq(phoneVerifications.used, false),
        sql`${phoneVerifications.expiresAt} > NOW()`
      )
    )
    .limit(1);

  if (!rows[0]) return null;

  await db
    .update(phoneVerifications)
    .set({ used: true })
    .where(eq(phoneVerifications.id, rows[0].id));

  return rows[0];
}

/* ─── Admin Stats ─── */

export async function getAdminStats() {
  const db = await getDb();
  if (!db)
    return { totalProducts: 0, totalOrders: 0, totalRevenue: "0", lowStock: 0 };

  const [[prodCount], [orderCount], [revenue], [lowStockCount]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ count: sql<number>`count(*)` }).from(orders),
      db
        .select({ total: sql<string>`COALESCE(SUM(totalAmount), 0)` })
        .from(orders)
        .where(eq(orders.status, "paid")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(sql`${products.stock} < 10`),
    ]);

  return {
    totalProducts: Number(prodCount?.count ?? 0),
    totalOrders: Number(orderCount?.count ?? 0),
    totalRevenue: revenue?.total ?? "0",
    lowStock: Number(lowStockCount?.count ?? 0),
  };
}
