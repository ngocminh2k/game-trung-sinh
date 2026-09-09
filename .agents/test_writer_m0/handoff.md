# Handoff Report — Milestone M0: UI Icon Shortfall Test Infrastructure

**Agent**: Test Writer M0 (`.agents/test_writer_m0`)  
**Parent Agent Conversation ID**: `c32728b6-eadd-4f93-a876-f4f10e8ff39a`  
**Date**: 2026-09-08  
**Milestone**: M0 (Test Infrastructure & Shared Helpers)  
**Status**: Complete (Hard Handoff)

---

## 1. Observation

1. **Authoritative Requirements**:
   - `ORIGINAL_REQUEST.md` lines 14–35 specifies creating 121 missing UI graphic icons across 7 groups (60 NPC pins, 23 Event pins, 9 Danger pins, 16 Exit pins, 6 Tabs, 4 Attrs, 3 HUD bars) with 128×128 PNG format, transparent background (alpha = 0), and an automated verification script.
   - `PROJECT.md` lines 14–139 indexes all 121 features mapped across milestones M1–M4.
   - Explorer 2's report (`.agents/explorer_2/report.md` §3.4 and §4.3) defines the exact algorithm for post-processing (`scripts/process-ui-icon.mjs`) and dual-tier verification (`scripts/verify-ui-icons.mjs`).

2. **File Creation**:
   - Created `scripts/process-ui-icon.mjs` (162 lines): exports `processRawIconToStandardPng(inputPath, outputPath)` implementing alpha matting, un-premultiplying, trimming, Lanczos3 104×104 scaling, and centering on a 128×128 transparent canvas with alpha = 0.
   - Created `scripts/verify-ui-icons.mjs` (215 lines): implements complete two-tier verification:
     - Tier 1: Binary PNG validation (PNG magic bytes `89 50 4E 47 0D 0A 1A 0A`, `IHDR` chunk width=128, height=128, colorType 6/4 or palette with `tRNS`).
     - Tier 2: Sharp raw pixel audit (4 corners (0,0), (127,0), (0,127), (127,127) alpha = 0; transparent pixel ratio between 15% and 98%; outer 1px perimeter margin transparent).
   - Created `TEST_INFRA.md` (212 lines): comprehensive documentation detailing testing philosophy, 121-asset inventory with concepts and accent colors, dual-tier test architecture, matting formulas, and execution commands.
   - Created `TEST_READY.md` (66 lines): signaling that the test infrastructure is validated and ready for M1–M4 workers.

3. **Tool Commands and Results**:
   - `node -e "import('sharp').then(() => console.log('sharp ok'))"`: Exited code 0 (`sharp ok`).
   - Smoke test against synthetic images:
     - Happy path test:
       `Processed result: { success: true, width: 128, height: 128, sizeBytes: 5274 }`
       `Verification result: { ok: true, transparentPct: '45.5%', dimensions: '128x128', sizeBytes: 5274 }`
     - Adversarial test 1 (Solid RGB image without alpha):
       `Solid image verify: { ok: false, error: 'NO_ALPHA_CHANNEL: colorType 2 without transparency chunk' }`
     - Adversarial test 2 (Wrong dimensions 64x64):
       `Wrong dimension verify: { ok: false, error: 'DIMENSIONS_NOT_128: found 64x64' }`
     - Adversarial test 3 (Margin violation / boundary touch):
       `Margin violation verify: { ok: false, error: 'MARGIN_VIOLATION: non-transparent pixel on border edge (subject touches canvas boundary)' }`
     - Adversarial test 4 (Corner non-transparent):
       `Corner violation verify: { ok: false, error: 'CORNERS_NOT_TRANSPARENT: corner alphas=[180,0,0,0]' }`
   - Baseline workspace verification run:
     `node scripts/verify-ui-icons.mjs` exited with code 1, reporting:
     ```text
     ====================================================
       UI ICON SHORTFALL AUDIT (121 ASSETS VERIFICATION)  
     ====================================================

     [FAIL] NPC Pins        : 0/60 valid
     [FAIL] Event Pins      : 0/23 valid
     [FAIL] Danger Pins     : 0/9 valid
     [FAIL] Exit Pins       : 0/16 valid
     [FAIL] LeftRail Tabs   : 0/6 valid
     [FAIL] Tứ Tượng Attrs  : 0/4 valid
     [FAIL] HUD Bars        : 0/3 valid

     ----------------------------------------------------
     TOTAL: 0/121 icons passed (0.0%)
     ```
     This confirms that all 121 paths are accurately registered and cleanly fail with `FILE_NOT_FOUND` as expected prior to asset generation.
   - Codebase typecheck:
     `npm run typecheck` (`tsc --noEmit`) exited with code 0 without any errors.

