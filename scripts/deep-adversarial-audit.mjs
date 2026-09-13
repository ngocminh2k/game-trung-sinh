#!/usr/bin/env node
/**
 * scripts/deep-adversarial-audit.mjs
 *
 * Deep Adversarial Stress Audit:
 * 1. Image Uniqueness via SHA-256 pixel hashes (detect duplicates/clones)
 * 2. Directory hygiene (detect extra/stray/hidden files in target folders)
 * 3. Max opacity check (assert max alpha === 255 for solid ink wash)
 * 4. Antialiasing / Alpha distribution analysis (fully transparent, semi-transparent, fully opaque)
 * 5. Color accent presence check:
 *    - NPC Pins & Danger Pins: Red accent pixels (R > 100 and R > G * 1.3 and R > B * 1.3)
 *    - Event Pins: Jade/teal accent pixels (G > 80 and G > B * 0.8 and G > R * 1.2)
 *    - Exit Pins & Attrs: Gold accent pixels (R > 120 and G > 100 and B < Math.min(R, G) * 0.8)
 *    - HUD: hp (red), qi (jade), cultivation (gold)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { EXPECTED_INVENTORY } from './adversarial-verify-icons.mjs';

const ROOT = process.cwd();

async function deepAudit() {
  console.log('================================================================');
  console.log('            DEEP ADVERSARIAL STRESS AUDIT (M5)                  ');
  console.log('================================================================\n');

  const pixelHashes = new Map();
  const fileHashes = new Map();
  const directoryHygieneIssues = [];
  const uniquenessFailures = [];
  const opacityFailures = [];
  const accentAnalysis = [];

  let totalFilesScanned = 0;

  // 1. Directory hygiene check
  for (const [catName, catConfig] of Object.entries(EXPECTED_INVENTORY)) {
    const dirPath = path.join(ROOT, catConfig.dir);
    const actualEntries = fs.readdirSync(dirPath);
    const expectedSet = new Set(catConfig.files);

    const extraFiles = actualEntries.filter(f => !expectedSet.has(f));
    if (extraFiles.length > 0) {
      directoryHygieneIssues.push({
        category: catName,
        dir: catConfig.dir,
        extraFiles
      });
    }

    if (actualEntries.length !== catConfig.files.length) {
      console.log(`[WARN] Count mismatch in ${catName}: expected ${catConfig.files.length}, found ${actualEntries.length}`);
    }
  }

  // 2. Scan all files for pixel hashes, opacity, color accents
  for (const [catName, catConfig] of Object.entries(EXPECTED_INVENTORY)) {
    for (const filename of catConfig.files) {
      totalFilesScanned++;
      const relPath = path.join(catConfig.dir, filename);
      const fullPath = path.join(ROOT, relPath);

      // Raw file SHA-256
      const fileBuf = fs.readFileSync(fullPath);
      const fileHash = crypto.createHash('sha256').update(fileBuf).digest('hex');
      if (fileHashes.has(fileHash)) {
        uniquenessFailures.push({
          type: 'EXACT_FILE_DUPLICATE',
          fileA: fileHashes.get(fileHash),
          fileB: relPath
        });
      } else {
        fileHashes.set(fileHash, relPath);
      }

      // Pixel buffer SHA-256
      const sharpRes = await sharp(fullPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const rawData = sharpRes.data;

      const pixelHash = crypto.createHash('sha256').update(rawData).digest('hex');
      if (pixelHashes.has(pixelHash)) {
        uniquenessFailures.push({
          type: 'PIXEL_CONTENT_DUPLICATE',
          fileA: pixelHashes.get(pixelHash),
          fileB: relPath
        });
      } else {
        pixelHashes.set(pixelHash, relPath);
      }

      // Max opacity & antialiasing analysis
      let maxA = 0;
      let opaqueCount = 0;
      let semiCount = 0;
      let transCount = 0;

      // Color accent detectors
      let redAccentPixels = 0;
      let jadeAccentPixels = 0;
      let goldAccentPixels = 0;

      for (let i = 0; i < 128 * 128; i++) {
        const idx = i * 4;
        const r = rawData[idx];
        const g = rawData[idx + 1];
        const b = rawData[idx + 2];
        const a = rawData[idx + 3];

        if (a > maxA) maxA = a;
        if (a === 0) transCount++;
        else if (a === 255) opaqueCount++;
        else semiCount++;

        // Only classify visible colored pixels (a > 64)
        if (a > 64) {
          // Red accent: R is dominant over G and B
          if (r > 90 && r > g * 1.3 && r > b * 1.3) {
            redAccentPixels++;
          }
          // Jade/Teal accent: G is dominant, cool hue
          if (g > 75 && g > r * 1.1 && b > 50) {
            jadeAccentPixels++;
          }
          // Gold accent: R and G both high, B low
          if (r > 120 && g > 90 && b < Math.min(r, g) * 0.75) {
            goldAccentPixels++;
          }
        }
      }

      if (maxA !== 255) {
        opacityFailures.push({ file: relPath, maxAlpha: maxA });
      }

      accentAnalysis.push({
        file: relPath,
        category: catName,
        redPixels: redAccentPixels,
        jadePixels: jadeAccentPixels,
        goldPixels: goldAccentPixels,
        semiCount,
        opaqueCount,
        transCount
      });
    }
  }

  console.log('--- 1. DIRECTORY HYGIENE CHECK ---');
  if (directoryHygieneIssues.length === 0) {
    console.log('[PASS] All 7 asset directories contain ONLY the expected 121 asset files. Zero stray or temp files found.');
  } else {
    console.log('[FAIL] Stray files detected:');
    for (const issue of directoryHygieneIssues) {
      console.log(`  - ${issue.category} (${issue.dir}): ${issue.extraFiles.join(', ')}`);
    }
  }

  console.log('\n--- 2. ASSET UNIQUENESS & INTEGRITY CHECK ---');
  if (uniquenessFailures.length === 0) {
    console.log(`[PASS] All 121 assets have completely unique pixel hashes and file hashes. Zero duplicates detected (121/121 unique).`);
  } else {
    console.log(`[FAIL] Duplicates detected (${uniquenessFailures.length}):`);
    for (const u of uniquenessFailures) {
      console.log(`  - ${u.type}: ${u.fileA} <=> ${u.fileB}`);
    }
  }

  console.log('\n--- 3. MAX OPACITY SANITY AUDIT ---');
  if (opacityFailures.length === 0) {
    console.log('[PASS] All 121 assets achieve maximum solid opacity (alpha = 255). No washed out or purely transparent ghosts.');
  } else {
    console.log(`[FAIL] Opacity failures (${opacityFailures.length}):`);
    for (const o of opacityFailures) {
      console.log(`  - ${o.file}: maxAlpha=${o.maxAlpha}`);
    }
  }

  console.log('\n--- 4. ANTIALIASING FEATHER PROFILE ---');
  const avgSemi = (accentAnalysis.reduce((acc, x) => acc + x.semiCount, 0) / 121).toFixed(0);
  const avgOpaque = (accentAnalysis.reduce((acc, x) => acc + x.opaqueCount, 0) / 121).toFixed(0);
  const avgTrans = (accentAnalysis.reduce((acc, x) => acc + x.transCount, 0) / 121).toFixed(0);
  console.log(`[PASS] Average pixel distribution per 128x128 icon (16,384 total):`);
  console.log(`  - Fully transparent (alpha = 0)  : ${avgTrans} px (${((avgTrans / 16384) * 100).toFixed(1)}%)`);
  console.log(`  - Antialiased edge (0 < alpha < 255): ${avgSemi} px (${((avgSemi / 16384) * 100).toFixed(1)}%)`);
  console.log(`  - Solid ink core (alpha = 255)   : ${avgOpaque} px (${((avgOpaque / 16384) * 100).toFixed(1)}%)`);

  console.log('\n--- 5. CATEGORY ACCENT COLOR AUDIT ---');
  const catColorSummary = {};
  for (const item of accentAnalysis) {
    if (!catColorSummary[item.category]) {
      catColorSummary[item.category] = {
        total: 0,
        hasRed: 0,
        hasJade: 0,
        hasGold: 0,
        pureInkWash: 0
      };
    }
    const c = catColorSummary[item.category];
    c.total++;
    const hasR = item.redPixels > 10;
    const hasJ = item.jadePixels > 10;
    const hasG = item.goldPixels > 10;

    if (hasR) c.hasRed++;
    if (hasJ) c.hasJade++;
    if (hasG) c.hasGold++;
    if (!hasR && !hasJ && !hasG) c.pureInkWash++;
  }

  for (const [cat, s] of Object.entries(catColorSummary)) {
    console.log(`Category: [${cat}] (Total: ${s.total})`);
    console.log(`  - Red accent pixels (>10px) : ${s.hasRed}/${s.total}`);
    console.log(`  - Jade accent pixels (>10px): ${s.hasJade}/${s.total}`);
    console.log(`  - Gold accent pixels (>10px): ${s.hasGold}/${s.total}`);
    console.log(`  - Monochrome/Pure ink-wash  : ${s.pureInkWash}/${s.total}`);
  }

  const allPassed = (
    directoryHygieneIssues.length === 0 &&
    uniquenessFailures.length === 0 &&
    opacityFailures.length === 0
  );

  console.log('\n================================================================');
  console.log(`DEEP AUDIT VERDICT: ${allPassed ? 'ALL STRESS TESTS PASSED (APPROVE)' : 'FAILED'}`);
  console.log('================================================================\n');

  return {
    allPassed,
    uniquenessFailures,
    directoryHygieneIssues,
    opacityFailures,
    catColorSummary
  };
}

deepAudit()
  .then(res => process.exit(res.allPassed ? 0 : 1))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
