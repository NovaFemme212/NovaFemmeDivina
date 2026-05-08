import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { createRequire } from "module";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

// Rollup 4 (used by Vite 7) cannot follow wildcard subpath exports such as
// the "./*" pattern in @clerk/shared/package.json. This plugin intercepts
// every "@clerk/shared/<subpath>" import and resolves it to a concrete file
// path using Node's own resolution algorithm, which honours package exports
// correctly, and hands Rollup an absolute path it can understand.
const clerkSharedResolver = (): import("vite").Plugin => {
  const req = createRequire(import.meta.url);
  return {
    name: "resolve-clerk-shared-subpaths",
    resolveId(id: string) {
      if (!id.startsWith("@clerk/shared/")) return;
      try {
        return req.resolve(id);
      } catch {
        const subpath = id.slice("@clerk/shared/".length);
        try {
          return req.resolve(`@clerk/shared/dist/runtime/${subpath}.mjs`);
        } catch {
          return;
        }
      }
    },
  };
};

export default defineConfig({
  base: basePath,
  plugins: [
    clerkSharedResolver(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@clerk/react", "@clerk/shared"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
