module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer', 'source'],
      },
    ],
    'at-rule-empty-line-before': null,
    'import-notation': null,
  },
};
