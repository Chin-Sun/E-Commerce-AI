import axios from "axios";
import { ENV } from "./_core/env";

const WECHAT_QR_BASE = "https://open.weixin.qq.com/connect/qrconnect";
const WECHAT_TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token";
const WECHAT_USER_URL = "https://api.weixin.qq.com/sns/userinfo";

/**
 * Build the WeChat QR-code authorization URL.
 * The user's browser is redirected here → WeChat shows a QR code page.
 * After scanning, WeChat redirects to redirectUri?code=CODE&state=STATE.
 *
 * Requires WECHAT_APP_ID in .env (from WeChat Open Platform → 网站应用).
 */
export function getWeChatAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    appid: ENV.wechatAppId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "snsapi_login",
    state,
  });
  return `${WECHAT_QR_BASE}?${params.toString()}#wechat_redirect`;
}

export type WeChatToken = {
  access_token: string;
  openid: string;
  unionid?: string;
};

export type WeChatUserInfo = {
  openid: string;
  nickname: string;
  headimgurl: string;
  unionid?: string;
};

/**
 * Exchange the one-time authorization code for an access token + openid.
 */
export async function exchangeWeChatCode(code: string): Promise<WeChatToken> {
  const { data } = await axios.get<
    WeChatToken & { errcode?: number; errmsg?: string }
  >(WECHAT_TOKEN_URL, {
    params: {
      appid: ENV.wechatAppId,
      secret: ENV.wechatAppSecret,
      code,
      grant_type: "authorization_code",
    },
  });

  if (data.errcode) {
    throw new Error(
      `[WeChat] Token exchange failed: ${data.errmsg} (${data.errcode})`
    );
  }

  return data;
}

/**
 * Fetch the WeChat user's public profile (nickname, avatar, etc.).
 */
export async function getWeChatUserInfo(
  accessToken: string,
  openId: string
): Promise<WeChatUserInfo> {
  const { data } = await axios.get<
    WeChatUserInfo & { errcode?: number; errmsg?: string }
  >(WECHAT_USER_URL, {
    params: {
      access_token: accessToken,
      openid: openId,
      lang: "zh_CN",
    },
  });

  if (data.errcode) {
    throw new Error(
      `[WeChat] User info failed: ${data.errmsg} (${data.errcode})`
    );
  }

  return data;
}
