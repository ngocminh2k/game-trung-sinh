# Handoff Report — Spec Miner 1 (UI Icon Shortfall Project)

**Date:** 2026-09-08  
**Agent:** `spec_miner_1`  
**Recipient:** Orchestrator (`parent`, id: `c32728b6-eadd-4f93-a876-f4f10e8ff39a`)  
**Type:** Hard Handoff (Task Complete)  

---

## 1. Observation

1. **Authoritative Specification Document:**
   - File: `docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md` (lines 1–173).
   - Line 4: *"Game đã có 243 ảnh (60 NPC portrait full-body, 16 location icon, 87 item, 11 player pose, audio). Nhưng UI map-pin / tab / HUD hiện đang dùng chữ Hán thay icon (`人` `門` `事` `凶` `氣` `囊` `市` `道` `契` `神` `心` `脈` `運`) — cần ảnh thật, mỗi thứ một icon unique."*
   - Line 8: *"Kích thước: 128×128 PNG, trong suốt nền (alpha), chủ thể canh giữa, chừa padding ~10%."*
   - Line 9: *"Style: mực tàu giấy bản (ink-wash) — nét đậm mảnh màu `oklch(18% 0.02 60)` (gần đen mực), điểm nhấn duy nhất 1 màu theo nhóm... Không gradient hiện đại, không 3D, không emoji."*
   - Lines 20–81: 60 NPC map pins table in `src/assets/art/pins/npc/`, accent son đỏ `oklch(48% 0.18 25)`.
   - Lines 88–101: 23 Event map pins table in `src/assets/art/pins/event/`, accent ngọc lam `oklch(56% 0.10 175)`.
   - Lines 108–114: 9 Danger map pins table in `src/assets/art/pins/danger/`, accent huyết đỏ `oklch(48% 0.18 25)`.
   - Lines 121: 16 Exit map pins list in `src/assets/art/pins/exit/`, accent hoàng kim `oklch(78% 0.13 85)`.
   - Lines 128–136: 6 LeftRail tabs table in `src/assets/art/tabs/`, ink base with active ngọc lam `oklch(56% 0.10 175)`.
   - Lines 142–148: 4 Tứ Tượng attrs table in `src/assets/art/attrs/`, accent hoàng kim `oklch(78% 0.13 85)`.
   - Lines 153–158: 3 HUD status bars table in `src/assets/art/hud/`.
   - Line 170: Total count: 60 + 23 + 9 + 16 + 6 + 4 + 3 = **121 files**.

2. **Project Requirement & Verification Specification:**
   - File: `.agents/ORIGINAL_REQUEST.md` (lines 30–35, 47).
   - Requirement R4: *"Xây dựng một kịch bản kiểm tra tự động (e.g. scripts/verify-ui-icons.mjs) quét toàn bộ 121 đường dẫn tệp để kiểm tra: 1. Tệp tồn tại đầy đủ. 2. Kích thước chính xác 128×128 pixel. 3. Có kênh alpha trong suốt (không bị nền trắng/nền đen đặc)."*
   - Acceptance Criteria line 47: *"Kịch bản kiểm tra tự động (node scripts/verify-ui-icons.mjs) chạy thành công, báo cáo 121/121 tệp đạt chuẩn kích thước 128×128 và có kênh alpha trong suốt."*

3. **Current Filesystem & Codebase Status:**
   - Inspection of `src/assets/art/` revealed existing folders: `items/`, `location-icons/`, `locations/`, `npcs/`, `player/`, `talents/`.
   - Directories `pins/` (with `npc/`, `event/`, `danger/`, `exit/`), `tabs/`, `attrs/`, and `hud/` do NOT exist yet.
   - `scripts/verify-ui-icons.mjs` does not exist yet.
   - `package.json` contains `"devDependencies": { "sharp": "^0.35.4" }`, which enables efficient automated image inspection for size, channels, and alpha pixel analysis.

---

## 2. Logic Chain

1. From Observation 1, the total count of missing icons is strictly bounded at 121 files across 7 distinct categories. Each category maps to an exact subfolder under `src/assets/art/`.
2. From Observation 1 & 2, all 121 icons share the identical graphical baseline:
   - Size: 128×128 px
   - Format: PNG with 8-bit Alpha Channel (`alpha = 0` for background)
   - Base Palette: Ink-wash `oklch(18% 0.02 60)`
   - Safe Margin: ~10% padding (subject centered within ~100–108px bounding area)
   - Prohibitions: No 3D, no modern gradients, no emojis, no artifact borders, no Chinese character text.
3. Category-specific accent colors are uniquely assigned:
   - NPC pins: Vermilion / Son đỏ `oklch(48% 0.18 25)`
   - Event pins: Turquoise / Jade / Ngọc lam `oklch(56% 0.10 175)`
   - Danger pins: Blood red / Huyết đỏ `oklch(48% 0.18 25)`
   - Exit pins: Muted Gold / Hoàng kim `oklch(78% 0.13 85)`
   - LeftRail tabs: Base ink, active Jade `oklch(56% 0.10 175)`
   - Tứ Tượng attrs: Muted Gold / Hoàng kim `oklch(78% 0.13 85)`
   - HUD bars: HP (vermilion), Qi (jade), Cultivation (gold)
4. From Observation 3, implementing agents will need to create the destination folders under `src/assets/art/` and generate the 121 files matching the exact kebab-case names tabulated in `report.md`.
5. From Observation 2 & 3, the automated verification script `scripts/verify-ui-icons.mjs` can leverage `sharp` to check existence of all 121 files, width/height == 128, and presence of transparent background pixels.

---

## 3. Caveats

- **No Code/Asset Modifications Made:** In accordance with Spec Miner instructions and read-only boundaries, no files in `src/` or `scripts/` were modified.
- **Visual Interpretation for AI Generation:** While the visual concept descriptions in the spec are concise (e.g. "cành mai hoa + gậy tre", "quạt xếp mở"), downstream image generation agents must carefully craft prompts that preserve the Vietnamese ink-wash aesthetic and enforce the single accent color rule while avoiding noisy backgrounds.

---

## 4. Conclusion

The specification mining for the UI Icon Shortfall project is fully complete. All 121 missing UI icons have been exhaustively indexed, tabulated with their filenames, target directories, characters/nodes, visual concepts, and accent colors. Technical graphic constraints and automated verification requirements have been fully documented in `.agents/spec_miner_1/report.md`.

---

## 5. Verification Method

To verify the extraction:
1. Inspect `.agents/spec_miner_1/report.md` and check:
   - Table 3.1: 60 NPC pin rows
   - Table 3.2: 23 Event pin rows
   - Table 3.3: 9 Danger pin rows
   - Table 3.4: 16 Exit pin rows
   - Table 3.5: 6 Tab rows
   - Table 3.6: 4 Attr rows
   - Table 3.7: 3 HUD bar rows
   - Total rows = 121 items.
2. Cross-reference with `docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md` lines 20–170 to verify 100% filename and concept fidelity.
