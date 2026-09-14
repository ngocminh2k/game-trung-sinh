import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dirs = [
  'src/assets/art/tabs',
  'src/assets/art/attrs',
  'src/assets/art/hud',
  'src/assets/art/pins/danger',
  'src/assets/art/pins/exit',
  'src/assets/art/pins/event',
  'src/assets/art/pins/npc'
];

let minSize = Infinity, maxSize = 0;
let minOpaque = Infinity, maxOpaque = 0;
let minW = Infinity, maxW = 0;
let minH = Infinity, maxH = 0;
const stats = [];

for (const d of dirs) {
  const files = fs.readdirSync(d).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const p = path.join(d, f);
    const buf = fs.readFileSync(p);
    const size = buf.length;
    if (size < minSize) minSize = size;
    if (size > maxSize) maxSize = size;

    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let opaqueCount = 0;
    let minX = 128, maxX = 0, minY = 128, maxY = 0;

    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const idx = (y * 128 + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 0) {
          opaqueCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const w = maxX >= minX ? maxX - minX + 1 : 0;
    const h = maxY >= minY ? maxY - minY + 1 : 0;
    if (opaqueCount < minOpaque) minOpaque = opaqueCount;
    if (opaqueCount > maxOpaque) maxOpaque = opaqueCount;
    if (w < minW) minW = w;
    if (w > maxW) maxW = w;
    if (h < minH) minH = h;
    if (h > maxH) maxH = h;

    stats.push({ file: `${d}/${f}`, size, opaqueCount, bbox: `${w}x${h}`, bounds: `[${minX},${minY}]-[${maxX},${maxY}]` });
  }
}

console.log(`Audited ${stats.length} files:`);
console.log(`File sizes: min = ${minSize} bytes, max = ${maxSize} bytes`);
console.log(`Opaque pixel count: min = ${minOpaque} (${(minOpaque/16384*100).toFixed(1)}%), max = ${maxOpaque} (${(maxOpaque/16384*100).toFixed(1)}%)`);
console.log(`Bounding boxes: width [${minW}..${maxW}], height [${minH}..${maxH}]`);

// Check if any bounding box touches the outer edge (margin integrity)
const touchingEdge = stats.filter(s => {
  const parts = s.bounds.match(/\[(\d+),(\d+)\]-\[(\d+),(\d+)\]/);
  const minX = parseInt(parts[1]), minY = parseInt(parts[2]), maxX = parseInt(parts[3]), maxY = parseInt(parts[4]);
  return minX === 0 || minY === 0 || maxX === 127 || maxY === 127;
});
console.log(`Files touching 0 or 127 boundary: ${touchingEdge.length}`);

// Sample 5 icons from different categories
console.log('\nSample statistics:');
for (const i of [0, 10, 30, 70, 110]) {
  console.log(JSON.stringify(stats[i]));
}
