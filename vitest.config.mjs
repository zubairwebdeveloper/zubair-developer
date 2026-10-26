import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const resolvePath = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: resolvePath("./") },
      {
        find: "server-only",
        replacement: resolvePath("./tests/stubs/server-only.js"),
      },
    ],
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.{js,jsx}"],
    exclude: ["tests/rules/**", "tests/e2e/**"],
    css: false,
  },
});
