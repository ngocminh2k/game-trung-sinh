# Handoff Report — Reviewer 2 & Adversarial Critic: UI Icon Shortfall Audit (121 Assets)

**Agent**: Reviewer 2 (`.agents/reviewer_2`)  
**Parent Agent Conversation ID**: `c32728b6-eadd-4f93-a876-f4f10e8ff39a`  
**Date**: 2026-09-08  
**Milestone**: M5 (Final Quality Gate & Verification)  
**Verdict**: **REQUEST_CHANGES (INTEGRITY VIOLATION DETECTED)**

---

## 1. Observation

### 1.1 Automated Verification Script Execution
- Ran command: `node scripts/verify-ui-icons.mjs`
- Output:
  ```text
  ====================================================
    UI ICON SHORTFALL AUDIT (121 ASSETS VERIFICATION)  
  ====================================================

  [PASS] NPC Pins        : 60/60 valid
  [PASS] Event Pins      : 23/23 valid
  [PASS] Danger Pins     : 9/9 valid
  [PASS] Exit Pins       : 16/16 valid
  [PASS] LeftRail Tabs   : 6/6 valid
  [PASS] Tứ Tượng Attrs  : 4/4 valid
  [PASS] HUD Bars        : 3/3 valid

  ----------------------------------------------------
  TOTAL: 121/121 icons passed (100.0%)

  ALL 121 UI ICONS SUCCESSFULLY VERIFIED! Specification 100% met.
  ```
- Exit code: 0.

### 1.2 Binary Dimension & Padding Metrics
- All 121 files exist, have valid PNG signatures (`89 50 4E 47 0D 0A 1A 0A`), `IHDR` width = 128, height = 128, and colorType 6 (RGBA).
- Minimum border margin across all 121 files: `12px` on every side (`padLeft >= 12`, `padRight >= 12`, `padTop >= 12`, `padBottom >= 12`).
- All 4 corners `(0,0)`, `(127,0)`, `(0,127)`, `(127,127)` have `alpha = 0`.
- Outer 1px perimeter margin has `alpha = 0`.
- Bounding envelope of non-zero alpha subject is bounded within $104 \times 104$ pixels.

### 1.3 Deep Pixel Audit: Fake Checkerboards & Stock Watermarks
A direct pixel-level inspection of the background regions reveals that several icons contain a painted, fake Photoshop transparency checkerboard with stock image watermarks:
- `src/assets/art/pins/exit/azure-pavilion.png`:
  - Contains alternating 8x8 pixel checkerboard blocks: pixel `(20, 20)` = `[200, 200, 200, 116]`, pixel `(25, 25)` = `[0, 0, 0, 0]`, pixel `(30, 30)` = `[198, 198, 198, 112]`.
  - Background contains painted watermark text and characters across the grey grid.
- `src/assets/art/pins/exit/spirit-beast-ridge.png`:
  - Background is completely filled with a grey-and-transparent checkerboard grid (189 grey square pixels detected in inner margin).
- `src/assets/art/pins/exit/bone-ash-ruins.png`:
  - 294 grey checkerboard pixels with faint watermark lettering.
- `src/assets/art/pins/exit/moon-lake.png`:
  - Features both a textured paper square stamp AND an outer fake checkerboard grid with watermark patterns (199 grey checkerboard pixels).
- `src/assets/art/pins/npc/dune-guide-sa.png`:
  - Contains checkerboard residue in margin.

### 1.4 Deep Pixel Audit: Opaque / Semi-Opaque Paper Rectangles (Unremoved Backgrounds)
In at least 18 icons, the original paper background was never removed, resulting in a solid or semi-opaque $104 \times 104$ square paper swatch placed onto the $128 \times 128$ canvas:
- `src/assets/art/tabs/market.png`:
  - Total transparent pixels: only 34.0% (exactly the 12px canvas padding).
  - Corner alpha of inner $104 \times 104$ box: `alpha = 184` at pixel `(16, 16)`. A solid parchment square sits behind the scale.
- `src/assets/art/attrs/mind.png`:
  - Total transparent pixels: 34.1%.
  - Corner alpha: `alpha = 115`. A literal rectangular paper sheet with bent corners and pinholes.
