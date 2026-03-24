#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const force = process.argv.includes('--force');

const claudeDirFlag = process.argv.indexOf('--claude-dir');
const dest = claudeDirFlag !== -1
  ? path.resolve(process.argv[claudeDirFlag + 1])
  : path.join(os.homedir(), '.claude');

if (claudeDirFlag !== -1 && !process.argv[claudeDirFlag + 1]) {
  console.error('Error: --claude-dir requires a path argument');
  process.exit(1);
}

const src = path.join(__dirname, '..', '.claude');
const categories = ['agents', 'commands'];

let installed = [];
let skipped = [];

for (const category of categories) {
  const srcDir = path.join(src, category);
  const destDir = path.join(dest, category);

  if (!fs.existsSync(srcDir)) continue;

  fs.mkdirSync(destDir, { recursive: true });

  for (const file of fs.readdirSync(srcDir)) {
    if (!file.endsWith('.md')) continue;

    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    if (fs.existsSync(destFile) && !force) {
      skipped.push(`  ${destFile} (already exists — use --force to overwrite)`);
      continue;
    }

    fs.copyFileSync(srcFile, destFile);
    installed.push(`  ${destFile}`);
  }
}

console.log('\ncc-sdlc install\n');
console.log(`Installing to: ${dest}\n`);

if (installed.length > 0) {
  console.log('Installed:');
  installed.forEach(f => console.log(f));
}

if (skipped.length > 0) {
  console.log('\nSkipped:');
  skipped.forEach(f => console.log(f));
}

if (installed.length === 0 && skipped.length === 0) {
  console.log('Nothing to install.');
}

console.log('\nDone. Open a new Claude Code session to use /orchestrate.\n');
