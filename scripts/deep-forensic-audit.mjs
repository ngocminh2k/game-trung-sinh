import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { ICON_CATEGORIES } from './verify-ui-icons.mjs';

async function forensicAudit() {
  const hashes = new Map();
  const duplicates = [];
  const results = [];
  let totalFiles = 0;

  for (const [cat, { dir, files }] of Object.entries(ICON_CATEGORIES)) {
    for (const f of files) {
      totalFiles++;
      const fullPath = path.join(dir, f);
      const buf = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      
      if (hashes.has(hash)) {
        duplicates.push({ file1: hashes.get(hash), file2: fullPath, hash });
      } else {
        hashes.set(hash, fullPath);
      }

      // Raw pixels
      const { data, info } = await sharp(fullPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

      // Calculate Shannon entropy on raw bytes
      const freq = new Array(256).fill(0);
      for (let i = 0; i < buf.length; i++) freq[buf[i]]++;
      let entropy = 0;
      for (let c of freq) {
        if (c > 0) {
          const p = c / buf.length;
          entropy -= p * Math.log2(p);
        }
      }

      // Check transparency stats
      let transparentPixels = 0;
      let opaquePixels = 0;
      let semiPixels = 0;
      let greyCheckerboardPixels = 0;

      // Unique color count
      const colors = new Set();

      for (let i = 0; i < 128 * 128; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        const a = data[i * 4 + 3];

        if (a === 0) {
          transparentPixels++;
        } else if (a === 255) {
          opaquePixels++;
        } else {
          semiPixels++;
        }

        if (a > 0) {
          colors.add((r << 24) | (g << 16) | (b << 8) | a);
        }

        // Checkerboard grey detection in margins
        const x = i % 128;
        const y = Math.floor(i / 128);
        if (x < 24 || x > 103 || y < 24 || y > 103) {
          if (a > 30 && r >= 180 && r <= 220 && Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8) {
            greyCheckerboardPixels++;
          }
        }
      }

      // Corner alphas
      const cTL = data[(16 * 128 + 16) * 4 + 3];
      const cTR = data[(16 * 128 + 111) * 4 + 3];
      const cBL = data[(111 * 128 + 16) * 4 + 3];
      const cBR = data[(111 * 128 + 111) * 4 + 3];

      results.push({
        file: fullPath,
        category: cat,
        size: buf.length,
        hash,
        entropy: entropy.toFixed(3),
        uniqueColors: colors.size,
        transparentPct: ((transparentPixels / (128 * 128)) * 100).toFixed(1),
        corners: [cTL, cTR, cBL, cBR],
        greyCheckerboardPixels
      });
    }
  }

  console.log('TOTAL FILES AUDITED:', totalFiles);
  console.log('UNIQUE HASHES:', hashes.size);
  console.log('DUPLICATES:', duplicates.length);
  if (duplicates.length > 0) {
    console.log('DUPLICATE DETAILS:', JSON.stringify(duplicates, null, 2));
  }

  // Summary statistics
  const entropies = results.map(r => parseFloat(r.entropy));
  const minEntropy = Math.min(...entropies);
  const maxEntropy = Math.max(...entropies);
  const avgEntropy = (entropies.reduce((a, b) => a + b, 0) / entropies.length).toFixed(3);
  console.log(`ENTROPY: min=${minEntropy}, max=${maxEntropy}, avg=${avgEntropy}`);

  const uniqueColorCounts = results.map(r => r.uniqueColors);
  const minColors = Math.min(...uniqueColorCounts);
  const maxColors = Math.max(...uniqueColorCounts);
  console.log(`UNIQUE COLORS: min=${minColors}, max=${maxColors}`);

  const highCheckerboard = results.filter(r => r.greyCheckerboardPixels > 0);
  console.log('FILES WITH GREY CHECKERBOARD MARGIN PIXELS:', highCheckerboard.length);
  if (highCheckerboard.length > 0) {
    console.log(highCheckerboard.map(r => `${r.file}: ${r.greyCheckerboardPixels}px`));
  }

  const highCornerAlpha = results.filter(r => r.corners.some(c => c > 25));
  console.log('FILES WITH CORNER ALPHA > 25 (at (16,16), (111,16), etc.):', highCornerAlpha.length);
  if (highCornerAlpha.length > 0) {
    console.log(highCornerAlpha.map(r => `${r.file}: [${r.corners.join(',')}]`));
  }

  // Let's print out the previously problematic files
  const watchList = [
    'src/assets/art/pins/exit/azure-pavilion.png',
    'src/assets/art/pins/exit/spirit-beast-ridge.png',
    'src/assets/art/pins/exit/moon-lake.png',
    'src/assets/art/pins/exit/bone-ash-ruins.png',
    'src/assets/art/tabs/market.png',
    'src/assets/art/tabs/items.png',
    'src/assets/art/attrs/mind.png',
    'src/assets/art/pins/danger/bee-nest.png',
    'src/assets/art/pins/danger/claw-rock.png',
    'src/assets/art/pins/exit/herb-field.png',
    'src/assets/art/pins/exit/cloud-peak.png',
    'src/assets/art/pins/exit/sealed-cave.png',
    'src/assets/art/pins/npc/senior-lan.png',
    'src/assets/art/pins/event/dry-oasis.png',
    'src/assets/art/pins/npc/banker-tin.png',
    'src/assets/art/pins/npc/storyteller-ngo.png',
    'src/assets/art/pins/npc/dune-guide-sa.png',
    'src/assets/art/pins/npc/caravan-duong.png',
    'src/assets/art/pins/npc/ice-hermit-bang.png',
    'src/assets/art/pins/npc/name-collector-tra.png'
  ];

  console.log('\nWATCHLIST DETAILED AUDIT:');
  for (const item of results) {
    const normPath = item.file.replace(/\\/g, '/');
    if (watchList.includes(normPath)) {
      console.log(`- ${normPath}: size=${item.size}B, entropy=${item.entropy}, colors=${item.uniqueColors}, trans=${item.transparentPct}%, corners=[${item.corners.join(',')}], greyMargin=${item.greyCheckerboardPixels}`);
    }
  }
}

forensicAudit().catch(console.error);
