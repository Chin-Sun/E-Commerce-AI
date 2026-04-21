import crypto from "crypto";
import axios from "axios";
import { ENV } from "../_core/env";

/**
 * Send an SMS OTP via Alibaba Cloud SMS (阿里云短信服务).
 *
 * In development (no SMS_ACCESS_KEY_ID set) the code is printed to the
 * console so you can test without a real SMS account.
 *
 * Production setup:
 *   1. Create an Alibaba Cloud account → https://www.aliyun.com
 *   2. Enable Dysms (短信服务) and apply for a signature + template.
 *   3. Set SMS_ACCESS_KEY_ID, SMS_ACCESS_KEY_SECRET, SMS_SIGN_NAME,
 *      SMS_TEMPLATE_CODE in your .env file.
 *
 * The SMS template should contain the variable ${code}, e.g.:
 *   "您的验证码是${code}，10分钟内有效，请勿泄露。"
 */
export async function sendSmsOtp(phone: string, code: string): Promise<void> {
  if (!ENV.smsAccessKeyId || !ENV.smsAccessKeySecret) {
    // Development mode: just log the OTP
    console.log(`[SMS-DEV] 📱 Phone: ${phone}  →  Verification code: ${code}`);
    return;
  }

  const params: Record<string, string> = {
    AccessKeyId: ENV.smsAccessKeyId,
    Action: "SendSms",
    Format: "JSON",
    PhoneNumbers: phone,
    RegionId: "cn-hangzhou",
    SignName: ENV.smsSignName,
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: crypto.randomUUID().replace(/-/g, ""),
    SignatureVersion: "1.0",
    TemplateCode: ENV.smsTemplateCode,
    TemplateParam: JSON.stringify({ code }),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    Version: "2017-05-25",
  };

  // Build canonical query string (sorted keys, percent-encoded)
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${encode(k)}=${encode(params[k])}`)
    .join("&");

  const stringToSign = `GET&${encode("/")}&${encode(sorted)}`;
  const signature = crypto
    .createHmac("sha1", `${ENV.smsAccessKeySecret}&`)
    .update(stringToSign)
    .digest("base64");

  const { data } = await axios.get(
    `https://dysmsapi.aliyuncs.com/?${sorted}&Signature=${encode(signature)}`
  );

  if (data.Code !== "OK") {
    throw new Error(
      `[SMS] Alibaba Cloud error: ${data.Message} (${data.Code})`
    );
  }
}

function encode(str: string): string {
  return encodeURIComponent(str)
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");
}
