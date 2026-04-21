import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { createCheckoutSession } from "./payment/stripe";
import { sendSmsOtp } from "./auth/sms";
import { storagePut } from "./storage";
import {
  createNativeOrder as createWechatPayOrder,
  isWechatPayConfigured,
} from "./payment/wechatpay";
import {
  createPrecreateOrder as createAlipayOrder,
  isAlipayConfigured,
} from "./payment/alipay";

/* ─── Admin guard ─── */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

/* ─── Auth Router ─── */
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  /**
   * Send a 6-digit SMS OTP to the given phone number.
   * Rate-limited to one request per minute per phone number.
   */
  sendOtp: publicProcedure
    .input(z.object({ phone: z.string().min(8).max(20) }))
    .mutation(async ({ input }) => {
      const recent = await db.getRecentPhoneVerification(input.phone);
      if (recent) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "请稍候再试 / Please wait before requesting another code",
        });
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      await db.createPhoneVerification(input.phone, code, expiresAt);
      await sendSmsOtp(input.phone, code);

      return { success: true } as const;
    }),

  /**
   * Verify the OTP and log the user in by setting a session cookie.
   * Creates a new user account if this phone number has not been seen before.
   */
  verifyOtp: publicProcedure
    .input(
      z.object({ phone: z.string().min(8).max(20), code: z.string().length(6) })
    )
    .mutation(async ({ ctx, input }) => {
      const verification = await db.verifyPhoneOtp(input.phone, input.code);
      if (!verification) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "验证码无效或已过期 / Invalid or expired code",
        });
      }

      const openId = `phone:${input.phone}`;

      await db.upsertUser({
        openId,
        phoneNumber: input.phone,
        name: input.phone,
        loginMethod: "phone",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user?.name || input.phone,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true } as const;
    }),
});

/* ─── Category Router ─── */
const categoryRouter = router({
  list: publicProcedure.query(() => db.listCategories()),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => db.getCategoryBySlug(input.slug)),
});

/* ─── Product Router ─── */
const productRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          categoryId: z.number().optional(),
          search: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().min(0).optional(),
        })
        .optional()
    )
    .query(({ input }) => db.listProducts({ ...input, isActive: true })),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getProductById(input.id)),
  featured: publicProcedure.query(() =>
    db.listProducts({ isActive: true, limit: 8 })
  ),
});

/* ─── Cart Router ─── */
const cartRouter = router({
  get: protectedProcedure.query(({ ctx }) => db.getCartItems(ctx.user.id)),
  add: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(({ ctx, input }) =>
      db.addToCart(ctx.user.id, input.productId, input.quantity)
    ),
  updateQuantity: protectedProcedure
    .input(z.object({ itemId: z.number(), quantity: z.number().min(0) }))
    .mutation(({ ctx, input }) =>
      db.updateCartQuantity(ctx.user.id, input.itemId, input.quantity)
    ),
  remove: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(({ ctx, input }) => db.removeFromCart(ctx.user.id, input.itemId)),
  clear: protectedProcedure.mutation(({ ctx }) => db.clearCart(ctx.user.id)),
});

