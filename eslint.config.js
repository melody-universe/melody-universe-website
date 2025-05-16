// @ts-check

import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import tailwindcss from "@hyoban/eslint-plugin-tailwindcss";
import perfectionist from "eslint-plugin-perfectionist";
import pluginReact from "eslint-plugin-react";
import fs from "fs";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";

export default tseslint.config([
  { ignores: [".react-router", "build"] },
  {
    extends: [js.configs.recommended],
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: { js },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  {
    extends: [
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat["jsx-runtime"],
    ],
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    extends: [json.configs.recommended],
    files: ["**/*.json"],
    language: "json/json",
    plugins: { json },
  },
  {
    extends: [json.configs.recommended],
    files: ["**/*.jsonc"],
    language: "json/jsonc",
    plugins: { json },
  },
  {
    extends: [json.configs.recommended],
    files: ["**/*.json5"],
    language: "json/json5",
    plugins: { json },
  },
  {
    extends: [markdown.configs.recommended],
    files: ["**/*.md"],
    language: "markdown/gfm",
    plugins: { markdown },
  },
  tailwindcss.configs["flat/recommended"],
  {
    extends: [perfectionist.configs["recommended-natural"]],
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    settings: {
      react: {
        version: "detect",
      },
      tailwindcss: {
        config: findTailwindImportCss(process.cwd()),
      },
    },
  },
]);

/**
 * Recursively walks `dir`, looking for the first .css file
 * that has a line starting with \@import "tailwindcss
 *
 * https://github.com/hyoban/eslint-plugin-tailwindcss/pull/3#issuecomment-2860221137
 *
 * @param {string} dir  absolute path to start searching from
 * @returns {string|null}  absolute path to matching CSS, or null if none found
 *
 * @example
 * const twCssPath = findTailwindImportCss(process.cwd())
 */
function findTailwindImportCss(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const found = findTailwindImportCss(fullPath);
      if (found) return found;
    } else if (entry.isFile() && entry.name.endsWith(".css")) {
      // read & scan lines
      const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
      for (let line of lines) {
        if (line.trim().startsWith('@import "tailwindcss')) {
          return fullPath;
        }
      }
    }
  }

  return null;
}
