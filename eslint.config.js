const js = require("@eslint/js");
const globals = require("globals");
const html = require("eslint-plugin-html");

module.exports = [
  { ignores: ["node_modules/"] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // скрипт усередині index.html працює в браузері, не в Node
    files: ["public/**/*.html"],
    plugins: { html },
    languageOptions: { sourceType: "script", globals: globals.browser },
  },
];
