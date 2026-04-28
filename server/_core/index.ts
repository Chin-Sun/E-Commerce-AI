import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerCustomAuthRoutes } from "../auth";
import { registerPaymentWebhooks } from "../payments";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerStripeWebhook } from "../stripe";
import { sdk } from "./sdk";
import { runAgentLoopStream } from "../agent";
import { defaultAdapter } from "../agent";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const server = createServer(app);
  // Stripe webhook must be registered BEFORE body parsers (needs raw body)
  registerStripeWebhook(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Legacy Manus OAuth callback (kept for admin fallback)
  registerOAuthRoutes(app);
  // WeChat QR login routes
  registerCustomAuthRoutes(app);
  // WeChat Pay + Alipay payment notification webhooks
  registerPaymentWebhooks(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // SSE streaming endpoint for AI chat
  app.post("/api/ai/stream", async (req, res) => {
    let user: Awaited<ReturnType<typeof sdk.authenticateRequest>> | null = null;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { message } = req.body as { message?: string };
    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (event: object) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    try {
      for await (const event of runAgentLoopStream(user.id, message.trim(), defaultAdapter)) {
        send(event);
      }
    } catch (err) {
      send({ type: "error", message: String(err) });
    } finally {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
