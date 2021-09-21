require("@hanstack/eslint-config/patch");

module.exports = {
  extends: ["@hanstack/eslint-config/typescript"],
  parserOptions: { tsconfigRootDir: __dirname },
};