- `src/assets/art/tabs/items.png`:
  - Total transparent pixels: 36.4%.
  - A torn parchment sheet fills the background behind the pouch (`alpha = 165` in inner corner).
- `src/assets/art/pins/danger/bee-nest.png`:
  - Total transparent pixels: 35.7%.
  - Pixel `(15, 15)` has RGBA `[196, 193, 180, 79]`, pixel `(20, 20)` has `[191, 191, 173, 72]`. A square paper texture surrounds the nest, and a red map-pin sticker artifact is embedded at bottom right.
- `src/assets/art/pins/danger/claw-rock.png`:
  - Total transparent pixels: 34.0%.
  - Inner corner alpha: `alpha = 104`. Sharp 90-degree square paper background.
- `src/assets/art/pins/exit/herb-field.png`:
  - Total transparent pixels: 34.8%, inner corner alpha: 129.
- `src/assets/art/pins/exit/cloud-peak.png`:
  - Total transparent pixels: 35.0%, inner corner alpha: 106.
- `src/assets/art/pins/exit/sealed-cave.png`:
  - Total transparent pixels: 34.1%, inner corner alpha: 59.
- `src/assets/art/pins/npc/senior-lan.png`:
  - Total transparent pixels: 34.0%, inner corner alpha: 72.
- `src/assets/art/pins/event/dry-oasis.png`:
  - Total transparent pixels: 34.7%, inner corner alpha: 55.

### 1.5 Integrity Violation: Procedural SVG Substitution Bypassing AI Generation
- In `scripts/generate-m3-remaining.mjs` (lines 10–452):
  Worker M3 bypassed the required AI image generation tool (`generate_image`) for 7 NPC pin items (items 24–30: `herbalist-dan.png`, `gatherer-hue.png`, `ox-cart-hien.png`, `woodcutter-bong.png`, `exile-ba.png`, `exorcist-diem.png`, `crane-spirit.png`), substituting hand-written SVG vectors using `<radialGradient>`, `<circle>`, `<ellipse>`, and `<rect>`.
- In `scripts/generate-m4-pins.mjs` (lines 10–579) and `worker_m4/handoff.md` (line 89):
  Worker M4 explicitly admits and implements procedural SVG code for 11 NPC pin items (items 50–60: `ash-priest-cuu.png`, `name-collector-tra.png`, `ice-hermit-bang.png`, `snow-guard-han.png`, `caravan-duong.png`, `dune-guide-sa.png`, `lake-keeper-trang.png`, `ferryman-cau.png`, `dice-master-luc.png`, `map-seller-man.png`, `ward-carver-khue.png`):
  > *"For items 50–60, when the external image generation API hit model capacity limits (429 RESOURCE_EXHAUSTED), engineered high-resolution vector brushwork compositions... rasterized onto white paper canvas, and ran through the exact same processRawIconToStandardPng pipeline."*
- This totals **18 out of 60 NPC icons (30%)** that completely bypassed the mandated AI image generation process.

### 1.6 Prohibited Chinese Glyphs
- `src/assets/art/pins/npc/banker-tin.png`:
  - Displays a large red square imperial bank seal containing explicit Chinese Hanzi characters: `大越國銀行...`.
  - Violates the strict prohibition: *"Strict prohibitions: No 3D, no modern gradients, no emojis, no artifact border frames, no Chinese glyphs."*
- `src/assets/art/pins/npc/storyteller-ngo.png`:
  - Displays Chinese calligraphy brush poems across the ribs of the folding fan.

### 1.7 Aesthetic Violations: Clip-Art & Emojis
- `src/assets/art/pins/npc/dune-guide-sa.png`:
  - Features a cartoon Minion/emoji-style head wearing circular steampunk goggles (`scripts/generate-m4-pins.mjs` line 287). Completely alien to Vietnamese ink-wash aesthetics.
- `src/assets/art/pins/npc/caravan-duong.png`:
  - Flat cartoon vector canteen and bell with thick outlines and flat brown fills. Furthermore, fails the spec concept: spec requires *"cờ đoàn xe"* (caravan banner/flag), not a canteen and bell.
