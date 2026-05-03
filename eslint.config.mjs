import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // Disallow console.log in production code — use structured logging
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Catch accidental var usage
      "no-var": "error",

      // Prevent unused variables slipping through
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Explicit return types on exported functions improve readability
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // Disallow explicit `any` — use `unknown` + type guards
      "@typescript-eslint/no-explicit-any": "error",

      // Ban `as any` and double `as unknown as X` casts from spreading
      "@typescript-eslint/no-unsafe-assignment": "off",

      // Prefer const where possible
      "prefer-const": "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "generated/**",
    "next-env.d.ts",
    "*.config.js",
    "postcss.config.mjs",
  ]),
]);

export default eslintConfig;
