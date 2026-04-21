module.exports = {
  // Use postcss-scss parser so Tailwind directives and modern PostCSS at-rules are parsed correctly
  customSyntax: 'postcss-scss',
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-scss',
    'stylelint-prettier/recommended',
  ],
  plugins: ['stylelint-scss'],
  rules: {
    // Allow Tailwind at-rules and directives like @apply
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer'],
      },
    ],
  },
};
