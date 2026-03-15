import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"
import unusedImports from "eslint-plugin-unused-imports"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      // Отключаем стандартное правило no-unused-vars, так как оно конфликтует с @typescript-eslint/no-unused-vars
      "no-unused-vars": "off",
      // Отключаем @typescript-eslint/no-unused-vars, так как используем unused-imports/no-unused-vars
      "@typescript-eslint/no-unused-vars": "off",
      // Автоматическое удаление неиспользуемых импортов (поддерживает --fix)
      "unused-imports/no-unused-imports": "warn",
      // Предупреждение о неиспользуемых переменных (используем вместо @typescript-eslint/no-unused-vars для лучшей поддержки автофикса)
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**"],
  },
]
