require('@hanstack/eslint-config/patch')

module.exports = {
  extends: ['@hanstack/eslint-config/react'],
  parserOptions: { tsconfigRootDir: __dirname },
}
