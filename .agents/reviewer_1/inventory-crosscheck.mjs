import fs from 'node:fs';
import path from 'node:path';

// Parse asset request doc
const docContent = fs.readFileSync('docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md', 'utf8');

// Match `filename.png` in each section
const docMatches = [...docContent.matchAll(/`([a-z0-9-]+\.png)`/g)].map(m => m[1]);
// Note that some filenames may appear in text multiple times (e.g. market.png in exit and tabs)
console.log(`Total filename mentions in asset request doc: ${docMatches.length}`);

// Parse PROJECT.md
const projectContent = fs.readFileSync('PROJECT.md', 'utf8');
const projectMatches = [...projectContent.matchAll(/`([a-z0-9-]+\.png)`/g)].map(m => m[1]);
console.log(`Total filename mentions in PROJECT.md: ${projectMatches.length}`);

// Let's check verify-ui-icons.mjs ICON_CATEGORIES
import { ICON_CATEGORIES } from '../../scripts/verify-ui-icons.mjs';

let verifyCategoriesTotal = 0;
let errors = [];

for (const [catName, catData] of Object.entries(ICON_CATEGORIES)) {
  const dirPath = catData.dir;
  const files = catData.files;
  verifyCategoriesTotal += files.length;
  
  // Verify that all files in verify-ui-icons exist on disk
  for (const f of files) {
    const p = path.join(dirPath, f);
    if (!fs.existsSync(p)) {
      errors.push(`File in verify script missing on disk: ${p}`);
    }
  }

  // Verify that all files on disk are in verify script
  const diskFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.png'));
  for (const df of diskFiles) {
    if (!files.includes(df)) {
      errors.push(`File on disk not in verify script: ${path.join(dirPath, df)}`);
    }
  }
}

console.log(`Verify script lists ${verifyCategoriesTotal} files.`);
if (errors.length > 0) {
  console.error('MISMATCHES:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log('PERFECT 1:1 MATCH between verify-ui-icons.mjs categories and disk files!');
}
