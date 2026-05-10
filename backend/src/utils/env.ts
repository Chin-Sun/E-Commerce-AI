export const ENV = {
  appId: process.env.VITE_APP_ID ?? "hardware_ecommerce",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID ?? "",
  ossAccessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? "",
  ossBucket: process.env.OSS_BUCKET ?? "",
  ossRegion: process.env.OSS_REGION ?? "",
  ossCdnDomain: (process.env.OSS_CDN_DOMAIN ?? "").replace(/^https?:\/\//, ""),
  // Google OAuth credentials
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // WeChat Pay (微信支付) v3
  wechatPayMchId: process.env.WECHAT_PAY_MCH_ID ?? "",
  wechatPayAppId: process.env.WECHAT_PAY_APP_ID ?? "",
  wechatPayCertSerial: process.env.WECHAT_PAY_CERT_SERIAL ?? "",
  wechatPayPrivateKey: process.env.WECHAT_PAY_PRIVATE_KEY
    ? Buffer.from(process.env.WECHAT_PAY_PRIVATE_KEY, "base64").toString(
        "utf-8"
      )
    : "",
  wechatPayApiKeyV3: process.env.WECHAT_PAY_API_KEY_V3 ?? "",
  wechatPayNotifyUrl: process.env.WECHAT_PAY_NOTIFY_URL ?? "",
  // Alipay (支付宝)
  alipayAppId: process.env.ALIPAY_APP_ID ?? "",
  alipayPrivateKey: process.env.ALIPAY_PRIVATE_KEY
    ? Buffer.from(process.env.ALIPAY_PRIVATE_KEY, "base64").toString("utf-8")
    : "",
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY
    ? Buffer.from(process.env.ALIPAY_PUBLIC_KEY, "base64").toString("utf-8")
    : "",
  alipayNotifyUrl: process.env.ALIPAY_NOTIFY_URL ?? "",
  // WeChat Open Platform credentials
  wechatAppId: process.env.WECHAT_APP_ID ?? "",
  wechatAppSecret: process.env.WECHAT_APP_SECRET ?? "",
  // Alibaba Cloud SMS (阿里云短信服务)
  smsAccessKeyId: process.env.SMS_ACCESS_KEY_ID ?? "",
  smsAccessKeySecret: process.env.SMS_ACCESS_KEY_SECRET ?? "",
  smsSignName: process.env.SMS_SIGN_NAME ?? "五金商城",
  smsTemplateCode: process.env.SMS_TEMPLATE_CODE ?? "",
  // Admin low-stock SMS alert (separate template with {orderNumber, count} vars)
  smsAdminPhone: process.env.SMS_ADMIN_PHONE ?? "",
  smsLowStockTemplateCode: process.env.SMS_LOW_STOCK_TEMPLATE_CODE ?? "",
  // Authing OIDC
  authingAppId: process.env.AUTHING_APP_ID ?? "",
  authingAppSecret: process.env.AUTHING_APP_SECRET ?? "",
  authingDomain: (process.env.AUTHING_DOMAIN ?? "").replace(/^https?:\/\//, ""),
  // Forge API (used by dataApi, imageGeneration, map, notification, voiceTranscription)
  forgeApiKey: process.env.FORGE_API_KEY ?? "",
  forgeApiUrl: process.env.FORGE_API_URL ?? "",
  // DeepSeek API (used by llm.ts / AI agent)
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
  // Deepgram API (used by voiceTranscription streaming)
  deepgramApiKey: process.env.DEEPGRAM_API_KEY ?? "",
};
