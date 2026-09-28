import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import agentStack from "./eslint-plugin-agent-stack.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { "agent-stack": agentStack },
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "agent-stack/require-define-action": "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
