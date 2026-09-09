import fs from 'node:fs';
import path from 'node:path';

const docContent = fs.readFileSync('docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md', 'utf8');

// The doc sections:
// 1. Icon NPC pin trên map — 60 file -> src/assets/art/pins/npc/
// 2. Icon điểm sự kiện trên map — 23 file -> src/assets/art/pins/event/
// 3. Icon điểm nguy hiểm trên map — 9 file -> src/assets/art/pins/danger/
// 4. Icon cửa vùng (exit pin) — 16 file -> src/assets/art/pins/exit/
// 5. Icon tab LeftRail — 6 file -> src/assets/art/tabs/
// 6. Icon Tứ Tượng (tetragrammaton) — 4 file -> src/assets/art/attrs/
// 7. Icon HUD phụ — 3 file -> src/assets/art/hud/

const sections = [
  { name: 'NPC', header: '## 1. Icon NPC pin', dir: 'src/assets/art/pins/npc', count: 60 },
  { name: 'Event', header: '## 2. Icon điểm sự kiện', dir: 'src/assets/art/pins/event', count: 23 },
  { name: 'Danger', header: '## 3. Icon điểm nguy hiểm', dir: 'src/assets/art/pins/danger', count: 9 },
  { name: 'Exit', header: '## 4. Icon cửa vùng', dir: 'src/assets/art/pins/exit', count: 16 },
  { name: 'Tabs', header: '## 5. Icon tab LeftRail', dir: 'src/assets/art/tabs', count: 6 },
  { name: 'Attrs', header: '## 6. Icon Tứ Tượng', dir: 'src/assets/art/attrs', count: 4 },
  { name: 'HUD', header: '## 7. Icon HUD phụ', dir: 'src/assets/art/hud', count: 3 }
];

let allPassed = true;

for (let i = 0; i < sections.length; i++) {
  const s = sections[i];
  const nextHeader = i < sections.length - 1 ? sections[i+1].header : '## Tổng kết';
  const startIdx = docContent.indexOf(s.header);
  const endIdx = docContent.indexOf(nextHeader, startIdx);
  const sectionText = docContent.substring(startIdx, endIdx);

  const filenames = [...sectionText.matchAll(/`([a-z0-9-]+\.png)`/g)].map(m => m[1]);
  console.log(`Section ${s.name}: parsed ${filenames.length} filenames (expected ${s.count})`);

  if (filenames.length !== s.count) {
    console.error(`  Count mismatch in doc section ${s.name}!`);
    allPassed = false;
  }

  const diskFiles = new Set(fs.readdirSync(s.dir).filter(f => f.endsWith('.png')));
  for (const fn of filenames) {
    if (!diskFiles.has(fn)) {
      console.error(`  Missing on disk: ${s.dir}/${fn}`);
      allPassed = false;
    }
  }

  for (const df of diskFiles) {
    if (!filenames.includes(df)) {
      console.error(`  Extra on disk: ${s.dir}/${df}`);
      allPassed = false;
    }
  }
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('\nAll 7 sections in doc perfectly match files on disk!');
}
