/**
 * WeChat Pay v3 — Native (QR code) payment
 *
 * Docs: https://pay.weixin.qq.com/docs/merchant/apis/native-payment/
 *
 * Required env vars (all base64-encoded where noted):
 *   WECHAT_PAY_MCH_ID        merchant ID
 *   WECHAT_PAY_APP_ID        WeChat app ID bound to the merchant
 *   WECHAT_PAY_CERT_SERIAL   merchant certificate serial number
 *   WECHAT_PAY_PRIVATE_KEY   base64( PEM apiclient_key.pem )
 *   WECHAT_PAY_API_KEY_V3    32-char API v3 key (for callback decryption)
 *   WECHAT_PAY_NOTIFY_URL    public HTTPS URL for payment notifications
 */
import axios from "axios";
import crypto from "crypto";
import { ENV } from "../_core/env";

const WECHAT_PAY_BASE = "https://api.mch.weixin.qq.com";

export function isWechatPayConfigured(): boolean {
  return !!(
    ENV.wechatPayMchId &&
    ENV.wechatPayAppId &&
    ENV.wechatPayCertSerial &&
    ENV.wechatPayPrivateKey &&
    ENV.wechatPayNotifyUrl
  );
}

/** Build the Authorization header required by every v3 API call. */
function buildAuth(method: string, urlPath: string, body: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const message = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;

  const sign = crypto
    .createSign("RSA-SHA256")
    .update(message)
    .sign(ENV.wechatPayPrivateKey, "base64");

  return (
    `WECHATPAY2-SHA256-RSA2048 ` +
    `mchid="${ENV.wechatPayMchId}",` +
    `nonce_str="${nonce}",` +
    `timestamp="${timestamp}",` +
    `serial_no="${ENV.wechatPayCertSerial}",` +
    `signature="${sign}"`
  );
}

/**
 * Create a native (QR code) payment order.
 * Returns the `code_url` string — encode this as a QR code for the customer.
 */
export async function createNativeOrder(params: {
  orderId: number;
  description: string;
  amountCny: number; // in fen (1 CNY = 100 fen)
}): Promise<string> {
  if (!isWechatPayConfigured()) {
    throw new Error("WeChat Pay is not configured yet");
  }

  const urlPath = "/v3/pay/transactions/native";
  const body = JSON.stringify({
    appid: ENV.wechatPayAppId,
    mchid: ENV.wechatPayMchId,
    description: params.description,
    out_trade_no: `ORDER_${params.orderId}_${Date.now()}`,
    notify_url: ENV.wechatPayNotifyUrl,
    amount: { total: params.amountCny, currency: "CNY" },
  });

  const { data } = await axios.post<{ code_url: string }>(
    `${WECHAT_PAY_BASE}${urlPath}`,
    body,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: buildAuth("POST", urlPath, body),
      },
    }
  );

  return data.code_url;
}

/**
 * Verify and decrypt a WeChat Pay payment notification.
 * Call this inside the /api/pay/wechat/notify route.
 * Returns the decrypted resource object containing trade status.
 */
export function decryptNotification(body: {
  resource: {
    algorithm: string;
    ciphertext: string;
    nonce: string;
    associated_data: string;
  };
}): Record<string, unknown> {
  const { ciphertext, nonce, associated_data } = body.resource;
  const key = Buffer.from(ENV.wechatPayApiKeyV3, "utf-8");
  const ciphertextBuf = Buffer.from(ciphertext, "base64");
  const authTag = ciphertextBuf.slice(ciphertextBuf.length - 16);
  const data = ciphertextBuf.slice(0, ciphertextBuf.length - 16);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(nonce, "utf-8")
  );
  decipher.setAuthTag(authTag);
  decipher.setAAD(Buffer.from(associated_data, "utf-8"));

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString("utf-8"));
}
