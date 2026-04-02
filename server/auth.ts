import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import axios from "axios";
import type { Express, Request, Response } from "express";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import {
  exchangeWeChatCode,
  getWeChatAuthUrl,
  getWeChatUserInfo,
} from "./wechat";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function safeBase64Decode(s: string): string {
  try {
    return Buffer.from(s, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

export function registerCustomAuthRoutes(app: Express) {
  /**
   * GET /api/auth/authing/start
   * Redirects to Authing hosted login page (SMS verification).
   */
  app.get("/api/auth/authing/start", (req: Request, res: Response) => {
    if (!ENV.authingAppId || !ENV.authingDomain) {
      res.status(503).send("Authing login is not configured. Set AUTHING_APP_ID, AUTHING_APP_SECRET, AUTHING_DOMAIN.");
      return;
    }
    const returnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : "/";
    const state = Buffer.from(JSON.stringify({ returnTo })).toString("base64");
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/authing/callback`;
    const params = new URLSearchParams({
      client_id: ENV.authingAppId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email phone",
      state,
    });
    res.redirect(302, `https://${ENV.authingDomain}/oidc/auth?${params}`);
  });

  /**
   * GET /api/auth/authing/callback
   * Authing redirects here after SMS authentication.
   */
  app.get("/api/auth/authing/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const stateRaw = typeof req.query.state === "string" ? req.query.state : "";

    if (!code) {
      res.redirect(302, "/?error=authing_no_code");
      return;
    }

    let returnTo = "/";
    try {
      const parsed = JSON.parse(safeBase64Decode(stateRaw));
      if (typeof parsed.returnTo === "string") returnTo = parsed.returnTo;
    } catch { /* use default */ }

    try {
      const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/authing/callback`;

      const { data: tokens } = await axios.post<{ access_token: string }>(
        `https://${ENV.authingDomain}/oidc/token`,
        new URLSearchParams({
          code,
          client_id: ENV.authingAppId,
          client_secret: ENV.authingAppSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { data: profile } = await axios.get<{
        sub: string;
        name?: string;
        email?: string;
        phone_number?: string;
      }>(`https://${ENV.authingDomain}/oidc/me`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const openId = `authing:${profile.sub}`;
      const name = profile.name || profile.phone_number || profile.email || openId;

      await db.upsertUser({
        openId,
        name,
        email: profile.email ?? null,
        loginMethod: "authing",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, { name, expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, returnTo || "/");
    } catch (error) {
      console.error("[Authing Auth] Callback error:", error);
      res.redirect(302, "/?error=authing_auth_failed");
    }
  });

  /**
   * GET /api/auth/google/start
   * Redirects the browser to Google's OAuth consent screen.
   */
  app.get("/api/auth/google/start", (req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      res
        .status(503)
        .send(
          "Google login is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"
        );
      return;
    }
    const returnTo =
      typeof req.query.returnTo === "string" ? req.query.returnTo : "/";
    const state = Buffer.from(JSON.stringify({ returnTo })).toString("base64");
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
    });
    res.redirect(302, `${GOOGLE_AUTH_URL}?${params.toString()}`);
  });

  /**
   * GET /api/auth/google/callback
   * Google redirects here after the user grants access.
   */
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const stateRaw = typeof req.query.state === "string" ? req.query.state : "";

    if (!code) {
      res.redirect(302, "/?error=google_no_code");
      return;
    }

    let returnTo = "/";
    try {
      const parsed = JSON.parse(safeBase64Decode(stateRaw));
      if (typeof parsed.returnTo === "string") returnTo = parsed.returnTo;
    } catch {
      /* use default */
    }

    try {
      const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;

      // Exchange code for tokens
      const { data: tokens } = await axios.post<{
        access_token: string;
        id_token: string;
      }>(
        GOOGLE_TOKEN_URL,
        new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      // Fetch user profile
      const { data: profile } = await axios.get<{
        sub: string;
        name: string;
        email: string;
        picture: string;
      }>(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const openId = `google:${profile.sub}`;
      const name = profile.name || profile.email;

      await db.upsertUser({
        openId,
        name,
        email: profile.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      res.redirect(302, returnTo || "/");
    } catch (error) {
      console.error("[Google Auth] Callback error:", error);
      res.redirect(302, "/?error=google_auth_failed");
    }
  });

  /**
   * GET /api/auth/wechat/start
   * Redirects the browser to the WeChat QR-code login page.
   * Accepts ?returnTo=<path> to redirect back after login.
   */
  app.get("/api/auth/wechat/start", (req: Request, res: Response) => {
    if (!process.env.WECHAT_APP_ID) {
      res.status(503).send("WeChat login is not configured on this server.");
      return;
    }

    const returnTo =
      typeof req.query.returnTo === "string" ? req.query.returnTo : "/";

    const state = Buffer.from(JSON.stringify({ returnTo })).toString("base64");
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/wechat/callback`;
    const authUrl = getWeChatAuthUrl(redirectUri, state);

    res.redirect(302, authUrl);
  });

  /**
   * GET /api/auth/wechat/callback
   * WeChat redirects here after the user scans the QR code.
   * Exchanges the code for a token, creates/updates the user, and sets the
   * session cookie, then redirects back to the original page.
   */
  app.get("/api/auth/wechat/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const stateRaw = typeof req.query.state === "string" ? req.query.state : "";

    if (!code) {
      res.redirect(302, "/?error=wechat_no_code");
      return;
    }

    let returnTo = "/";
    try {
      const parsed = JSON.parse(safeBase64Decode(stateRaw));
      if (typeof parsed.returnTo === "string") returnTo = parsed.returnTo;
    } catch {
      // ignore – use default returnTo
    }

    try {
      const token = await exchangeWeChatCode(code);
      const wechatUser = await getWeChatUserInfo(
        token.access_token,
        token.openid
      );

      // Prefix openId so it never collides with Manus / phone users
      const openId = `wechat:${wechatUser.openid}`;
      const name =
        wechatUser.nickname || `微信用户_${wechatUser.openid.slice(-6)}`;

      await db.upsertUser({
        openId,
        name,
        loginMethod: "wechat",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, returnTo || "/");
    } catch (error) {
      console.error("[WeChat Auth] Callback error:", error);
      res.redirect(302, "/?error=wechat_auth_failed");
    }
  });
}
