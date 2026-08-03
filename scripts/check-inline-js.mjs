#!/usr/bin/env node
// Extracts each inline <script> block from the static HTML page and syntax-checks
// it with `node --check`. There's no build step for this site, so this is the
// only thing standing between a typo in the inline JS and a broken page in prod.
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const file = process.argv[2] || 'public/index.html';
const html = readFileSync(file, 'utf8');

const scriptRe = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let failed = false;

while ((match = scriptRe.exec(html))) {
  const attrs = match[1];
  const body = match[2];
  if (/\bsrc\s*=/.test(attrs)) continue;
  if (/type\s*=\s*["'](?!text\/javascript["'])[^"']*["']/i.test(attrs)) continue;
  if (!body.trim()) continue;
  count++;
  const dir = mkdtempSync(join(tmpdir(), 'inline-js-'));
  const tmp = join(dir, 'script.js');
  writeFileSync(tmp, body);
  try {
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
  } catch (err) {
    failed = true;
    console.error(`Inline <script> #${count} failed syntax check:\n${err.stderr?.toString() || err.message}`);
  }
}

if (failed) {
  process.exit(1);
}
console.log(`Checked ${count} inline <script> block(s) in ${file} — all valid.`);
