import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["**/*.{test,spec}.{js,ts}"],
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      "@shared": path.resolve(__dirname),
    },
  },
});
