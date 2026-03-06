// ESLint configuration for Umbra v2
// Focused on modern browser JS with Prettier for formatting.

module.exports = {
  env: {
    browser: true,
    es2022: true
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "no-console": ["warn", { allow: ["error"] }],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
  }
};