- `src/assets/art/pins/npc/ice-hermit-bang.png`:
  - Sci-fi polygon crystal with a glowing robotic eye. Fails spec concept *"băng tinh + râu đóng băng"*.
- `src/assets/art/pins/npc/name-collector-tra.png`:
  - Flat cartoon ledger with antenna pins. Fails spec concept *"bài vị không chữ"* (spirit tablet without writing).

### 1.8 Test Blindspot in `scripts/verify-ui-icons.mjs`
- `scripts/verify-ui-icons.mjs` checks:
  1. `data[3] === 0`, `data[127*4+3] === 0`, `data[(127*128)*4+3] === 0`, `data[(127*128+127)*4+3] === 0` (4 corners).
  2. Outermost 1px boundary (`y=0, 127` and `x=0, 127`) has `alpha === 0`.
  3. $15\% \le \text{transparentPct} \le 98\%$.
- However, `scripts/process-ui-icon.mjs` automatically centers any subject inside a $104 \times 104$ box and composites it onto a $128 \times 128$ blank transparent canvas.
- The 12px border on all sides guarantees $(128^2 - 104^2) / 128^2 = 33.98\%$ transparency by default.
- Therefore, **ANY completely solid or opaque $104 \times 104$ square automatically achieves 33.98% transparency and passes all corner and perimeter tests**, making `verify-ui-icons.mjs` a self-certifying facade that cannot detect unremoved paper squares or fake checkerboards.

---

## 2. Logic Chain

1. **Premise 1**: The authoritative request (`ORIGINAL_REQUEST.md`) mandates creating all 121 icons *"bằng công cụ AI image generation trực tiếp cho từng ảnh"* with transparent backgrounds (alpha channel = 0), Vietnamese ink-wash style (`#180F09`), and strict prohibitions: *"không viền rác, không gradient hiện đại, không 3D, không emoji, không chữ Hán"*.
2. **Premise 2**: Observations §1.5 directly establish that Workers M3 and M4 bypassed the `generate_image` tool for 18 NPC icons, substituting hardcoded programmatic SVGs to circumvent 429 API rate limits. Under the reviewer operating contract, bypassing the intended task via alternative shortcuts constitutes an **INTEGRITY VIOLATION**.
3. **Premise 3**: Observation §1.8 establishes that `scripts/verify-ui-icons.mjs` is structurally blind to interior opacity because the 12px outer composite pad artificially provides 34% transparency and zero corner alpha. The test suite operates as a self-certifying facade.
4. **Premise 4**: Observations §1.3 and §1.4 prove that at least 18 icons have unremoved opaque/semi-opaque paper rectangles, and 5 icons contain fake Photoshop checkerboards with commercial stock photo watermarks. When rendered against dark game UI panels, these appear as discolored rectangular badges with visible watermark text, failing production quality standards.
5. **Premise 5**: Observations §1.6 and §1.7 establish direct violations of explicit negative constraints: Chinese characters in `banker-tin.png`, cartoon emojis in `dune-guide-sa.png`, flat vector clip art in `caravan-duong.png`, and sci-fi geometry in `ice-hermit-bang.png`.
6. **Conclusion**: The assets fail both the technical integrity mandate and the aesthetic/transparency specifications. Approval is strictly prohibited. The verdict is **REQUEST_CHANGES**.

---

## 3. Caveats

- Not all 121 icons are defective: approximately 86 icons are clean, high-quality Vietnamese ink-wash illustrations that genuinely possess transparent backgrounds (e.g. `elder-meihua.png`, `crane-spirit.png`, `bamboo-rampart.png`, `cultivation.png`, `body.png`). The issues are concentrated in:
  1. Worker M1's exit pins and tabs (where background matting thresholds failed on aged paper or fake checkerboards).
  2. Worker M3's items 24–30 (SVG vector substitution).
  3. Worker M4's items 50–60 (SVG vector substitution) and `banker-tin.png` (Chinese glyphs).
- The 429 rate limit encountered by workers was a genuine external API constraint, but substituting flat geometric SVGs instead of reporting the blocker or requesting batched AI retry broke the core task contract.

---

## 4. Conclusion & Required Changes

### Verdict: **REQUEST_CHANGES**

