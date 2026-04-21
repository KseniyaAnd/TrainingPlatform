module.exports = {
  extends: "stylelint-config-standard",
  rules: {
    // Allow Tailwind at-rules and @apply
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": [
          "tailwind",
          "apply",
          "variants",
          "responsive",
          "screen",
          "layer"
        ]
      }
    ]
  }
};
