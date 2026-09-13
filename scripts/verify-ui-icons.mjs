#!/usr/bin/env node
/**
 * scripts/verify-ui-icons.mjs
 *
 * Automated Quality Gate for UI Icon Shortfall (121 Assets).
 *
 * Implements dual-layer verification:
 * - Tier 1: Binary PNG chunk inspection (Signature, IHDR 128x128, colorType 6/4 or palette with tRNS).
 * - Tier 2: Sharp raw pixel validation (4 corners alpha=0, transparency ratio 15%-98%, outer border margin check).
 *
 * Exit code:
 * - 0: All 121 icons pass verification.
 * - 1: Any icon is missing, invalid dimension, non-transparent, or violates specifications.
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();

export const ICON_CATEGORIES = {
  'NPC Pins': {
    dir: 'src/assets/art/pins/npc',
    files: [
      'elder-meihua.png', 'storyteller-ngo.png', 'merchant-bao.png', 'hermit-coc.png',
      'rival-khoa.png', 'master-vo.png', 'lost-soul-ha.png', 'innkeeper-hanh.png',
      'alchemist-sam.png', 'hunter-son.png', 'guard-truong.png', 'kid-xiaobao.png',
      'farmer-tu.png', 'fortune-lien.png', 'cook-phung.png', 'smith-duc.png',
      'scholar-minh.png', 'pedlar-quyen.png', 'tea-ma.png', 'tailor-yen.png',
      'senior-lan.png', 'keeper-anh.png', 'monk-thien.png', 'herbalist-dan.png',
      'gatherer-hue.png', 'ox-cart-hien.png', 'woodcutter-bong.png', 'exile-ba.png',
      'exorcist-diem.png', 'crane-spirit.png', 'herbalist-lan.png', 'swordsman-diep.png',
      'monk-nhu.png', 'broker-tieu.png', 'fisher-yen.png', 'relic-hunter-bach.png',
      'beast-tamer-le.png', 'pavilion-disciple-anh.png', 'wandering-blade-phong.png',
      'rogue-cultivator-nhat.png', 'gardener-thin.png', 'auctioneer-hoan.png',
      'banker-tin.png', 'gardener-vien.png', 'beekeeper-oanh.png', 'archivist-thu.png',
      'judge-quang.png', 'tamer-hac.png', 'beast-singer-my.png', 'ash-priest-cuu.png',
      'name-collector-tra.png', 'ice-hermit-bang.png', 'snow-guard-han.png',
      'caravan-duong.png', 'dune-guide-sa.png', 'lake-keeper-trang.png',
      'ferryman-cau.png', 'dice-master-luc.png', 'map-seller-man.png', 'ward-carver-khue.png'
    ]
  },
  'Event Pins': {
    dir: 'src/assets/art/pins/event',
    files: [
      'bamboo-rampart.png', 'old-house.png', 'village-well.png', 'fortune-wheel.png',
      'tea-house.png', 'arena.png', 'treasure-pavilion.png', 'meditation-wall.png',
      'herb-terrace.png', 'fog-crossroads.png', 'cloud-nest.png', 'wind-bell.png',
      'nameless-stele.png', 'wind-cliff.png', 'herb-garden.png', 'dry-oasis.png',
      'ice-mirror.png', 'auction-stall.png', 'caravan-teahouse.png', 'moon-water.png',
      'lotus-pond.png', 'broken-stele.png', 'cloud-library.png'
    ]
  },
  'Danger Pins': {
    dir: 'src/assets/art/pins/danger',
    files: [
      'bee-nest.png', 'wolf-tracks.png', 'cracked-seal.png', 'rift-core.png',
      'hive-hollow.png', 'storm-eye.png', 'ice-fissure.png', 'bone-altar.png', 'claw-rock.png'
    ]
  },
  'Exit Pins': {
    dir: 'src/assets/art/pins/exit',
    files: [
      'village.png', 'market.png', 'sect.png', 'herb-field.png',
      'misty-forest.png', 'sealed-cave.png', 'cursed-rift.png', 'cloud-peak.png',
      'thousand-herbs-valley.png', 'blackwind-dunes.png', 'frozen-peak.png',
      'wandering-market.png', 'moon-lake.png', 'bone-ash-ruins.png',
      'spirit-beast-ridge.png', 'azure-pavilion.png'
    ]
  },
  'LeftRail Tabs': {
    dir: 'src/assets/art/tabs',
    files: ['people.png', 'vital.png', 'items.png', 'market.png', 'path.png', 'system.png']
  },
  'Tứ Tượng Attrs': {
    dir: 'src/assets/art/attrs',
    files: ['charm.png', 'mind.png', 'body.png', 'luck.png']
  },
  'HUD Bars': {
    dir: 'src/assets/art/hud',
    files: ['hp.png', 'qi.png', 'cultivation.png']
  }
};

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Validates a single icon against Tier 1 and Tier 2 quality standards.
 *
 * @param {string} relPath - Relative path to the image from project root.
 * @returns {Promise<{ ok: boolean, error?: string, transparentPct?: string, dimensions?: string, sizeBytes?: number }>}
 */
