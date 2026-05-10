import {
  getUserById,
  checkStockAvailability,
  createOrder,
  clearCart,
  getCartItems,
  getProductById,
  getOrderById,
  decrementProductStock,
} from "../db/db";
import { createCheckoutSession } from "../services/stripe";
import { createNativeOrder, isWechatPayConfigured } from "../services/wechatpay";
import { createPrecreateOrder, isAlipayConfigured } from "../services/alipay";
import { notifyOwner } from "../services/notification";
import { sendSmsAdminAlert } from "../services/sms";
import { ENV } from "../utils/env";

const LOW_STOCK_THRESHOLD = 10;

/* ─── Shipping ─── */

export interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes?: string;
}

export interface ShippingValidationResult {
  valid: boolean;
  pickupInStore?: boolean;
  data?: ShippingInfo;
  missing?: string[];
  prefilled?: Partial<ShippingInfo>;
}

export async function collectAndValidateShipping(
  userId: number,
  raw: Partial<ShippingInfo> & { pickupInStore?: boolean }
): Promise<ShippingValidationResult> {
  if (raw.pickupInStore) {
    return { valid: true, pickupInStore: true };
  }

  const user = await getUserById(userId);
  const prefilled: Partial<ShippingInfo> = {
    name: user?.name ?? undefined,
    email: user?.email ?? undefined,
    phone: user?.phoneNumber ?? undefined,
  };

  const merged = { ...prefilled, ...raw };
  const required: (keyof ShippingInfo)[] = [
    "name", "email", "phone", "address", "city", "state", "zip", "country",
  ];
  const missing = required.filter(k => !merged[k]);

  if (missing.length) return { valid: false, missing, prefilled };
  return { valid: true, data: merged as ShippingInfo };
}

/* ─── Place Order ─── */

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: number;
  totalAmount?: string;
  currency?: string;
  insufficientItems?: { productId: number; requested: number; available: number }[];
}

export async function placeOrder(
  userId: number,
  shipping: ShippingInfo | null,
  items?: OrderItem[],
  currency = "USD"
): Promise<PlaceOrderResult> {
  // Fall back to user's cart when no items explicitly passed
  let orderItems = items ?? [];
  if (!orderItems.length) {
    const cartData = await getCartItems(userId);
    orderItems = cartData.map(ci => ({ productId: ci.productId, quantity: ci.quantity }));
  }
  if (!orderItems.length) {
    return { success: false, insufficientItems: [] };
  }

  const availability = await checkStockAvailability(orderItems);
  const insufficient = availability.filter(a => !a.sufficient);
  if (insufficient.length) {
    return {
      success: false,
      insufficientItems: insufficient.map(a => ({
        productId: a.productId,
        requested: orderItems.find(i => i.productId === a.productId)!.quantity,
        available: a.available,
      })),
    };
  }

  let totalAmount = 0;
  const lineItems = await Promise.all(
    orderItems.map(async i => {
      const product = await getProductById(i.productId);
      const unitPrice = Number(product?.price ?? 0);
      const totalPrice = unitPrice * i.quantity;
      totalAmount += totalPrice;
      return {
        productId: i.productId,
        productName: product?.nameEn ?? "Unknown Product",
        quantity: i.quantity,
        unitPrice: unitPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      };
    })
  );

  const pickupInStore = shipping === null;
  const order = await createOrder(
    {
      userId,
      totalAmount: totalAmount.toFixed(2),
      currency,
      shippingName: pickupInStore ? "N/A" : shipping!.name,
      shippingEmail: pickupInStore ? "" : shipping!.email,
      shippingPhone: pickupInStore ? "" : shipping!.phone,
      shippingAddress: pickupInStore ? "Pick-up in store" : shipping!.address,
      shippingCity: pickupInStore ? "" : shipping!.city,
      shippingState: pickupInStore ? "" : shipping!.state,
      shippingZip: pickupInStore ? "" : shipping!.zip,
      shippingCountry: pickupInStore ? "" : shipping!.country,
      notes: pickupInStore ? "Pick-up in store" : shipping!.notes,
    },
    lineItems
  );

  await clearCart(userId);
  return { success: true, orderId: order.id, totalAmount: totalAmount.toFixed(2), currency };
}

/* ─── Payment Link ─── */

export type PaymentLinkResult =
  | { method: "stripe"; url: string; sessionId: string }
  | { method: "wechat"; qrCode: string }
  | { method: "alipay"; qrCode: string }
  | { method: string; error: string };

export async function generatePaymentLink(
  orderId: number,
  userId: number,
  method: "stripe" | "wechat" | "alipay",
  userEmail: string,
  userName: string,
  origin: string
): Promise<PaymentLinkResult> {
  const order = await getOrderById(orderId);
  if (!order) return { method, error: "Order not found" };
  if (order.userId !== userId) return { method, error: "Forbidden" };
  if (order.status !== "pending") return { method, error: "Order is not pending" };

  try {
    if (method === "stripe") {
      const lineItems = (order.items ?? []).map(i => ({
        name: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      }));
      const result = await createCheckoutSession({
        orderId,
        userId,
        userEmail,
        userName,
        items: lineItems,
        currency: order.currency ?? "USD",
        origin,
      });
      return { method: "stripe", url: result.url!, sessionId: result.sessionId };
    }

    if (method === "wechat") {
      if (!isWechatPayConfigured()) {
        return { method: "wechat", error: "WeChat Pay is not configured yet" };
      }
      // amountCny is in fen (1 CNY = 100 fen); assumes order currency is CNY
      const amountCny = Math.round(Number(order.totalAmount) * 100);
      const qrCode = await createNativeOrder({
        orderId,
        description: `Order #${orderId}`,
        amountCny,
      });
      return { method: "wechat", qrCode };
    }

    // alipay
    if (!isAlipayConfigured()) {
      return { method: "alipay", error: "Alipay is not configured" };
    }
    const qrCode = await createPrecreateOrder({
      orderId,
      subject: `Order #${orderId}`,
      totalYuan: Number(order.totalAmount).toFixed(2),
    });
    return { method: "alipay", qrCode };
  } catch (e: any) {
    return { method, error: e.message ?? "Payment link generation failed" };
  }
}

/* ─── Post-Payment Hook ─── */

export async function handlePostPayment(orderId: number): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) return;

  const stockResults = await Promise.all(
    (order.items ?? []).map(async item => {
      const { newStock } = await decrementProductStock(item.productId, item.quantity);
      return { productId: item.productId, productName: item.productName, newStock };
    })
  );

  const lowStockItems = stockResults.filter(r => r.newStock <= LOW_STOCK_THRESHOLD);
  if (!lowStockItems.length) return;

  const lines = lowStockItems
    .map(r => `  - ${r.productName} (ID: ${r.productId}): ${r.newStock} units remaining`)
    .join("\n");

  // Forge push notification (fire-and-forget)
  notifyOwner({
    title: `Low Stock Alert — Order #${orderId}`,
    content: `The following items are running low after Order #${orderId} was paid:\n${lines}`,
  }).catch(err => console.warn("[orderService] notifyOwner failed:", err));

  // Optional SMS to admin if template is configured
  if (ENV.smsAdminPhone && ENV.smsLowStockTemplateCode) {
    sendSmsAdminAlert(ENV.smsAdminPhone, String(orderId), lowStockItems.length).catch(
      err => console.warn("[orderService] sendSmsAdminAlert failed:", err)
    );
  }

  console.log(`[orderService] Post-payment done for Order #${orderId}. ${lowStockItems.length} low-stock item(s) notified.`);
}
