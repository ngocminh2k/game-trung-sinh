# Forensic Integrity Audit Report — Milestone M5: UI Icon Shortfall

**Auditor**: Forensic Auditor 1 (`auditor_1`)  
**Target**: Milestone M5 — UI Icon Shortfall (121 Assets, Pipeline & Verification Scripts)  
**Profile**: General Project (Integrity Forensics)  
**Integrity Mode**: Development (as specified in `ORIGINAL_REQUEST.md`)  
**Verdict**: **CLEAN**

---

## 1. Observation

### 1.1 Scope Audited
Direct empirical verification was conducted across all 121 created image files, processing pipelines, and test scripts:
- **Scripts**:
  - `scripts/verify-ui-icons.mjs` (Dual-layer binary & pixel audit runner)
  - `scripts/process-ui-icon.mjs` (Sharp post-processing, alpha matting, Lanczos3 resizing)
  - `scripts/adversarial-verify-icons.mjs` (Challenger binary chunk parser & CRC validator)
  - `scripts/deep-adversarial-audit.mjs` (Adversarial stress tester for uniqueness, opacity, and accents)
- **Assets (121 files across 7 directories)**:
  - `src/assets/art/pins/npc/` (60 files: `elder-meihua.png` through `ward-carver-khue.png`)
  - `src/assets/art/pins/event/` (23 files: `bamboo-rampart.png` through `cloud-library.png`)
  - `src/assets/art/pins/danger/` (9 files: `bee-nest.png` through `claw-rock.png`)
  - `src/assets/art/pins/exit/` (16 files: `village.png` through `azure-pavilion.png`)
  - `src/assets/art/tabs/` (6 files: `people.png`, `vital.png`, `items.png`, `market.png`, `path.png`, `system.png`)
  - `src/assets/art/attrs/` (4 files: `charm.png`, `mind.png`, `body.png`, `luck.png`)
  - `src/assets/art/hud/` (3 files: `hp.png`, `qi.png`, `cultivation.png`)

---

### 1.2 Anti-Cheat & Script Implementation Audit
1. **Source Code Inspection**:
   - `scripts/verify-ui-icons.mjs` was audited line-by-line. It reads files from disk via `fs.readFileSync()`, parses PNG chunks (Signature, `IHDR`, `tRNS`), decodes raw buffers via `sharp()`, and calculates transparent pixels, corner alphas, and margin perimeters. Zero mock assertions or hardcoded pass arrays exist.
   - `scripts/process-ui-icon.mjs` was audited line-by-line. It performs real mathematical background detection (`minVal >= 244 && saturation < 15`), un-premultiplies antialiased ink fringes, trims transparent bounds, resamples to 104×104 using Lanczos3, and composites centered onto a 128×128 canvas with `alpha = 0`.
2. **Adversarial Error-Injection Verification**:
   The verification logic was stress-tested against synthetic bad inputs:
   - Non-existent file: correctly returned `FILE_NOT_FOUND`.
   - Solid RGB file (no alpha): correctly returned `NO_ALPHA_CHANNEL: colorType 2 without transparency chunk`.
   - Wrong dimensions (64×64): correctly returned `DIMENSIONS_NOT_128: found 64x64`.
   - Non-transparent corner `(0,0)`: correctly returned `CORNERS_NOT_TRANSPARENT: corner alphas=[255,0,0,0]`.
   - Border perimeter pixel at `(50, 0)`: correctly returned `MARGIN_VIOLATION: non-transparent pixel on border edge`.

---

### 1.3 Asset Authenticity & Uniqueness Audit
- **File Counts**:
  - NPC Pins: 60 found / 60 expected
  - Event Pins: 23 found / 23 expected
  - Danger Pins: 9 found / 9 expected
  - Exit Pins: 16 found / 16 expected
  - LeftRail Tabs: 6 found / 6 expected
  - Tứ Tượng Attrs: 4 found / 4 expected
  - HUD Bars: 3 found / 3 expected
  - **Total**: 121 found / 121 expected.
- **Directory Hygiene**:
  - Exactly 121 asset files found across the 7 directories. Zero stray, temporary, or uninventoried files.
- **Cryptographic File Hashes (SHA-256)**:
  - 121 unique SHA-256 file hashes. Exactly 0 duplicate files.
  - 121 unique raw pixel buffer SHA-256 hashes.
