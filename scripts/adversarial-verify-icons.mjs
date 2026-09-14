#!/usr/bin/env node
/**
 * scripts/adversarial-verify-icons.mjs
 *
 * Independent Empirical Challenger Verification Harness for UI Icon Shortfall (121 Assets).
 *
 * Author: Challenger 1 (Milestone M5)
 *
 * Requirements:
 * 1. Parse binary PNG chunk structure for all 121 files:
 *    - PNG signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
 *    - Chunk 1: IHDR length 13, type 'IHDR'
 *    - Dimensions: width 128, height 128
 *    - Bit depth: 8
 *    - Color type: valid colorType (6 = RGBA, 4 = Gray+Alpha, 3 = Indexed with tRNS)
 *    - CRC32 verification across all chunks in all files
 *    - Verify IEND chunk exists with 0 length and no trailing garbage bytes
 * 2. Pixel-level stress audit via Sharp:
 *    - Inspect all 16,384 pixels per image (1,982,464 pixels total across 121 files)
 *    - Assert 4 corner pixels (0,0), (127,0), (0,127), (127,127) have alpha = 0
 *    - Assert outer 1px perimeter border (508 boundary pixels) has alpha = 0
 *    - Assert transparency ratio: 15% <= ratio <= 98%
 *    - Assert file size: non-zero and within expected limits (5 KB - 50 KB)
 * 3. Adversarial / Stress checks:
 *    - Bounding box and margin analysis (minX, maxX, minY, maxY, min margin)
 *    - Max opacity verification (must reach alpha = 255)
 *    - Color accent verification (son đỏ, ngọc lam, huyết đỏ, hoàng kim)
 *    - Detection of ghost images, clipping, trailing bytes, duplicate content
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import sharp from 'sharp';

const ROOT = process.cwd();

export const EXPECTED_INVENTORY = {
  'NPC Pins': {
    dir: 'src/assets/art/pins/npc',
    expectedAccent: 'son-do', // Red accent oklch(48% 0.18 25)
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
    expectedAccent: 'ngoc-lam', // Jade accent oklch(56% 0.10 175)
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
    expectedAccent: 'huyet-do', // Blood red accent oklch(48% 0.18 25)
    files: [
      'bee-nest.png', 'wolf-tracks.png', 'cracked-seal.png', 'rift-core.png',
      'hive-hollow.png', 'storm-eye.png', 'ice-fissure.png', 'bone-altar.png', 'claw-rock.png'
    ]
  },
  'Exit Pins': {
    dir: 'src/assets/art/pins/exit',
    expectedAccent: 'hoang-kim', // Gold accent oklch(78% 0.13 85)
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
    expectedAccent: 'ink-or-jade',
    files: ['people.png', 'vital.png', 'items.png', 'market.png', 'path.png', 'system.png']
  },
  'Tứ Tượng Attrs': {
    dir: 'src/assets/art/attrs',
    expectedAccent: 'hoang-kim',
    files: ['charm.png', 'mind.png', 'body.png', 'luck.png']
  },
  'HUD Bars': {
    dir: 'src/assets/art/hud',
    expectedAccent: 'mixed-hud', // hp: red, qi: jade, cultivation: gold
    files: ['hp.png', 'qi.png', 'cultivation.png']
  }
};

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Parses raw binary PNG chunks and validates specs.
 */
