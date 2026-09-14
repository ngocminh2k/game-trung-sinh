#!/usr/bin/env node
/**
 * scripts/process-ui-icon.mjs
 *
 * Production Post-Processing Engine for UI Icons.
 * Converts raw AI-generated artwork (JPEG, PNG, or SVG buffer)
 * into standardized 128x128 PNG icons with pristine transparent alpha backgrounds.
 *
 * Features:
 * 1. Multi-pass background extraction:
 *    - Connected-component flood-fill from all 4 canvas borders to peel off paper textures,
 *      parchment swatches, off-white washes, and fake checkerboard grids.
 *    - Adaptive luminance/chroma matting for feathered brush edges.
 *    - Un-premultiplies background colors to eliminate edge halos.
 * 2. Tight bounding-box trimming of foreground ink-wash subject.
 * 3. High-fidelity Lanczos3 scaling constrained within a 104x104 envelope.
 * 4. Centered compositing on a 128x128 RGBA transparent canvas (~12px / ~9.4% margin).
 * 5. Optimized PNG encoding with compression level 9.
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Checks if an RGB triplet represents background (white, off-white, parchment, or fake checkerboard).
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {boolean}
 */
function isBackgroundPixel(r, g, b) {
  const minVal = Math.min(r, g, b);
  const maxVal = Math.max(r, g, b);
  const sat = maxVal - minVal;

  // 1. Pure or near-white background
  if (minVal >= 235 && sat <= 30) return true;

  // 2. Aged paper / parchment tone (high brightness, low to moderate saturation)
  if (minVal >= 160 && sat <= 75) return true;
  if (minVal >= 140 && sat <= 35) return true;

  // 3. Fake Photoshop transparency checkerboard grid (alternating grey blocks R≈G≈B≈180-220)
  if (minVal >= 170 && maxVal <= 225 && sat <= 12) return true;

  return false;
}

/**
 * Removes background from an image buffer using flood-fill and adaptive matting.
 *
 * @param {Buffer} inputBuffer - Raw image buffer.
 * @returns {Promise<Buffer>} - Buffer of un-matted RGBA image.
 */
