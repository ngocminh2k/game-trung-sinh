# Test Suite Ready: UI Icon Shortfall (121 Assets)

**Date**: 2026-09-08  
**Milestone**: M0 (Test & Pipeline Infrastructure)  
**Status**: VERIFIED & READY FOR GENERATION (M1–M4)

---

## 1. Test Suite Deliverables

The automated testing infrastructure and shared post-processing pipeline for the UI Icon Shortfall project have been implemented, verified, and placed into service:

1. **`scripts/verify-ui-icons.mjs`**:
   - Automated dual-layer verification test runner covering all 121 asset paths across 7 categories:
     - 60 NPC Pins (`src/assets/art/pins/npc/`)
     - 23 Event Pins (`src/assets/art/pins/event/`)
     - 9 Danger Pins (`src/assets/art/pins/danger/`)
     - 16 Exit Pins (`src/assets/art/pins/exit/`)
     - 6 LeftRail Navigation Tabs (`src/assets/art/tabs/`)
     - 4 Tứ Tượng Attributes (`src/assets/art/attrs/`)
     - 3 HUD Status Bars (`src/assets/art/hud/`)
   - **Tier 1 (Binary Parser)**: PNG Signature, `IHDR` width=128, height=128, 8-bit depth, colorType 6/4 or palette with `tRNS`.
   - **Tier 2 (Deep Pixel Audit)**: 4 corners alpha=0, transparent pixel ratio 15%–98%, outer 1px border margin validation.
   - Standard exit codes: `0` on 100% pass, `1` on any failure.

2. **`scripts/process-ui-icon.mjs`**:
   - Shared post-processing module exporting `processRawIconToStandardPng(inputPath, outputPath)`.
   - Un-mattes pure white background and feathers antialiased edges (alpha matting & un-premultiplying).
   - Trims subject bounding box and resizes inside 104×104 using Lanczos3.
   - Centers subject on 128×128 transparent canvas with alpha=0, guaranteeing ~10% margin (~12px padding).
   - Supports both programmatic ES module import and CLI execution.

3. **`TEST_INFRA.md`**:
   - Full specification of test philosophy, complete 121-asset inventory with concepts and colors, dual-tier test architecture, matting equations, quality thresholds, and execution instructions.

---

## 2. Test Execution & Baseline Verification

### Baseline Execution Result
- Command: `node scripts/verify-ui-icons.mjs`
- Result: **0/121 icons passed (0.0%)** with exit code `1`.
- Log output: Correctly identified all 121 target files as `FILE_NOT_FOUND` across all 7 categories.
- Assessment: Baseline correctly confirms absence of assets prior to M1–M4 generation.

### Smoke & Adversarial Verification Results
The test infrastructure was tested against synthetic assets with the following results:
- **Happy Path**: Raw 1024×1024 artwork processed through `processRawIconToStandardPng` passed all Tier 1 and Tier 2 checks (dimensions 128×128, transparent ratio 45.5%, corners alpha=0, outer margin transparent).
- **Adversarial Test 1 (Solid RGB without alpha)**: Correctly rejected with `NO_ALPHA_CHANNEL`.
- **Adversarial Test 2 (Non-128x128 dimensions)**: Correctly rejected with `DIMENSIONS_NOT_128`.
- **Adversarial Test 3 (Margin violation / edge collision)**: Correctly rejected with `MARGIN_VIOLATION`.
- **Adversarial Test 4 (Corner non-transparent)**: Correctly rejected with `CORNERS_NOT_TRANSPARENT`.

---

## 3. Instructions for Subsequent Milestones (M1–M4)

Workers generating assets should use the post-processing helper and verify their assets immediately:

```javascript
import { processRawIconToStandardPng } from '../../scripts/process-ui-icon.mjs';
import { verifyFile } from '../../scripts/verify-ui-icons.mjs';

// 1. Process generated raw artwork
await processRawIconToStandardPng(rawImagePath, targetPngPath);

// 2. Self-verify immediately
const check = await verifyFile(targetPngPath);
if (!check.ok) {
  throw new Error(`Asset quality failure for ${targetPngPath}: ${check.error}`);
}
```

Or run via CLI:
```powershell
node scripts/process-ui-icon.mjs <rawInput.jpg> <targetPng.png>
node scripts/verify-ui-icons.mjs
```
