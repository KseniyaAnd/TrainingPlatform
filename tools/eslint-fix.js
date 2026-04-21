#!/usr/bin/env node
const { ESLint } = require('eslint');
const fs = require('fs');
const path = require('path');

async function run(files) {
  const eslint = new ESLint({ fix: true, cwd: process.cwd() });
  for (const file of files) {
    try {
      const results = await eslint.lintFiles([file]);
      await ESLint.outputFixes(results);
      const hasError = results.some((r) => r.errorCount > 0);
      const hasWarning = results.some((r) => r.warningCount > 0);
      console.log(
        `${file}: fixed=${results.some((r) => !!r.output)} errors=${results.reduce((a, b) => a + b.errorCount, 0)} warnings=${results.reduce((a, b) => a + b.warningCount, 0)}`,
      );
      // print messages for visibility
      for (const res of results) {
        for (const msg of res.messages) {
          console.log(
            `  ${res.filePath}:${msg.line}:${msg.column} ${msg.severity === 2 ? 'error' : 'warning'} ${msg.ruleId || ''} - ${msg.message}`,
          );
        }
      }
    } catch (err) {
      console.error(`Error linting ${file}:`, err && err.message ? err.message : err);
    }
  }
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node tools/eslint-fix.js <file1> [file2 ...]');
  process.exit(1);
}

run(files).catch((err) => {
  console.error(err);
  process.exit(2);
});
