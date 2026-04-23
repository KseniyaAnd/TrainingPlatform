module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['theme', 'source', 'utility', 'variant', 'custom-variant'],
      },
    ],
    'at-rule-empty-line-before': null,
    'import-notation': null,
  },
};