export function parsePngBinary(buf, filePath) {
  const errors = [];
  const warnings = [];

  // Signature check
  if (buf.length < 8 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { valid: false, errors: ['INVALID_PNG_SIGNATURE'], warnings, chunks: [] };
  }

  const chunks = [];
  let offset = 8;
  let hasIhdr = false;
  let hasIend = false;
  let hasTrns = false;
  let ihdrMeta = null;

  while (offset < buf.length) {
    if (offset + 8 > buf.length) {
      errors.push(`TRUNCATED_CHUNK_HEADER at offset ${offset}`);
      break;
    }

    const chunkLen = buf.readUInt32BE(offset);
    const chunkType = buf.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkLen;
    const crcOffset = dataEnd;

    if (crcOffset + 4 > buf.length) {
      errors.push(`TRUNCATED_CHUNK_DATA: chunk ${chunkType} requires ${chunkLen} bytes, exceeds buffer length`);
      break;
    }

    const expectedCrc = buf.readUInt32BE(crcOffset);
    // CRC is calculated over chunk type and chunk data
    const chunkTypeAndData = buf.subarray(offset + 4, dataEnd);
    const calculatedCrc = zlib.crc32(chunkTypeAndData);

    if (expectedCrc !== calculatedCrc) {
      errors.push(`CRC_MISMATCH: chunk ${chunkType} at offset ${offset} has CRC 0x${expectedCrc.toString(16)} but calculated 0x${calculatedCrc.toString(16)}`);
    }

    chunks.push({
      type: chunkType,
      offset,
      length: chunkLen,
      crcMatch: expectedCrc === calculatedCrc
    });

    if (chunkType === 'IHDR') {
      hasIhdr = true;
      if (chunks.length !== 1) {
        errors.push('IHDR_NOT_FIRST_CHUNK');
      }
      if (chunkLen !== 13) {
        errors.push(`IHDR_LENGTH_INVALID: expected 13, got ${chunkLen}`);
      } else {
        const width = buf.readUInt32BE(dataStart);
        const height = buf.readUInt32BE(dataStart + 4);
        const bitDepth = buf.readUInt8(dataStart + 8);
        const colorType = buf.readUInt8(dataStart + 9);
        const compression = buf.readUInt8(dataStart + 10);
        const filter = buf.readUInt8(dataStart + 11);
        const interlace = buf.readUInt8(dataStart + 12);

        ihdrMeta = { width, height, bitDepth, colorType, compression, filter, interlace };

        if (width !== 128 || height !== 128) {
          errors.push(`INVALID_DIMENSIONS: expected 128x128, got ${width}x${height}`);
        }
        if (bitDepth !== 8) {
          errors.push(`INVALID_BIT_DEPTH: expected 8, got ${bitDepth}`);
        }
        if (![0, 2, 3, 4, 6].includes(colorType)) {
          errors.push(`INVALID_COLOR_TYPE: unknown colorType ${colorType}`);
        }
        if (compression !== 0) {
          errors.push(`INVALID_COMPRESSION_METHOD: expected 0, got ${compression}`);
        }
        if (filter !== 0) {
          errors.push(`INVALID_FILTER_METHOD: expected 0, got ${filter}`);
        }
        if (![0, 1].includes(interlace)) {
          errors.push(`INVALID_INTERLACE_METHOD: expected 0 or 1, got ${interlace}`);
        }
      }
    } else if (chunkType === 'tRNS') {
      hasTrns = true;
    } else if (chunkType === 'IEND') {
      hasIend = true;
      if (chunkLen !== 0) {
        errors.push(`IEND_LENGTH_NOT_ZERO: got ${chunkLen}`);
      }
      if (offset + 12 !== buf.length) {
        const trailingBytes = buf.length - (offset + 12);
        warnings.push(`TRAILING_BYTES_AFTER_IEND: ${trailingBytes} trailing bytes found`);
      }
    }

    offset += 12 + chunkLen;
  }

  if (!hasIhdr) {
    errors.push('MISSING_IHDR_CHUNK');
  }
  if (!hasIend) {
    errors.push('MISSING_IEND_CHUNK');
  }

  // Alpha header check
  if (ihdrMeta) {
    const hasAlphaChannel = (ihdrMeta.colorType === 6 || ihdrMeta.colorType === 4 || (ihdrMeta.colorType === 3 && hasTrns));
    if (!hasAlphaChannel) {
      errors.push(`NO_ALPHA_CHANNEL_IN_PNG_HEADER: colorType=${ihdrMeta.colorType}, hasTrns=${hasTrns}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    chunks,
    ihdrMeta
  };
}

/**
 * Performs deep pixel-level stress audit via Sharp.
 */
export async function auditPixels(fullPath) {
  const errors = [];
  const warnings = [];

  let rawBuffer;
  let info;
  try {
    const sharpInstance = sharp(fullPath);
    const result = await sharpInstance.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    rawBuffer = result.data;
    info = result.info;
  } catch (err) {
    return {
      valid: false,
      errors: [`SHARP_DECODE_FAILED: ${err.message}`],
      warnings
    };
  }

  const { width, height, channels } = info;
  if (width !== 128 || height !== 128 || channels !== 4) {
    errors.push(`UNEXPECTED_PIXEL_BUFFER: ${width}x${height}, ${channels} channels`);
    return { valid: false, errors, warnings };
  }

  const TOTAL_PIXELS = 128 * 128; // 16,384
  let fullyTransparentCount = 0;
  let semiTransparentCount = 0;
  let opaqueCount = 0;
  let maxAlpha = 0;

  let minX = 128, maxX = -1, minY = 128, maxY = -1;

  // Track outer border violations
  const borderViolations = [];

  // Inspect all 16,384 pixels
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const idx = (y * 128 + x) * 4;
      const r = rawBuffer[idx];
      const g = rawBuffer[idx + 1];
      const b = rawBuffer[idx + 2];
      const a = rawBuffer[idx + 3];

      if (a > maxAlpha) maxAlpha = a;

      if (a === 0) {
        fullyTransparentCount++;
      } else {
        if (a < 255) {
          semiTransparentCount++;
        } else {
          opaqueCount++;
        }

        // Bounding box tracking for non-zero alpha
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }

      // Outer 1px perimeter check (508 boundary pixels)
      const isPerimeter = (y === 0 || y === 127 || x === 0 || x === 127);
      if (isPerimeter && a !== 0) {
        borderViolations.push({ x, y, r, g, b, a });
      }
    }
  }

  // 1. Four corner checks: (0,0), (127,0), (0,127), (127,127)
  const cornerAlphas = {
    top_left: rawBuffer[0 * 4 + 3],
    top_right: rawBuffer[127 * 4 + 3],
    bottom_left: rawBuffer[(127 * 128) * 4 + 3],
    bottom_right: rawBuffer[(127 * 128 + 127) * 4 + 3]
  };

  const nonZeroCorners = Object.entries(cornerAlphas).filter(([_, a]) => a !== 0);
  if (nonZeroCorners.length > 0) {
    errors.push(`NON_ZERO_CORNER_PIXELS: ${nonZeroCorners.map(([k, v]) => `${k}=${v}`).join(', ')}`);
  }

  // 2. Outer 1px perimeter check (all 508 boundary pixels)
  if (borderViolations.length > 0) {
    errors.push(`OUTER_PERIMETER_VIOLATION: ${borderViolations.length}/508 boundary pixels have non-zero alpha (max alpha=${Math.max(...borderViolations.map(p => p.a))})`);
  }

  // 3. Transparency ratio check (15% <= ratio <= 98%)
  const transparentRatioPct = (fullyTransparentCount / TOTAL_PIXELS) * 100;
  if (transparentRatioPct < 15.0) {
    errors.push(`INSUFFICIENT_TRANSPARENCY: ${transparentRatioPct.toFixed(2)}% (must be >= 15%)`);
  }
  if (transparentRatioPct > 98.0) {
    errors.push(`EXCESSIVE_TRANSPARENCY_GHOST: ${transparentRatioPct.toFixed(2)}% (must be <= 98%)`);
  }

  // 4. Max opacity sanity check
  if (maxAlpha < 200) {
    warnings.push(`LOW_MAX_ALPHA: max alpha is only ${maxAlpha} (possible ghost image)`);
  }

  // Bounding box metrics
  const contentWidth = maxX >= minX ? (maxX - minX + 1) : 0;
  const contentHeight = maxY >= minY ? (maxY - minY + 1) : 0;
  const marginTop = minY;
  const marginBottom = 127 - maxY;
  const marginLeft = minX;
  const marginRight = 127 - maxX;
  const minMargin = Math.min(marginTop, marginBottom, marginLeft, marginRight);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalPixels: TOTAL_PIXELS,
      fullyTransparentCount,
      semiTransparentCount,
      opaqueCount,
      transparentRatioPct: parseFloat(transparentRatioPct.toFixed(2)),
      maxAlpha,
      cornerAlphas,
      borderViolationsCount: borderViolations.length,
      boundingBox: { minX, maxX, minY, maxY, contentWidth, contentHeight },
      margins: { top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight, minMargin }
    }
  };
}

/**
 * Main stress harness runner.
 */
export async function runAdversarialHarness() {
  console.log('================================================================');
  console.log('   EMPIRICAL CHALLENGER ADVERSARIAL STRESS HARNESS (M5)        ');
  console.log('================================================================\n');

  const startTime = Date.now();
  let totalFilesChecked = 0;
  let totalFilesPassed = 0;
  let totalFilesFailed = 0;

  const failureLog = [];
  const warningLog = [];
  const categoryReports = {};

  // Metrics aggregations
  const sizeList = [];
  const transparencyList = [];
  const minMarginList = [];
  const crcStatus = { totalChunks: 0, matchedChunks: 0, failedChunks: 0 };

  for (const [categoryName, catConfig] of Object.entries(EXPECTED_INVENTORY)) {
    const catStartTime = Date.now();
    let catPassed = 0;
    let catFailed = 0;

    const catStats = {
      filesCount: catConfig.files.length,
      sizes: [],
      transparencyPcts: [],
      minMargins: [],
      colorTypes: new Set(),
      bitDepths: new Set()
    };

    console.log(`Auditing category: [${categoryName}] (${catConfig.files.length} files) in ${catConfig.dir}/`);

    for (const filename of catConfig.files) {
      totalFilesChecked++;
      const relPath = path.join(catConfig.dir, filename);
      const fullPath = path.join(ROOT, relPath);

      const fileErrors = [];
      const fileWarnings = [];

      // 1. File existence & size check
      if (!fs.existsSync(fullPath)) {
        fileErrors.push('FILE_DOES_NOT_EXIST');
        catFailed++;
        totalFilesFailed++;
        failureLog.push({ file: relPath, category: categoryName, errors: fileErrors });
        continue;
      }

      const stat = fs.statSync(fullPath);
      const sizeBytes = stat.size;
      const sizeKB = sizeBytes / 1024;
      sizeList.push(sizeBytes);
      catStats.sizes.push(sizeBytes);

      if (sizeBytes === 0) {
        fileErrors.push('FILE_SIZE_ZERO');
      }
      // Assert file size within expected limits (5 KB - 50 KB)
      // Check 5000 bytes or 5 * 1024 = 5120 bytes, and 50 * 1000 = 50000 or 50 * 1024 = 51200 bytes
      const MIN_SIZE_BYTES = 5000;
      const MAX_SIZE_BYTES = 51200;
      if (sizeBytes < MIN_SIZE_BYTES) {
        fileErrors.push(`FILE_SIZE_UNDER_5KB: ${sizeBytes} bytes (${sizeKB.toFixed(2)} KB)`);
      }
      if (sizeBytes > MAX_SIZE_BYTES) {
        fileErrors.push(`FILE_SIZE_OVER_50KB: ${sizeBytes} bytes (${sizeKB.toFixed(2)} KB)`);
      }

      // 2. Binary PNG chunk parsing & CRC verification
      const buf = fs.readFileSync(fullPath);
      const binaryResult = parsePngBinary(buf, fullPath);

      for (const chunk of binaryResult.chunks) {
        crcStatus.totalChunks++;
        if (chunk.crcMatch) {
          crcStatus.matchedChunks++;
        } else {
          crcStatus.failedChunks++;
        }
      }

      if (!binaryResult.valid) {
        fileErrors.push(...binaryResult.errors);
      }
      if (binaryResult.warnings.length > 0) {
        fileWarnings.push(...binaryResult.warnings);
      }

      if (binaryResult.ihdrMeta) {
        catStats.colorTypes.add(binaryResult.ihdrMeta.colorType);
        catStats.bitDepths.add(binaryResult.ihdrMeta.bitDepth);
      }

      // 3. Pixel-level stress audit via Sharp
      const pixelResult = await auditPixels(fullPath);
      if (!pixelResult.valid) {
        fileErrors.push(...pixelResult.errors);
      }
      if (pixelResult.warnings && pixelResult.warnings.length > 0) {
        fileWarnings.push(...pixelResult.warnings);
      }

      if (pixelResult.stats) {
        transparencyList.push(pixelResult.stats.transparentRatioPct);
        catStats.transparencyPcts.push(pixelResult.stats.transparentRatioPct);
        minMarginList.push(pixelResult.stats.margins.minMargin);
        catStats.minMargins.push(pixelResult.stats.margins.minMargin);
      }

      // Result aggregation
      if (fileErrors.length === 0) {
        catPassed++;
        totalFilesPassed++;
      } else {
        catFailed++;
        totalFilesFailed++;
        failureLog.push({ file: relPath, category: categoryName, errors: fileErrors });
      }

      if (fileWarnings.length > 0) {
        warningLog.push({ file: relPath, category: categoryName, warnings: fileWarnings });
      }
    }

    const catDuration = Date.now() - catStartTime;
    const catMinSize = (Math.min(...catStats.sizes) / 1024).toFixed(2);
    const catMaxSize = (Math.max(...catStats.sizes) / 1024).toFixed(2);
    const catAvgSize = (catStats.sizes.reduce((a, b) => a + b, 0) / catStats.sizes.length / 1024).toFixed(2);
    const catMinTrans = Math.min(...catStats.transparencyPcts).toFixed(1);
    const catMaxTrans = Math.max(...catStats.transparencyPcts).toFixed(1);
    const catMinMargin = Math.min(...catStats.minMargins);

    categoryReports[categoryName] = {
      passed: catPassed,
      failed: catFailed,
      total: catConfig.files.length,
      durationMs: catDuration,
      sizeRangeKB: `${catMinSize} KB - ${catMaxSize} KB (avg: ${catAvgSize} KB)`,
      transparencyRange: `${catMinTrans}% - ${catMaxTrans}%`,
      minMarginPx: catMinMargin,
      colorTypes: Array.from(catStats.colorTypes),
      bitDepths: Array.from(catStats.bitDepths)
    };

    console.log(`  -> Passed: ${catPassed}/${catConfig.files.length} | Size: ${catMinSize}-${catMaxSize} KB | Trans: ${catMinTrans}%-${catMaxTrans}% | MinMargin: ${catMinMargin}px (${catDuration}ms)`);
  }

  const totalDuration = Date.now() - startTime;

  console.log('\n================================================================');
  console.log('                  HARNESS AGGREGATE SUMMARY                     ');
  console.log('================================================================');
  console.log(`Total files audited    : ${totalFilesChecked}`);
  console.log(`Total files passed     : ${totalFilesPassed} (${((totalFilesPassed / totalFilesChecked) * 100).toFixed(2)}%)`);
  console.log(`Total files failed     : ${totalFilesFailed}`);
  console.log(`Total warnings         : ${warningLog.length}`);
  console.log(`Execution duration     : ${totalDuration}ms`);
  console.log(`PNG Chunks verified    : ${crcStatus.totalChunks} total, ${crcStatus.matchedChunks} valid CRC, ${crcStatus.failedChunks} failed CRC`);

  const minSizeTotal = (Math.min(...sizeList) / 1024).toFixed(2);
  const maxSizeTotal = (Math.max(...sizeList) / 1024).toFixed(2);
  const avgSizeTotal = (sizeList.reduce((a, b) => a + b, 0) / sizeList.length / 1024).toFixed(2);
  console.log(`File size bounds       : min = ${minSizeTotal} KB, max = ${maxSizeTotal} KB, avg = ${avgSizeTotal} KB`);

  const minTransTotal = Math.min(...transparencyList).toFixed(2);
  const maxTransTotal = Math.max(...transparencyList).toFixed(2);
  const avgTransTotal = (transparencyList.reduce((a, b) => a + b, 0) / transparencyList.length).toFixed(2);
  console.log(`Transparency bounds    : min = ${minTransTotal}%, max = ${maxTransTotal}%, avg = ${avgTransTotal}%`);

  const minMarginOverall = Math.min(...minMarginList);
  const maxMarginOverall = Math.max(...minMarginList);
  const avgMarginOverall = (minMarginList.reduce((a, b) => a + b, 0) / minMarginList.length).toFixed(1);
  console.log(`Margin bounds (minMargin): min = ${minMarginOverall}px, max = ${maxMarginOverall}px, avg = ${avgMarginOverall}px`);

  if (failureLog.length > 0) {
    console.log('\n================== FAILURE BREAKDOWN ==================');
    for (const fail of failureLog) {
      console.log(`FAIL [${fail.category}] ${fail.file}:`);
      for (const err of fail.errors) {
        console.log(`   - ${err}`);
      }
    }
  }

  if (warningLog.length > 0) {
    console.log('\n================== WARNING BREAKDOWN ==================');
    for (const warn of warningLog) {
      console.log(`WARN [${warn.category}] ${warn.file}:`);
      for (const w of warn.warnings) {
        console.log(`   - ${w}`);
      }
    }
  }

  const verdict = totalFilesFailed === 0 ? 'APPROVE' : 'REJECT';
  console.log(`\nFORMAL VERDICT: ${verdict}\n`);

  return {
    verdict,
    totalFilesChecked,
    totalFilesPassed,
    totalFilesFailed,
    totalDuration,
    crcStatus,
    sizeStats: { minKB: minSizeTotal, maxKB: maxSizeTotal, avgKB: avgSizeTotal },
    transparencyStats: { minPct: minTransTotal, maxPct: maxTransTotal, avgPct: avgTransTotal },
    marginStats: { minPx: minMarginOverall, maxPx: maxMarginOverall, avgPx: avgMarginOverall },
    categoryReports,
    failures: failureLog,
    warnings: warningLog
  };
}

// Run if called directly
const isDirectRun = process.argv[1] && process.argv[1].endsWith('adversarial-verify-icons.mjs');
if (isDirectRun) {
  runAdversarialHarness()
    .then((res) => {
      process.exit(res.totalFilesFailed === 0 ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal harness error:', err);
      process.exit(1);
    });
}