/* ─── Order Router ─── */
const orderRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        shippingName: z.string().min(1),
        shippingEmail: z.string().email(),
        shippingPhone: z.string().min(1),
        shippingAddress: z.string().min(1),
        shippingCity: z.string().min(1),
        shippingState: z.string().min(1),
        shippingZip: z.string().min(1),
        shippingCountry: z.string().min(1),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cartData = await db.getCartItems(ctx.user.id);
      if (!cartData.length)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });

      let totalAmount = 0;
      const items = cartData.map(ci => {
        const price = Number(ci.product?.price ?? 0);
        const total = price * ci.quantity;
        totalAmount += total;
        return {
          productId: ci.productId,
          productName: ci.product?.nameEn ?? "Unknown",
          quantity: ci.quantity,
          unitPrice: price.toFixed(2),
          totalPrice: total.toFixed(2),
        };
      });

      const order = await db.createOrder(
        {
          userId: ctx.user.id,
          totalAmount: totalAmount.toFixed(2),
          ...input,
        },
        items
      );

      await db.clearCart(ctx.user.id);
      return order;
    }),
  checkout: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (order.status !== "pending")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order already processed",
        });

      const items = (order.items ?? []).map(i => ({
        name: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      }));

      const origin =
        ctx.req.headers.origin ||
        `${ctx.req.protocol}://${ctx.req.get("host")}`;
      return createCheckoutSession({
        orderId: order.id,
        userId: ctx.user.id,
        userEmail: ctx.user.email ?? "",
        userName: ctx.user.name ?? "",
        items,
        currency: order.currency ?? "USD",
        origin,
      });
    }),
  /**
   * Create a WeChat Pay or Alipay native QR order.
   * Returns the raw QR data string (code_url / qr_code) for display.
   */
  getPaymentQr: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        method: z.enum(["wechat", "alipay"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.userId !== ctx.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (order.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order already paid",
        });
      }

      const amountCny = Math.round(Number(order.totalAmount) * 100); // convert to fen
      const description = `HardwareMart Order #${order.id}`;

      if (input.method === "wechat") {
        if (!isWechatPayConfigured()) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "WECHAT_PAY_NOT_CONFIGURED",
          });
        }
        const qrData = await createWechatPayOrder({
          orderId: order.id,
          description,
          amountCny,
        });
        return { qrData, amount: order.totalAmount, currency: "CNY" };
      } else {
        if (!isAlipayConfigured()) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "ALIPAY_NOT_CONFIGURED",
          });
        }
        const qrData = await createAlipayOrder({
          orderId: order.id,
          subject: description,
          totalYuan: Number(order.totalAmount).toFixed(2),
        });
        return { qrData, amount: order.totalAmount, currency: "CNY" };
      }
    }),

  myOrders: protectedProcedure.query(({ ctx }) =>
    db.getUserOrders(ctx.user.id)
  ),
  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return order;
    }),
});

/* ─── Admin Router ─── */
const adminRouter = router({
  stats: adminProcedure.query(() => db.getAdminStats()),
  uploadImage: adminProcedure
    .input(z.object({ base64: z.string(), filename: z.string() }))
    .mutation(async ({ input }) => {
      const matches = input.base64.match(/^data:(.+);base64,(.+)$/);
      const contentType = matches?.[1] ?? "image/jpeg";
      const raw = matches?.[2] ?? input.base64;
      const buffer = Buffer.from(raw, "base64");
      const ext = input.filename.split(".").pop() ?? "jpg";
      const key = `products/${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, contentType);
      return { url };
    }),
  products: router({
    list: adminProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            categoryId: z.number().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
          .optional()
      )
      .query(({ input }) => db.listProducts(input)),
    create: adminProcedure
      .input(
        z.object({
          sku: z.string().min(1),
          categoryId: z.number(),
          nameEn: z.string().min(1),
          nameZh: z.string().min(1),
          nameZhTw: z.string().min(1),
          nameMs: z.string().min(1),
          descEn: z.string().optional(),
          descZh: z.string().optional(),
          descZhTw: z.string().optional(),
          descMs: z.string().optional(),
          specs: z.record(z.string(), z.string()).optional(),
          price: z.string(),
          currency: z.string().default("USD"),
          stock: z.number().default(0),
          images: z.array(z.string()).optional(),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(({ input }) => db.createProduct(input as any)),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            sku: z.string().optional(),
            categoryId: z.number().optional(),
            nameEn: z.string().optional(),
            nameZh: z.string().optional(),
            nameZhTw: z.string().optional(),
            nameMs: z.string().optional(),
            descEn: z.string().optional(),
            descZh: z.string().optional(),
            descZhTw: z.string().optional(),
            descMs: z.string().optional(),
            specs: z.record(z.string(), z.string()).optional(),
            price: z.string().optional(),
            currency: z.string().optional(),
            stock: z.number().optional(),
            images: z.array(z.string()).optional(),
            isActive: z.boolean().optional(),
          }),
        })
      )
      .mutation(({ input }) => db.updateProduct(input.id, input.data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteProduct(input.id)),
  }),
  orders: router({
    list: adminProcedure
      .input(
        z
          .object({
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
          .optional()
      )
      .query(({ input }) => db.listAllOrders(input?.limit, input?.offset)),
    byId: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getOrderById(input.id)),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum([
            "pending",
            "paid",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ]),
        })
      )
      .mutation(({ input }) => db.updateOrderStatus(input.id, input.status)),
  }),
});

/* ─── Root Router ─── */
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  category: categoryRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
