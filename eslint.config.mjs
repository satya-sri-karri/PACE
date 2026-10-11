import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";
export default [
  {
    ignores: [
      "dist/**",
      ".next/**",
      "work/**",
      ".sites-runtime/**",
      ".agents/**",
      ".codex/**",
      "node_modules/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    settings: { react: { version: "19.2" } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "jsx-a11y/no-noninteractive-tabindex": ["error", { roles: ["region"] }],
      "react/jsx-key": "error",
      "react/no-danger": "error",
      "react/no-unknown-property": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