export async function verifyFile(relPath) {
  const fullPath = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);

  if (!fs.existsSync(fullPath)) {
    return { ok: false, error: 'FILE_NOT_FOUND' };
  }

  const stat = fs.statSync(fullPath);
  if (stat.size === 0) {
    return { ok: false, error: 'FILE_IS_EMPTY (0 bytes)' };
  }

  // ----------------------------------------------------
  // Tier 1: Binary PNG Chunk Validation
  // ----------------------------------------------------
  const buf = fs.readFileSync(fullPath);
  if (buf.length < 33 || !buf.subarray(0, 8).equals(PNG_SIG)) {
    return { ok: false, error: 'INVALID_PNG_SIGNATURE' };
  }

  const ihdrType = buf.toString('ascii', 12, 16);
  if (ihdrType !== 'IHDR') {
    return { ok: false, error: 'MISSING_IHDR_CHUNK' };
  }

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf.readUInt8(25);

  if (width !== 128 || height !== 128) {
    return { ok: false, error: `DIMENSIONS_NOT_128: found ${width}x${height}` };
  }

  // Scan chunk tRNS if indexed palette (colorType 3)
  let hasTrns = false;
  let offset = 8;
  while (offset < buf.length - 12) {
    const chunkLen = buf.readUInt32BE(offset);
    const cType = buf.toString('ascii', offset + 4, offset + 8);
    if (cType === 'tRNS') {
      hasTrns = true;
      break;
    }
    offset += 12 + chunkLen;
  }

  const hasAlphaHeader = (colorType === 6 || colorType === 4 || (colorType === 3 && hasTrns));
  if (!hasAlphaHeader) {
    return { ok: false, error: `NO_ALPHA_CHANNEL: colorType ${colorType} without transparency chunk` };
  }

  // ----------------------------------------------------
  // Tier 2: Sharp Raw Pixel Audit
  // ----------------------------------------------------
  let data;
  try {
    const rawRes = await sharp(fullPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    data = rawRes.data;
  } catch (decodeErr) {
    return { ok: false, error: `PIXEL_DECODE_FAILED: ${decodeErr.message}` };
  }

  let transparentCount = 0;
  for (let i = 0; i < 128 * 128; i++) {
    if (data[i * 4 + 3] === 0) {
      transparentCount++;
    }
  }

  const pct = (transparentCount / (128 * 128)) * 100;
  if (transparentCount === 0) {
    return { ok: false, error: 'SOLID_BACKGROUND: 0 transparent pixels found' };
  }
  if (pct < 15) {
    return { ok: false, error: `INSUFFICIENT_TRANSPARENCY: only ${pct.toFixed(1)}% transparent (min 15% required)` };
  }
  if (pct > 98) {
    return { ok: false, error: `IMAGE_EMPTY_OR_GHOST: ${pct.toFixed(1)}% transparent (max 98% allowed)` };
  }

  // 4 corners alpha check: (0,0), (127,0), (0,127), (127,127)
  const corners = [
    data[3],                         // (0,0)
    data[127 * 4 + 3],               // (127,0)
    data[(127 * 128) * 4 + 3],       // (0,127)
    data[(127 * 128 + 127) * 4 + 3]  // (127,127)
  ];
  if (corners.some(a => a !== 0)) {
    return { ok: false, error: `CORNERS_NOT_TRANSPARENT: corner alphas=[${corners.join(',')}]` };
  }

  // Perimeter margin check (outermost 1px boundary should be transparent)
  let borderViolated = false;
  for (let x = 0; x < 128; x++) {
    // Top row (y=0) and Bottom row (y=127)
    if (data[x * 4 + 3] !== 0 || data[((127 * 128) + x) * 4 + 3] !== 0) {
      borderViolated = true;
      break;
    }
  }
  if (!borderViolated) {
    for (let y = 0; y < 128; y++) {
      // Left col (x=0) and Right col (x=127)
      if (data[(y * 128) * 4 + 3] !== 0 || data[(y * 128 + 127) * 4 + 3] !== 0) {
        borderViolated = true;
        break;
      }
    }
  }
  if (borderViolated) {
    return { ok: false, error: 'MARGIN_VIOLATION: non-transparent pixel on border edge (subject touches canvas boundary)' };
  }

  // ----------------------------------------------------
  // Tier 3: Adversarial Quality Gate (Remediation Hardening)
  // ----------------------------------------------------

  // 1. Fake Checkerboard Grid Detection
  // Detects alternating grey square blocks (R≈G≈B≈180-220 with saturation <= 8 and alpha > 30)
  // Fake checkerboards from stock/Photoshop mockups have hundreds to thousands of grey grid pixels
  let checkerboardPixels = 0;
  let alternatingPatternCount = 0;
  for (let y = 8; y < 120; y += 4) {
    for (let x = 8; x < 120; x += 4) {
      const idx = (y * 128 + x) * 4;
      const a = data[idx + 3];
      if (a > 30) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const minC = Math.min(r, g, b);
        const maxC = Math.max(r, g, b);
        // Neutral grey check
        if (minC >= 180 && maxC <= 220 && (maxC - minC) <= 8) {
          if (x < 24 || x > 103 || y < 24 || y > 103) {
            checkerboardPixels++;
            // Check for 8px or 16px checkerboard alternation with transparent pixels
            if (x + 8 < 128 && data[(y * 128 + (x + 8)) * 4 + 3] === 0) alternatingPatternCount++;
            if (y + 8 < 128 && data[((y + 8) * 128 + x) * 4 + 3] === 0) alternatingPatternCount++;
          }
        }
      }
    }
  }

  // Reject if heavy grey margin grid (>= 200 pixels) or alternating grid blocks detected
  if (checkerboardPixels >= 200 || alternatingPatternCount >= 30) {
    return {
      ok: false,
      error: `FAKE_CHECKERBOARD_DETECTED: found ${checkerboardPixels} grey grid pixels with ${alternatingPatternCount} checkerboard transitions in margin`
    };
  }

  // 2. Inner Corner Regions Audit (Detects unremoved 104x104 paper background rectangles)
  // The 4 inner corners outside the subject: (16,16), (111,16), (16,111), (111,111)
  const cornerSamplePoints = [
    { name: 'Top-Left', x: 16, y: 16 },
    { name: 'Top-Right', x: 111, y: 16 },
    { name: 'Bottom-Left', x: 16, y: 111 },
    { name: 'Bottom-Right', x: 111, y: 111 }
  ];

  let opaqueCornerPaperCount = 0;
  let totalCornerPaperAlpha = 0;
  const cornerDetails = [];

  for (const pt of cornerSamplePoints) {
    const idx = (pt.y * 128 + pt.x) * 4;
    const alpha = data[idx + 3];
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const isPaperColor = Math.min(r, g, b) > 130;
    if (alpha > 25 && isPaperColor) {
      opaqueCornerPaperCount++;
      totalCornerPaperAlpha += alpha;
    }
    cornerDetails.push(`${pt.name}(${pt.x},${pt.y}) alpha=${alpha}${alpha > 25 && isPaperColor ? ' [PAPER]' : ''}`);
  }

  // Check average corner paper alpha outside subject (must be <= 10)
  const avgCornerPaperAlpha = totalCornerPaperAlpha / 4;

  // Check 7x7 inner corner blocks to detect solid paper swatch corners
  let tlBlockPaper = 0, trBlockPaper = 0, blBlockPaper = 0, brBlockPaper = 0;
  for (let dy = 0; dy <= 6; dy++) {
    for (let dx = 0; dx <= 6; dx++) {
      const idxTL = ((14 + dy) * 128 + (14 + dx)) * 4;
      const idxTR = ((14 + dy) * 128 + (107 + dx)) * 4;
      const idxBL = ((107 + dy) * 128 + (14 + dx)) * 4;
      const idxBR = ((107 + dy) * 128 + (107 + dx)) * 4;
      // Paper background has alpha > 25 and high brightness (minVal > 140)
      if (data[idxTL + 3] > 25 && Math.min(data[idxTL], data[idxTL+1], data[idxTL+2]) > 140) tlBlockPaper++;
      if (data[idxTR + 3] > 25 && Math.min(data[idxTR], data[idxTR+1], data[idxTR+2]) > 140) trBlockPaper++;
      if (data[idxBL + 3] > 25 && Math.min(data[idxBL], data[idxBL+1], data[idxBL+2]) > 140) blBlockPaper++;
      if (data[idxBR + 3] > 25 && Math.min(data[idxBR], data[idxBR+1], data[idxBR+2]) > 140) brBlockPaper++;
    }
  }

  if (opaqueCornerPaperCount >= 2 || avgCornerPaperAlpha > 10 || tlBlockPaper > 20 || trBlockPaper > 20 || blBlockPaper > 20 || brBlockPaper > 20) {
    return {
      ok: false,
      error: `OPAQUE_PAPER_BACKGROUND: unremoved background rectangle detected (avgPaperAlpha=${avgCornerPaperAlpha.toFixed(1)}, ${cornerDetails.join(', ')})`
    };
  }

  return {
    ok: true,
    transparentPct: `${pct.toFixed(1)}%`,
    dimensions: `${width}x${height}`,
    sizeBytes: stat.size
  };
}

