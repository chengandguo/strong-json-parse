module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    indent: "off",
    "@typescript-eslint/indent": ["error", 2],
    semi: ["error", "always"],
  },
};
