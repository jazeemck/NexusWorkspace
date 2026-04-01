import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "run.js",
    "lint_results*.json",
    "check-schema.ts",
    "run.js",
    "tmp-gemini-test.ts",
    "gemini-error.json",
  ]),
]);

export default eslintConfig;