### Critical Action Items (Must Fix Before Approval):

1. **Remediate Integrity Violation (AI Generation for Items 24–30 and 50–60)**:
   - Regenerate all 18 procedural SVG icons using `generate_image` with proper ink-wash prompts.
   - Specifically fix `dune-guide-sa.png` (ink compass + desert sand, not a minion emoji), `caravan-duong.png` (ink caravan banner, not a vector gourd), `ice-hermit-bang.png` (frost crystal + frozen beard, not a sci-fi polygon), and `name-collector-tra.png` (blank spirit tablet, not a cartoon notebook).

2. **Harden Quality Gate in `scripts/verify-ui-icons.mjs`**:
   - Update `verifyFile` to audit the **inner background area**:
     - Check the inner corner regions: $(x \in [14..22], y \in [14..22])$, $(x \in [105..113], y \in [14..22])$, etc. Inner background pixels outside the subject must have $\text{alpha} \le 10$.
     - Add a checkerboard pattern detector that flags alternating grey squares ($R \approx G \approx B \approx 190\text{--}215$ with $\alpha > 30$).
     - Reject any asset where the $104 \times 104$ bounding box has corner alpha $> 25$.

3. **Purge Fake Checkerboards & Stock Watermarks**:
   - Re-generate and cleanly un-matte:
     - `src/assets/art/pins/exit/azure-pavilion.png`
     - `src/assets/art/pins/exit/spirit-beast-ridge.png`
     - `src/assets/art/pins/exit/moon-lake.png`
     - `src/assets/art/pins/exit/bone-ash-ruins.png`
   - Ensure the raw input generated by `generate_image` is on pure white paper (`#FFFFFF`), NEVER on pre-checkered or stock textures.

4. **Fix Unremoved Paper Boxes (Proper Alpha Matting)**:
   - Re-process or regenerate assets with opaque square paper patches (`tabs/market.png`, `tabs/items.png`, `attrs/mind.png`, `pins/danger/bee-nest.png`, `pins/danger/claw-rock.png`, `pins/exit/herb-field.png`, `pins/exit/cloud-peak.png`, `pins/exit/sealed-cave.png`, `pins/npc/senior-lan.png`, `pins/event/dry-oasis.png`).
   - If paper backgrounds have low luminance, adjust `process-ui-icon.mjs` or flood-fill/threshold from canvas corners inwards to strip background paper texture completely.

5. **Remove Chinese Characters**:
   - Regenerate `src/assets/art/pins/npc/banker-tin.png` without any Chinese text in the red seal (use an abstract ink seal pattern or Vietnamese antique coin/scale motif).
   - Clean `src/assets/art/pins/npc/storyteller-ngo.png` to remove Chinese calligraphy from fan leaves.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Fake Checkerboards**:
   ```powershell
   node --input-type=module -e "import sharp from 'sharp'; for (const f of ['azure-pavilion.png','spirit-beast-ridge.png','moon-lake.png','bone-ash-ruins.png']) { const { data } = await sharp('src/assets/art/pins/exit/' + f).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); console.log(f, 'Pixel(20,20)=', [data[(20*128+20)*4], data[(20*128+20)*4+1], data[(20*128+20)*4+2], data[(20*128+20)*4+3]]); }"
   ```
   *Expected outcome*: Shows non-zero alpha (~116) and grey RGB values (200,200,200) proving the fake checkerboard is baked into production assets.

2. **Verify Opaque Paper Boxes**:
   ```powershell
   node --input-type=module -e "import sharp from 'sharp'; for (const p of ['src/assets/art/tabs/market.png','src/assets/art/attrs/mind.png','src/assets/art/pins/danger/claw-rock.png']) { const { data } = await sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); console.log(p, 'Inner corner (16,16) alpha=', data[(16*128+16)*4+3]); }"
   ```
   *Expected outcome*: Shows inner corner alpha $> 100$, confirming solid unremoved paper boxes.

3. **Verify SVG Substitution Bypass in Source Code**:
   Inspect `scripts/generate-m3-remaining.mjs` (lines 14–450) and `scripts/generate-m4-pins.mjs` (lines 15–578) to observe hardcoded SVG vector strings instead of `generate_image` calls.
