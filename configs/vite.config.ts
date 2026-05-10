import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  {
    name: "analytics-injector",
    transformIndexHtml() {
      const endpoint = process.env.VITE_ANALYTICS_ENDPOINT;
      if (!endpoint) return [];
      return [{
        tag: "script",
        attrs: {
          defer: true,
          src: `${endpoint}/umami`,
          "data-website-id": process.env.VITE_ANALYTICS_WEBSITE_ID ?? "",
        },
        injectTo: "body" as const,
      }];
    },
  },
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "frontend", "app"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
      "@assets": path.resolve(PROJECT_ROOT, "attached_assets"),
    },
  },
  envDir: PROJECT_ROOT,
  root: path.resolve(PROJECT_ROOT, "frontend"),
  publicDir: path.resolve(PROJECT_ROOT, "frontend", "public"),
  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    // App is served via Express on :3000; force the HMR client websocket
    // to connect back to the same port (otherwise it defaults to 5173).
    hmr: {
      clientPort: 3000,
    },
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