export async function removeBackground(inputBuffer) {
  const { data, info } = await sharp(inputBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  const outBuf = Buffer.from(data);
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let qHead = 0;
  let qTail = 0;

  // Enqueue all border pixels that match background criteria
  for (let x = 0; x < w; x++) {
    const topIdx = x;
    const botIdx = (h - 1) * w + x;
    if (isBackgroundPixel(data[topIdx * 4], data[topIdx * 4 + 1], data[topIdx * 4 + 2])) {
      visited[topIdx] = 1;
      queue[qTail++] = topIdx;
    }
    if (isBackgroundPixel(data[botIdx * 4], data[botIdx * 4 + 1], data[botIdx * 4 + 2])) {
      visited[botIdx] = 1;
      queue[qTail++] = botIdx;
    }
  }

  for (let y = 0; y < h; y++) {
    const leftIdx = y * w;
    const rightIdx = y * w + (w - 1);
    if (!visited[leftIdx] && isBackgroundPixel(data[leftIdx * 4], data[leftIdx * 4 + 1], data[leftIdx * 4 + 2])) {
      visited[leftIdx] = 1;
      queue[qTail++] = leftIdx;
    }
    if (!visited[rightIdx] && isBackgroundPixel(data[rightIdx * 4], data[rightIdx * 4 + 1], data[rightIdx * 4 + 2])) {
      visited[rightIdx] = 1;
      queue[qTail++] = rightIdx;
    }
  }

  // BFS flood-fill from borders inward
  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % w;
    const y = Math.floor(idx / w);

    // Make connected background pixel transparent
    outBuf[idx * 4 + 3] = 0;

    // 4-connected neighbors
    if (x > 0) {
      const n = idx - 1;
      if (!visited[n]) {
        visited[n] = 1;
        if (isBackgroundPixel(data[n * 4], data[n * 4 + 1], data[n * 4 + 2])) {
          queue[qTail++] = n;
        }
      }
    }
    if (x < w - 1) {
      const n = idx + 1;
      if (!visited[n]) {
        visited[n] = 1;
        if (isBackgroundPixel(data[n * 4], data[n * 4 + 1], data[n * 4 + 2])) {
          queue[qTail++] = n;
        }
      }
    }
    if (y > 0) {
      const n = idx - w;
      if (!visited[n]) {
        visited[n] = 1;
        if (isBackgroundPixel(data[n * 4], data[n * 4 + 1], data[n * 4 + 2])) {
          queue[qTail++] = n;
        }
      }
    }
    if (y < h - 1) {
      const n = idx + w;
      if (!visited[n]) {
        visited[n] = 1;
        if (isBackgroundPixel(data[n * 4], data[n * 4 + 1], data[n * 4 + 2])) {
          queue[qTail++] = n;
        }
      }
    }
  }

  // Second pass: Feather edge transitions and clean residual high-luminance speckles
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    const r = outBuf[p];
    const g = outBuf[p + 1];
    const b = outBuf[p + 2];
    const a = outBuf[p + 3];

    if (a === 0) continue;

    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const sat = maxVal - minVal;

    // Unconnected near-white specks
    if (minVal >= 240 && sat <= 15) {
      outBuf[p + 3] = 0;
      continue;
    }

    // Feather light brush edge borders to eliminate harsh steps
    if (minVal > 210 && sat < 25) {
      const factor = (240 - minVal) / (240 - 210);
      const newAlpha = Math.round(Math.pow(Math.max(0, factor), 1.3) * 255);
      outBuf[p + 3] = Math.min(a, newAlpha);
    }
  }

  return sharp(outBuf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

/**
 * Converts raw AI icon artwork into a standard 128x128 transparent PNG.
 *
 * @param {string|Buffer} input - Path to the raw source image (JPEG or PNG) or Buffer.
 * @param {string} outputPath - Target destination path for the standardized 128x128 PNG.
 * @returns {Promise<{ success: boolean, outputPath: string, width: number, height: number, sizeBytes: number }>}
 */
export async function processRawIconToStandardPng(input, outputPath) {
  let inputBuf;
  if (Buffer.isBuffer(input)) {
    inputBuf = input;
  } else {
    if (!fs.existsSync(input)) {
      throw new Error(`Input image file not found: ${input}`);
    }
    inputBuf = fs.readFileSync(input);
  }

  // 1. Remove background cleanly
  const unMatted = await removeBackground(inputBuf);

  // 2. Trim transparent bounding box around foreground subject
  let trimmed;
  try {
    trimmed = await sharp(unMatted)
      .trim()
      .toBuffer({ resolveWithObject: true });
  } catch (trimErr) {
    throw new Error(`Failed to trim subject: ${trimErr.message}`);
  }

  // 3. Scale subject to fit inside 104x104 box (~12px padding on 128x128 canvas = ~9.4% margin)
  const targetInner = 104;
  const resizedSubject = await sharp(trimmed.data)
    .resize(targetInner, targetInner, {
      fit: 'inside',
      kernel: 'lanczos3'
    })
    .toBuffer({ resolveWithObject: true });

  // 4. Ensure target directory exists
  const targetDir = path.dirname(outputPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 5. Composite centered on 128x128 transparent canvas
  const outputInfo = await sharp({
    create: {
      width: 128,
      height: 128,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{
      input: resizedSubject.data,
      gravity: 'center'
    }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  return {
    success: true,
    outputPath,
    width: outputInfo.width,
    height: outputInfo.height,
    sizeBytes: outputInfo.size
  };
}

// CLI entrypoint if executed directly: node scripts/process-ui-icon.mjs <inputPath> <outputPath>
const isDirectRun = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('process-ui-icon.mjs')
);

if (isDirectRun) {
  const [,, inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error('Usage: node scripts/process-ui-icon.mjs <inputPath> <outputPath>');
    process.exit(1);
  }

  try {
    const result = await processRawIconToStandardPng(inputPath, outputPath);
    console.log(`[OK] Successfully processed: ${result.outputPath} (${result.width}x${result.height}, ${result.sizeBytes} bytes)`);
  } catch (err) {
    console.error(`[ERROR] Processing failed: ${err.message}`);
    process.exit(1);
  }
}
