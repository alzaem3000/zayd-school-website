import { readFileSync, existsSync } from "node:fs";

const requiredFiles = ["tsconfig.json", "vite.config.ts", "vitest.config.ts", ".gitignore"];
const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error(`Missing required files: ${missing.join(", ")}`);
  process.exit(1);
}

const tsconfig = JSON.parse(readFileSync("tsconfig.json", "utf8"));
const vitest = readFileSync("vitest.config.ts", "utf8");
const gitignore = readFileSync(".gitignore", "utf8");

const checks = [
  {
    ok: Array.isArray(tsconfig.include) && tsconfig.include.includes("*.tsx"),
    message: "tsconfig include should target current flat TS/TSX structure",
  },
  {
    ok: vitest.includes("**/*.{test,spec}.{js,ts}"),
    message: "vitest include should detect tests in root and subfolders",
  },
  {
    ok: gitignore.includes("node_modules/"),
    message: ".gitignore should ignore node_modules",
  },
];

const failed = checks.filter((c) => !c.ok);
if (failed.length > 0) {
  for (const fail of failed) {
    console.error(`✗ ${fail.message}`);
  }
  process.exit(1);
}

for (const check of checks) {
  console.log(`✓ ${check.message}`);
}