/**
 * Runs full audit across all 121 icons.
 *
 * @returns {Promise<{ totalExpected: number, totalPassed: number, totalFailed: number, failures: Array }>}
 */
export async function verifyAllIcons() {
  console.log('====================================================');
  console.log('  UI ICON SHORTFALL AUDIT (121 ASSETS VERIFICATION)  ');
  console.log('====================================================\n');

  let totalExpected = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const failures = [];

  for (const [category, { dir, files }] of Object.entries(ICON_CATEGORIES)) {
    let catPassed = 0;
    let catFailed = 0;

    for (const file of files) {
      totalExpected++;
      const relPath = path.join(dir, file);
      const res = await verifyFile(relPath);

      if (res.ok) {
        catPassed++;
        totalPassed++;
      } else {
        catFailed++;
        totalFailed++;
        failures.push({ file: relPath, category, error: res.error });
      }
    }

    const status = catFailed === 0 ? '[PASS]' : '[FAIL]';
    console.log(`${status} ${category.padEnd(16)}: ${catPassed}/${files.length} valid`);
  }

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL: ${totalPassed}/${totalExpected} icons passed (${((totalPassed / totalExpected) * 100).toFixed(1)}%)`);

  if (failures.length > 0) {
    console.log(`\nFAILURES DETECTED (${failures.length}):`);
    for (const f of failures) {
      console.log(`  - [${f.category}] ${f.file}: ${f.error}`);
    }
    console.log('\nVerification FAILED. Please review and regenerate/post-process failing icons.');
  } else {
    console.log('\nALL 121 UI ICONS SUCCESSFULLY VERIFIED! Specification 100% met.');
  }

  return {
    totalExpected,
    totalPassed,
    totalFailed,
    failures
  };
}

// Direct execution
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('verify-ui-icons.mjs')
);

if (isDirectRun) {
  verifyAllIcons()
    .then((result) => {
      process.exit(result.totalFailed === 0 ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal verification error:', err);
      process.exit(1);
    });
}
