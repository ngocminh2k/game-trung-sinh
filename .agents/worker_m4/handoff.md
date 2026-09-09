# Handoff Report — Worker M4: NPC Pins (Items 31–60)

## 1. Observation
- **Assigned Scope**: Exactly 30 NPC map pin icons in `src/assets/art/pins/npc/` corresponding to items 31 to 60 from `docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md`:
  31. `herbalist-lan.png`
  32. `swordsman-diep.png`
  33. `monk-nhu.png`
  34. `broker-tieu.png`
  35. `fisher-yen.png`
  36. `relic-hunter-bach.png`
  37. `beast-tamer-le.png`
  38. `pavilion-disciple-anh.png`
  39. `wandering-blade-phong.png`
  40. `rogue-cultivator-nhat.png`
  41. `gardener-thin.png`
  42. `auctioneer-hoan.png`
  43. `banker-tin.png`
  44. `gardener-vien.png`
  45. `beekeeper-oanh.png`
  46. `archivist-thu.png`
  47. `judge-quang.png`
  48. `tamer-hac.png`
  49. `beast-singer-my.png`
  50. `ash-priest-cuu.png`
  51. `name-collector-tra.png`
  52. `ice-hermit-bang.png`
  53. `snow-guard-han.png`
  54. `caravan-duong.png`
  55. `dune-guide-sa.png`
  56. `lake-keeper-trang.png`
  57. `ferryman-cau.png`
  58. `dice-master-luc.png`
  59. `map-seller-man.png`
  60. `ward-carver-khue.png`
- **Asset Specifications**:
  - Size: Exactly 128×128 pixels.
  - Channels: 8-bit RGBA Truecolor with alpha transparency channel.
  - Background: Fully transparent (alpha = 0 outside subject).
  - 4 Corners: Pixels `(0,0)`, `(127,0)`, `(0,127)`, `(127,127)` strictly have alpha = 0.
  - Border Margins: Outer 1px perimeter border strictly has alpha = 0 (inner subject bounded within ~104×104, enforcing ~10% margin).
  - Transparency Ratio: Bounded between 15% and 98%.
  - Aesthetic: Vietnamese ink-wash (*mực tàu giấy bản*) base `#180F09` with Vermilion / Son đỏ accent `#AC1922` (oklch(48% 0.18 25)).
- **Verification Tool Output**:
  Running verification on all 30 files produced:
  ```
  | # | Filename | Dimensions | Alpha % | Size (bytes) | Status |
  |---|----------|------------|---------|--------------|--------|
  | 31 | herbalist-lan.png | 128x128 | 40.9% | 21215 | VALID |
  | 32 | swordsman-diep.png | 128x128 | 83.4% | 10476 | VALID |
  | 33 | monk-nhu.png | 128x128 | 77.6% | 13890 | VALID |
  | 34 | broker-tieu.png | 128x128 | 57.2% | 19713 | VALID |
  | 35 | fisher-yen.png | 128x128 | 75.2% | 14194 | VALID |
  | 36 | relic-hunter-bach.png | 128x128 | 37.7% | 25579 | VALID |
  | 37 | beast-tamer-le.png | 128x128 | 77.5% | 13328 | VALID |
  | 38 | pavilion-disciple-anh.png | 128x128 | 69.5% | 17219 | VALID |
  | 39 | wandering-blade-phong.png | 128x128 | 80.3% | 11946 | VALID |
  | 40 | rogue-cultivator-nhat.png | 128x128 | 71.1% | 17635 | VALID |
  | 41 | gardener-thin.png | 128x128 | 68.5% | 18685 | VALID |
  | 42 | auctioneer-hoan.png | 128x128 | 71.7% | 17336 | VALID |
  | 43 | banker-tin.png | 128x128 | 34.6% | 34618 | VALID |
  | 44 | gardener-vien.png | 128x128 | 71.9% | 17121 | VALID |
  | 45 | beekeeper-oanh.png | 128x128 | 36.2% | 23815 | VALID |
  | 46 | archivist-thu.png | 128x128 | 57.7% | 26371 | VALID |
  | 47 | judge-quang.png | 128x128 | 43.0% | 16143 | VALID |
  | 48 | tamer-hac.png | 128x128 | 66.0% | 20214 | VALID |
  | 49 | beast-singer-my.png | 128x128 | 79.4% | 12996 | VALID |
  | 50 | ash-priest-cuu.png | 128x128 | 72.6% | 10173 | VALID |
  | 51 | name-collector-tra.png | 128x128 | 59.6% | 11669 | VALID |
  | 52 | ice-hermit-bang.png | 128x128 | 67.1% | 15230 | VALID |
  | 53 | snow-guard-han.png | 128x128 | 59.9% | 15006 | VALID |
  | 54 | caravan-duong.png | 128x128 | 66.4% | 12237 | VALID |
  | 55 | dune-guide-sa.png | 128x128 | 55.0% | 16261 | VALID |
  | 56 | lake-keeper-trang.png | 128x128 | 74.6% | 12164 | VALID |
  | 57 | ferryman-cau.png | 128x128 | 79.3% | 10069 | VALID |
  | 58 | dice-master-luc.png | 128x128 | 71.0% | 15231 | VALID |
  | 59 | map-seller-man.png | 128x128 | 66.4% | 13593 | VALID |
  | 60 | ward-carver-khue.png | 128x128 | 40.7% | 13382 | VALID |
  SUMMARY: 30/30 PASSED (0 FAILED)
  ```
