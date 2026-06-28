import js from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: [
      ".angular/**",
      ".nx/**",
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "**/*.js",
    ],
  },
  {
    files: ["**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
      "@angular-eslint/no-output-on-prefix": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            constructors: "explicit",
          },
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "no-new-wrappers": "error",
      "no-throw-literal": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "no-invalid-this": "off",
      "@typescript-eslint/no-invalid-this": ["warn"],
      "@angular-eslint/no-host-metadata-property": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  prettier,
);
