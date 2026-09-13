import fs from 'node:fs';
import path from 'node:path';

const projectContent = fs.readFileSync('PROJECT.md', 'utf8');

// The table lines look like:
// | 1 | Tab: Nhân vật / Mối quan hệ | `people.png` | LeftRail Tabs | M1 | spec |
const tableRegex = /\|\s*\d+\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g;

const catToDir = {
  'LeftRail Tabs': 'src/assets/art/tabs',
  'Tứ Tượng Attrs': 'src/assets/art/attrs',
  'HUD Bars': 'src/assets/art/hud',
  'Danger Pins': 'src/assets/art/pins/danger',
  'Exit Pins': 'src/assets/art/pins/exit',
  'Event Pins': 'src/assets/art/pins/event',
  'NPC Pins': 'src/assets/art/pins/npc'
};

let count = 0;
let errors = [];

for (const match of projectContent.matchAll(tableRegex)) {
  count++;
  const featureName = match[1].trim();
  const filename = match[2].trim();
  const category = match[3].trim();
  const dir = catToDir[category];

  if (!dir) {
    errors.push(`Unknown category '${category}' for ${filename}`);
    continue;
  }

  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) {
    errors.push(`File missing on disk: ${filePath} (${featureName})`);
  }
}

console.log(`Matched ${count} entries from PROJECT.md Feature Inventory.`);
if (count !== 121) {
  errors.push(`Expected 121 table rows, got ${count}`);
}

if (errors.length > 0) {
  console.error('PROJECT.MD CROSSCHECK ERRORS:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log('ALL 121 entries in PROJECT.md Feature Inventory exist at exact path on disk!');
}