---

## 2. Logic Chain

1. From Observation §1, the UI icon shortfall project requires 121 specific assets across 7 categories to replace temporary Hanzi glyphs. Each asset must strictly adhere to 128×128 dimensions and alpha transparency.
2. From Observation §2, `scripts/verify-ui-icons.mjs` encodes the full 121 asset paths into 7 distinct categories matching the project specification. It enforces dual-tier checks: Tier 1 binary parser checks chunk headers without external dependencies, and Tier 2 decodes raw RGBA buffers via `sharp` to check corner alphas, transparency thresholds (15%–98%), and perimeter margin.
3. From Observation §3, the smoke test verified that `processRawIconToStandardPng` correctly un-mattes white backgrounds and produces a compliant 128×128 PNG that passes `verifyFile`. Furthermore, all four adversarial failure modes (solid background, invalid dimensions, margin violation, and dirty corners) were caught and rejected with explicit error codes.
4. From Observation §3, running `node scripts/verify-ui-icons.mjs` in the workspace correctly reported 0/121 passed (0.0%) and exited with code 1. It is fully operational and ready to evaluate assets as workers produce them.
5. From Observation §3, `npm run typecheck` exited cleanly with code 0, confirming no type regressions were introduced.

---

## 3. Caveats

- The 121 icon asset files do not exist yet in `src/assets/art/` because their generation belongs to milestones M1, M2, M3, and M4. The verification runner's current exit code 1 is expected behavior.
- `scripts/process-ui-icon.mjs` assumes input images from `generate_image` have an isolated subject on a white/near-white paper background ($min(R,G,B) \ge 244$, saturation $< 15$), as established in the prompt engineering template.

---

## 4. Conclusion

Milestone M0 is complete.
- `scripts/verify-ui-icons.mjs` is established as the automated Quality Gate covering all 121 UI icon assets across the 7 specified categories.
- `scripts/process-ui-icon.mjs` provides the shared post-processing engine for un-premultiplying white matting, trimming, scaling to 104×104, and centering on a 128×128 transparent canvas.
- `TEST_INFRA.md` and `TEST_READY.md` are published at the project root.
- The project is fully unblocked for the orchestrator to dispatch generation subagents for milestones M1 through M4.

---

## 5. Verification Method

To independently verify M0 deliverables:

1. **Verify Baseline Audit Run**:
   ```powershell
   node scripts/verify-ui-icons.mjs
   ```
   *Expected outcome*: Exits with code 1, reporting 0/121 valid icons and listing `FILE_NOT_FOUND` for all 121 files across the 7 categories.

2. **Verify Shared Post-Processing & Verification Integration (PowerShell)**:
   ```powershell
   node --input-type=module -e "import sharp from 'sharp'; import { processRawIconToStandardPng } from './scripts/process-ui-icon.mjs'; import { verifyFile } from './scripts/verify-ui-icons.mjs'; import fs from 'node:fs'; async function test() { const svg = '<svg width=\`"1024\`" height=\`"1024\`"><rect width=\`"1024\`" height=\`"1024\`" fill=\`"#ffffff\`"/><circle cx=\`"512\`" cy=\`"512\`" r=\`"200\`" fill=\`"#180f09\`"/></svg>'; await sharp(Buffer.from(svg)).jpeg().toFile('test-raw.jpg'); await processRawIconToStandardPng('test-raw.jpg', 'test-out.png'); const res = await verifyFile('test-out.png'); fs.unlinkSync('test-raw.jpg'); fs.unlinkSync('test-out.png'); if (!res.ok) throw new Error('Verification failed: ' + res.error); console.log('SUCCESS: Post-processing and verification integration validated!'); } test();"
   ```
   *Expected outcome*: Logs `SUCCESS: Post-processing and verification integration validated!` and exits code 0.

3. **Verify Typecheck**:
   ```powershell
   npm run typecheck
   ```
   *Expected outcome*: Exits code 0 with clean output.
