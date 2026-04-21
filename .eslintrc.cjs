module.exports = {
  root: true,
  ignorePatterns: ['projects/**/*'],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['tsconfig.app.json', 'tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
      plugins: ['@typescript-eslint', 'prettier', 'unused-imports'],
      extends: [
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
        'plugin:prettier/recommended',
      ],
      rules: {
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        // auto-remove unused imports
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
        ],
      },
    },
    {
      files: ['**/*.html'],
      extends: ['plugin:@angular-eslint/template/recommended'],
      rules: {
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
      },
    },
  ],
};
