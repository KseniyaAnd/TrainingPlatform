module.exports = {
  // Provide the actual plugin functions to PostCSS so Angular's pipeline uses
  // the installed plugin instances instead of resolving names. This avoids a
  // mismatch with any internal plugin wrapper that could load an incompatible
  // PostCSS adapter.
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};