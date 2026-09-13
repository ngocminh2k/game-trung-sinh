import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dirs = [
  { path: 'src/assets/art/tabs', expectedCount: 6 },
  { path: 'src/assets/art/attrs', expectedCount: 4 },
  { path: 'src/assets/art/hud', expectedCount: 3 },
  { path: 'src/assets/art/pins/danger', expectedCount: 9 },
  { path: 'src/assets/art/pins/exit', expectedCount: 16 },
  { path: 'src/assets/art/pins/event', expectedCount: 23 },
  { path: 'src/assets/art/pins/npc', expectedCount: 60 }
];

let totalFiles = 0;
const hashes = new Map();
const allFiles = [];
let errors = [];

for (const d of dirs) {
  const fullDir = path.resolve(d.path);
  if (!fs.existsSync(fullDir)) {
    errors.push(`Directory does not exist: ${d.path}`);
    continue;
  }
  const allEntries = fs.readdirSync(fullDir);
  const nonPng = allEntries.filter(f => !f.endsWith('.png'));
  if (nonPng.length > 0) {
    errors.push(`Unexpected non-png files in ${d.path}: ${nonPng.join(', ')}`);
  }
  const files = allEntries.filter(f => f.endsWith('.png'));
  console.log(`${d.path.padEnd(28)}: found ${files.length} (expected ${d.expectedCount})`);
  if (files.length !== d.expectedCount) {
    errors.push(`Count mismatch in ${d.path}: expected ${d.expectedCount}, found ${files.length}`);
  }
  totalFiles += files.length;
  for (const f of files) {
    // Check kebab-case
    if (!/^[a-z0-9]+(-[a-z0-9]+)*\.png$/.test(f)) {
      errors.push(`Filename not kebab-case: ${d.path}/${f}`);
    }
    const fPath = path.join(fullDir, f);
    const content = fs.readFileSync(fPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    if (hashes.has(hash)) {
      errors.push(`DUPLICATE DETECTED: ${d.path}/${f} has identical content to ${hashes.get(hash)}`);
    } else {
      hashes.set(hash, `${d.path}/${f}`);
    }
    allFiles.push({ dir: d.path, file: f, size: content.length, hash });
  }
}

console.log('\n--- Summary ---');
console.log(`Total PNG files found: ${totalFiles}`);
console.log(`Unique SHA256 hashes : ${hashes.size}`);
if (errors.length > 0) {
  console.error('\nERRORS FOUND:');
  for (const e of errors) {
    console.error(' - ' + e);
  }
  process.exit(1);
} else {
  console.log('\nALL 121 FILES HAVE UNIQUE HASHES, PROPER COUNTS, AND VALID KEBAB-CASE NAMES!');
}
