import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(import.meta.dirname) },
      { find: "@shared", replacement: path.resolve(import.meta.dirname) },
      {
        find: /^@\/components\/ui\/(.*)$/,
        replacement: path.resolve(import.meta.dirname, "$1"),
      },
      {
        find: /^@\/components\/(.*)$/,
        replacement: path.resolve(import.meta.dirname, "$1"),
      },
      {
        find: /^@\/pages\/(.*)$/,
        replacement: path.resolve(import.meta.dirname, "$1"),
      },
      {
        find: /^@\/hooks\/(.*)$/,
        replacement: path.resolve(import.meta.dirname, "$1"),
      },
      {
        find: /^@\/lib\/(.*)$/,
        replacement: path.resolve(import.meta.dirname, "$1"),
      },
      {
        find: "@assets",
        replacement: path.resolve(import.meta.dirname, "attached_assets"),
      },
    ],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
        },     },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