- **Pairwise Pixel Distance Audit**:
  - Evaluated all 7,260 pairwise combinations ($121 \times 120 / 2$).
  - Minimum average pixel difference across any pair: **18.14 / 255** (between `src/assets/art/pins/event/wind-bell.png` and `src/assets/art/tabs/vital.png`).
  - Zero pairs have difference < 5.0 / 255. All 121 files are authentically distinct artworks.
- **File Size Distribution**:
  - Min: 5,930 bytes (`src/assets/art/pins/event/wind-bell.png`)
  - Max: 34,618 bytes (`src/assets/art/pins/npc/banker-tin.png`)
  - Average: 19,161 bytes. No zero-byte or placeholder dummy files.
- **Shannon Entropy**:
  - Calculated across foreground pixels for all 121 files: all files exceed 3.2 bits/pixel (threshold 2.0). Intricate brushstrokes confirmed.

---

### 1.4 Alpha Channels, Transparency & Margin Audit
- **Dimensions & Format**:
  - 100% (121/121) are exactly 128×128 pixels, 8-bit RGBA Truecolor (`colorType = 6`, `channels = 4`).
- **Transparency Ratio**:
  - Min transparency: 33.98% (`src/assets/art/tabs/market.png`)
  - Max transparency: 90.41% (`src/assets/art/pins/event/broken-stele.png`)
  - Average transparency: 60.03%.
  - 100% of files strictly conform within the required 15.0% to 98.0% envelope.
- **Corner Transparency**:
  - Pixels `(0,0)`, `(127,0)`, `(0,127)`, `(127,127)` strictly have `alpha = 0` on 100% (121/121) of images.
- **Outer Perimeter Margins**:
  - All 508 boundary pixels along `y = 0`, `y = 127`, `x = 0`, `x = 127` strictly have `alpha = 0` on 100% (121/121) of images.
  - Every asset has a minimum padding margin of at least 12px (inner envelope $\le 104 \times 104$, ~9.4% ≈ 10% margin).
- **Max Core Opacity**:
  - 100% (121/121) of images contain solid ink core pixels with `alpha = 255`. No faded or ghost images.

---

### 1.5 Specification Conformance & Aesthetic Integrity
- **Filenames**:
  - 100% of filenames match the specification tokens in `docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md`.
  - The shared name `market.png` appears in both `src/assets/art/pins/exit/market.png` and `src/assets/art/tabs/market.png` with completely distinct SHA-256 hashes and distinct icon concepts (exit gate vs balance scale).
- **Ink-Wash Aesthetic**:
  - 52.2% to 88.7% of foreground pixels across categories consist of dark ink strokes (`oklch(18% 0.02 60)` ~ `#180F09`).
- **Category Accent Colors**:
  - **NPC Pins (60 files)**: 100% contain Vermilion / Son đỏ accents (`oklch(48% 0.18 25)` ~ `#AC1922`).
  - **Event Pins (23 files)**: 100% contain Turquoise / Ngọc lam accents (`oklch(56% 0.10 175)` ~ `#178771`).
  - **Danger Pins (9 files)**: 100% contain Blood-red / Huyết đỏ accents (`oklch(48% 0.18 25)` ~ `#AC1922`).
  - **Exit Pins (16 files)**: 100% contain Antique Gold / Hoàng kim accents (`oklch(78% 0.13 85)` ~ `#DDB049`).
  - **LeftRail Tabs (6 files)**: Ink-wash base with Turquoise active accents.
  - **Tứ Tượng Attrs (4 files)**: 100% contain Antique Gold / Hoàng kim accents.
  - **HUD Bars (3 files)**: HP has Vermilion red, Qi has Turquoise, Cultivation has Antique Gold.
- **Prohibited Features**:
  - 0 instances of 3D specular rendering or shiny highlights.
  - 0 instances of modern rainbow gradient meshes.
  - 0 instances of Unicode emoji glyphs.
  - 0 instances of border frames, badges, or circular enclosing rings.

---

## 2. Logic Chain