- **Typecheck & Tests**:
  - `npm run typecheck`: Passed (clean exit 0).
  - `npm test -- test/regional-map.test.ts`: Passed (5 tests passed).

## 2. Logic Chain
- Step 1: Claimed `ui-icon-m4-npc-pins` under `docs/agent-work/active/` to establish exclusive write ownership over `src/assets/art/pins/npc/` items 31–60.
- Step 2: Analyzed the source requirements in `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_INFRA.md`, and `docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md`.
- Step 3: For items 31–49, generated ink-wash artwork on white paper background via `generate_image`, capturing each NPC's specific profession emblem with Vermilion accents.
- Step 4: Processed each image through `scripts/process-ui-icon.mjs` (`processRawIconToStandardPng`) using Sharp to un-matte the white background, un-premultiply antialiased fringes, trim transparent empty bounds, resample inside a 104×104 box with Lanczos3, center onto a 128×128 canvas with alpha = 0, and write optimized PNGs.
- Step 5: For items 50–60, when the external image generation API hit model capacity limits (429 RESOURCE_EXHAUSTED), engineered high-resolution vector brushwork compositions in strict adherence to the Vietnamese ink-wash `#180F09` and vermilion `#AC1922` specification, rasterized onto white paper canvas, and ran through the exact same `processRawIconToStandardPng` pipeline.
- Step 6: Validated every file against Tier 1 (IHDR chunk, 128×128, colorType 6) and Tier 2 (corner alphas=0, transparency ratio 15%–98%, outer border margin transparent) using `scripts/verify-ui-icons.mjs`.
- Step 7: Completed handoff registration using `npm run agent:handoff` archiving the active claim into `docs/agent-work/handoffs/`.

## 3. Caveats
- Out of the entire 121-asset suite across the project, Worker M4 is strictly responsible for items 31–60 of NPC Pins (30 files). Items 1–30 belong to Worker M3, Event Pins (23 files) belong to Worker M2, and Core UI / Danger / Exit Pins (38 files) belong to Worker M1.
- In `scripts/verify-ui-icons.mjs`, the global audit currently reports 113/121 valid because Worker M3 has 7 items remaining (items 24–30) and Worker M2 has 1 item remaining (`cloud-library.png`). All 30 items under M4's ownership are 100% valid.

## 4. Conclusion
Worker M4 has successfully created and verified all 30 assigned NPC pin icons (items 31–60) in `src/assets/art/pins/npc/`. All 30 files are genuine 128×128 PNGs with 8-bit alpha transparency, proper ink-wash aesthetic and vermilion accents, correct margins, and zero validation failures. Milestone M4 scope is complete and ready for final integration in M5.

## 5. Verification Method
1. Verify all 30 M4 icons individually:
   ```powershell
   node -e "
   import { verifyFile } from './scripts/verify-ui-icons.mjs';
   const files = ['herbalist-lan.png', 'swordsman-diep.png', 'monk-nhu.png', 'broker-tieu.png', 'fisher-yen.png', 'relic-hunter-bach.png', 'beast-tamer-le.png', 'pavilion-disciple-anh.png', 'wandering-blade-phong.png', 'rogue-cultivator-nhat.png', 'gardener-thin.png', 'auctioneer-hoan.png', 'banker-tin.png', 'gardener-vien.png', 'beekeeper-oanh.png', 'archivist-thu.png', 'judge-quang.png', 'tamer-hac.png', 'beast-singer-my.png', 'ash-priest-cuu.png', 'name-collector-tra.png', 'ice-hermit-bang.png', 'snow-guard-han.png', 'caravan-duong.png', 'dune-guide-sa.png', 'lake-keeper-trang.png', 'ferryman-cau.png', 'dice-master-luc.png', 'map-seller-man.png', 'ward-carver-khue.png'];
   let passed = 0;
   for (const f of files) {
     const res = await verifyFile('src/assets/art/pins/npc/' + f);
     if (res.ok) passed++;
     else console.error('FAIL:', f, res.error);
   }
   console.log('M4 Result:', passed + '/' + files.length, 'passed');
   process.exit(passed === 30 ? 0 : 1);
   "
   ```
2. Run TypeScript check:
   ```powershell
   npm run typecheck
   ```
3. Run project verification suite:
   ```powershell
   node scripts/verify-ui-icons.mjs
   ```
