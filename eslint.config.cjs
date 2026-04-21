const { readFileSync } = require('fs');

/** Minimal flat config for ESLint to integrate @angular-eslint and Prettier */
module.exports = [
  {
    ignores: ['projects/**/*'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        createDefaultProgram: true
      }
    },
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': require('@angular-eslint/eslint-plugin')
    },
    extends: ['plugin:@angular-eslint/recommended', 'plugin:prettier/recommended'],
    rules: {}
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: require.resolve('@angular-eslint/template-parser')
    },
    extends: ['plugin:@angular-eslint/template/recommended'],
    rules: {}
  }
];