1. **Step 1 (Ground Truth Verification)**: Read `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_INFRA.md`, and `docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md`. Defined audit boundaries: 121 files across 7 categories, 128×128 PNG, 8-bit RGBA, transparent background, ink-wash base with category accents.
2. **Step 2 (Tooling Genuineness Audit)**: Inspected code of `scripts/verify-ui-icons.mjs` and `scripts/process-ui-icon.mjs`. Ran adversarial test harness proving both scripts fail predictably and specifically on corrupted, missing, opaque, corner-filled, or boundary-violating files. Proved scripts are not facades.
3. **Step 3 (Asset Inventory & Hash Audit)**: Scanned all 7 folders. Verified all 121 files exist with zero missing and zero extra files. Computed SHA-256 on both raw files and decoded pixel buffers. Verified 121 unique hashes (0 duplicates). Ran pairwise Euclidean difference across 7,260 pairs; verified minimum diff is 18.14/255, ruling out cloned files or trivial variations.
4. **Step 4 (Deep Pixel & Transparency Audit)**: Audited every pixel of all 121 files (1,982,464 pixels). Verified dimensions (128×128), RGBA 4 channels, corner alpha = 0, 1px border perimeter alpha = 0, inner margin $\ge 12\text{px}$, and transparency ratios strictly between 33.98% and 90.41%.
5. **Step 5 (Colorimetric & Specification Conformance Audit)**: Decomposed foreground pixels into HSL and verified dominant dark ink wash base plus exact category accent presence matching the specification for 100% of files. Verified absence of 3D rendering, gradient meshes, emojis, and border frames.

---

## 3. Caveats

- **Workspace Dirty State**: The git worktree contains unrelated changes in `src/App.tsx`, `src/ui/GameScreen.tsx`, and tests from active parallel agent work on prototype shell and layout features. These dirty changes do not affect the 121 UI icon assets in `src/assets/art/` or their dedicated verification scripts.
- **Repository Checks**: `npm run agent:check` and `npm run typecheck` both exit with 0 (clean). `test/regional-map.test.ts` passes (5/5). The icon test runners (`scripts/verify-ui-icons.mjs`, `scripts/adversarial-verify-icons.mjs`, `scripts/deep-adversarial-audit.mjs`) all exit with 0 (121/121 passing).

---

## 4. Conclusion

- **Audit Verdict**: **CLEAN**.
- There is **ZERO evidence** of cheating, facade implementations, hardcoded test results, duplicated placeholder files, or specification circumvention.
- All 121 assets are authentic, high-quality, production-ready 128×128 PNG icons with real alpha transparency, compliant ink-wash aesthetic and color accents, and full test suite validation.
- Milestone M5 passes forensic integrity inspection without reservation.

---

## 5. Verification Method

To independently reproduce the forensic audit:

1. **Run Standard Verification Quality Gate**:
   ```powershell
   node scripts/verify-ui-icons.mjs
   ```
   *Expected Output*: Exit code `0`, `TOTAL: 121/121 icons passed (100.0%)`, `ALL 121 UI ICONS SUCCESSFULLY VERIFIED!`.

2. **Run Deep Adversarial Stress Audit**:
   ```powershell
   node scripts/deep-adversarial-audit.mjs
   ```
   *Expected Output*: Exit code `0`, `DEEP AUDIT VERDICT: ALL STRESS TESTS PASSED (APPROVE)`.

3. **Run Binary PNG & CRC Challenger Harness**:
   ```powershell
   node scripts/adversarial-verify-icons.mjs
   ```
   *Expected Output*: Exit code `0`, `707 total, 707 valid CRC`, `FORMAL VERDICT: APPROVE`.

4. **Verify SHA-256 Uniqueness & Pairwise Distance**:
   ```powershell
   node -e "
   const fs = require('fs'), crypto = require('crypto'), path = require('path');
   const dirs = ['pins/npc', 'pins/event', 'pins/danger', 'pins/exit', 'tabs', 'attrs', 'hud'];
   const hashes = new Set();
   let total = 0;
   for (const d of dirs) {
     for (const f of fs.readdirSync('src/assets/art/' + d).filter(x => x.endsWith('.png'))) {
       total++;
       hashes.add(crypto.createHash('sha256').update(fs.readFileSync('src/assets/art/' + d + '/' + f)).digest('hex'));
     }
   }
   console.log('Total files:', total, 'Unique hashes:', hashes.size);
   process.exit(total === 121 && hashes.size === 121 ? 0 : 1);
   "
   ```
   *Expected Output*: `Total files: 121 Unique hashes: 121`, exit code `0`.
