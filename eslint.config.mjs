// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs", "dist/**", "node_modules/**", "coverage/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ─── TypeScript strict ──────────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-inferrable-types": "error",

      // Prefer interface over type for object shapes
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],

      // Use "import type" for type-only imports (inline style)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // ─── No enums ───────────────────────────────────────────────────────
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: 'Enums are banned. Use "as const" objects with type inference.',
        },
      ],

      // ─── Unused imports / variables ─────────────────────────────────────
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // ─── Import order ───────────────────────────────────────────────────
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. Node.js built-ins
            ["^node:"],
            // 2. NestJS first, then other external packages
            ["^@nestjs", "^@prisma", "^@?\\w"],
            // 3. Internal path aliases (@/common, @/modules, etc.)
            ["^@/"],
            // 4. Parent-relative imports (../)
            ["^\\.\\."],
            // 5. Same-directory relative imports (./)
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",

      // ─── Prettier ───────────────────────────────────────────────────────
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);
