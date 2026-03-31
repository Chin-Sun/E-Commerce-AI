/**
 * Alipay — 当面付 (Face-to-Face / QR code) payment
 *
 * Docs: https://opendocs.alipay.com/open/194/106078
 * API:  alipay.trade.precreate
 *
 * Required env vars (private/public keys must be base64-encoded PKCS8):
 *   ALIPAY_APP_ID       your Alipay Open Platform app ID
 *   ALIPAY_PRIVATE_KEY  base64( PKCS8 RSA2 private key PEM )
 *   ALIPAY_PUBLIC_KEY   base64( Alipay's public key PEM )
 *   ALIPAY_NOTIFY_URL   public HTTPS URL for payment notifications
 */
import axios from "axios";
import crypto from "crypto";
import { ENV } from "./_core/env";

const ALIPAY_GATEWAY = "https://openapi.alipay.com/gateway.do";

export function isAlipayConfigured(): boolean {
  return !!(ENV.alipayAppId && ENV.alipayPrivateKey && ENV.alipayNotifyUrl);
}

/** Sign all Alipay request params using RSA2 (SHA-256 with RSA). */
function sign(params: Record<string, string>): string {
  const content = Object.keys(params)
    .filter(k => params[k] !== "" && params[k] !== undefined)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join("&");

  return crypto
    .createSign("RSA-SHA256")
    .update(content, "utf-8")
    .sign(
      {
        key: ENV.alipayPrivateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      "base64"
    );
}

/** Verify Alipay callback notification signature. */
export function verifyAlipayNotify(params: Record<string, string>): boolean {
  if (!ENV.alipayPublicKey) return false;
  const signValue = params.sign;
  const content = Object.keys(params)
    .filter(k => k !== "sign" && k !== "sign_type" && params[k])
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join("&");

  try {
    return crypto
      .createVerify("RSA-SHA256")
      .update(content, "utf-8")
      .verify(ENV.alipayPublicKey, signValue, "base64");
  } catch {
    return false;
  }
}

/**
 * Create a QR-code payment order (alipay.trade.precreate).
 * Returns the `qr_code` string — encode this as a QR for the customer.
 */
export async function createPrecreateOrder(params: {
  orderId: number;
  subject: string;
  totalYuan: string; // e.g. "99.00"
}): Promise<string> {
  if (!isAlipayConfigured()) {
    throw new Error("Alipay is not configured yet");
  }

  const bizContent = JSON.stringify({
    out_trade_no: `ORDER_${params.orderId}_${Date.now()}`,
    total_amount: params.totalYuan,
    subject: params.subject,
  });

  const now = new Date();
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const reqParams: Record<string, string> = {
    app_id: ENV.alipayAppId,
    method: "alipay.trade.precreate",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp,
    version: "1.0",
    notify_url: ENV.alipayNotifyUrl,
    biz_content: bizContent,
  };

  reqParams.sign = sign(reqParams);

  const formData = new URLSearchParams(reqParams);
  const { data } = await axios.post(ALIPAY_GATEWAY, formData.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const resp = data.alipay_trade_precreate_response;
  if (resp.code !== "10000") {
    throw new Error(`[Alipay] ${resp.sub_msg || resp.msg} (${resp.code})`);
  }

  return resp.qr_code as string;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
