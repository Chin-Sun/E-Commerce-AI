/**
 * Payment notification (webhook) handlers for WeChat Pay and Alipay.
 * Both providers call these endpoints when a payment succeeds.
 */
import type { Express, Request, Response } from "express";
import * as db from "../db/db";
import { decryptNotification } from "../services/wechatpay";
import { verifyAlipayNotify } from "../services/alipay";
import { handlePostPayment } from "../agents/orderService";

export function registerPaymentWebhooks(app: Express) {
  /**
   * POST /api/pay/wechat/notify
   * WeChat Pay calls this when a transaction completes.
   * Docs: https://pay.weixin.qq.com/docs/merchant/apis/native-payment/payment-notice.html
   */
  app.post("/api/pay/wechat/notify", async (req: Request, res: Response) => {
    try {
      const payload = decryptNotification(req.body);
      const tradeState = payload.trade_state as string;
      const outTradeNo = payload.out_trade_no as string; // "ORDER_123_timestamp"

      if (tradeState === "SUCCESS" && outTradeNo) {
        const orderId = parseInt(outTradeNo.split("_")[1] ?? "0", 10);
        if (orderId) {
          await db.updateOrderStatus(orderId, "paid");
          await handlePostPayment(orderId);
        }
      }

      res.status(200).json({ code: "SUCCESS", message: "成功" });
    } catch (error) {
      console.error("[WeChat Pay] Notify error:", error);
      res.status(400).json({ code: "FAIL", message: "处理失败" });
    }
  });

  /**
   * POST /api/pay/alipay/notify
   * Alipay calls this when a transaction completes.
   * Docs: https://opendocs.alipay.com/open/194/103296
   */
  app.post("/api/pay/alipay/notify", async (req: Request, res: Response) => {
    try {
      const params = req.body as Record<string, string>;

      if (!verifyAlipayNotify(params)) {
        console.warn("[Alipay] Invalid notification signature");
        res.status(400).send("fail");
        return;
      }

      const tradeStatus = params.trade_status;
      const outTradeNo = params.out_trade_no; // "ORDER_123_timestamp"

      if (
        (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED") &&
        outTradeNo
      ) {
        const orderId = parseInt(outTradeNo.split("_")[1] ?? "0", 10);
        if (orderId) {
          await db.updateOrderStatus(orderId, "paid");
          await handlePostPayment(orderId);
        }
      }

      // Alipay requires the plain text "success" response to stop retries
      res.status(200).send("success");
    } catch (error) {
      console.error("[Alipay] Notify error:", error);
      res.status(400).send("fail");
    }
  });
}
