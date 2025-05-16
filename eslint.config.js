// @ts-check

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import tailwindcss from "@hyoban/eslint-plugin-tailwindcss";
import fs from "fs";
import path from "path";

export default tseslint.config([
  { ignores: [".react-router", "build"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: { js },
    extends: [js.configs.recommended],
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
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: [json.configs.recommended],
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: [json.configs.recommended],
  },
  {
    files: ["**/*.json5"],
    plugins: { json },
    language: "json/json5",
    extends: [json.configs.recommended],
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: [markdown.configs.recommended],
  },
  tailwindcss.configs["flat/recommended"],
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
