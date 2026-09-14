## 2026-09-07T22:23:46Z
You are the Remediation Worker for the UI Icon Shortfall project.
Your working directory: C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_remediation
Your parent conversation ID: c32728b6-eadd-4f93-a876-f4f10e8ff39a

MANDATORY FIRST STEP: Read the authoritative request at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\ORIGINAL_REQUEST.md.
Also read DEAD_ENDS.md at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\DEAD_ENDS.md and Reviewer 2's FULL audit evidence report at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\reviewer_2\handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context:
Reviewer 2 issued a REQUEST_CHANGES verdict with Critical Integrity Violations and defects:
1. Procedural SVG substitution: 18 NPC icons (items 24–30 and 50–60) bypassed AI image generation (`generate_image`), producing flat clip-art, cartoon Minion goggles (`dune-guide-sa.png`), sci-fi robot crystals (`ice-hermit-bang.png`), and wrong concepts (`caravan-duong.png`, `name-collector-tra.png`).
2. Fake Photoshop transparency checkerboards & stock watermarks baked into `azure-pavilion.png`, `spirit-beast-ridge.png`, `moon-lake.png`, `bone-ash-ruins.png`.
3. Unremoved opaque/semi-opaque paper background rectangles in at least 10 icons (`tabs/market.png`, `tabs/items.png`, `attrs/mind.png`, `pins/danger/bee-nest.png`, `pins/danger/claw-rock.png`, `pins/exit/herb-field.png`, `pins/exit/cloud-peak.png`, `pins/exit/sealed-cave.png`, `pins/npc/senior-lan.png`, `pins/event/dry-oasis.png`).
4. Prohibited Chinese characters in `banker-tin.png` ("大越國銀行") and `storyteller-ngo.png`.
5. Test blindspot: `scripts/verify-ui-icons.mjs` only checked the 1px perimeter and 4 corners, allowing solid 104x104 paper boxes to pass due to the 12px padding.

Remediation Tasks:
1. Harden `scripts/verify-ui-icons.mjs`:
   - Audit inner background outside the subject: check inner corner regions (e.g. $(x \in [14..22], y \in [14..22])$) to verify background pixels have alpha <= 10.
   - Detect and reject fake checkerboard grids (alternating grey square blocks R≈G≈B≈190-215 with alpha > 30).
   - Reject any asset where the 104x104 subject envelope has opaque paper background borders.
2. Improve `scripts/process-ui-icon.mjs`:
   - Enhance background removal to completely strip paper background textures (use flood-fill from corners or adaptive luminance/chroma matting on paper backgrounds) so zero opaque paper squares or halos remain.
3. Regenerate all 18 procedural SVG icons using `generate_image` on pure white backgrounds (`#FFFFFF`) with proper ink-wash prompts and category accents (Vermilion #AC1922):
   - Items 24–30: `herbalist-dan.png`, `gatherer-hue.png`, `ox-cart-hien.png`, `woodcutter-bong.png`, `exile-ba.png`, `exorcist-diem.png`, `crane-spirit.png`.
   - Items 50–60: `ash-priest-cuu.png`, `name-collector-tra.png` ("bài vị không chữ"), `ice-hermit-bang.png` ("băng tinh + râu đóng băng", NO sci-fi crystals), `snow-guard-han.png`, `caravan-duong.png` ("cờ đoàn xe", caravan banner/flag, NO vector gourd/bell), `dune-guide-sa.png` (ink compass + desert sand, NO cartoon Minion goggles), `lake-keeper-trang.png`, `ferryman-cau.png`, `dice-master-luc.png`, `map-seller-man.png`, `ward-carver-khue.png`.
4. Fix Chinese characters:
   - Regenerate `banker-tin.png` without Chinese text (use antique Vietnamese coins / gold ingots / scale motif).
   - Regenerate/clean `storyteller-ngo.png` without Chinese calligraphy on the fan.
5. Fix fake checkerboards & stock watermarks:
   - Regenerate on pure white backgrounds and process: `pins/exit/azure-pavilion.png`, `pins/exit/spirit-beast-ridge.png`, `pins/exit/moon-lake.png`, `pins/exit/bone-ash-ruins.png`.
6. Fix unremoved paper rectangles:
   - Re-process or regenerate on pure white: `tabs/market.png`, `tabs/items.png`, `attrs/mind.png`, `pins/danger/bee-nest.png`, `pins/danger/claw-rock.png`, `pins/exit/herb-field.png`, `pins/exit/cloud-peak.png`, `pins/exit/sealed-cave.png`, `pins/npc/senior-lan.png`, `pins/event/dry-oasis.png`.
7. Verify all 121 icons pass the hardened `scripts/verify-ui-icons.mjs` (121/121 PASS).
8. Run `npm run typecheck` to confirm clean compilation.

Output:
Write your complete handoff report to:
C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_remediation\handoff.md
When done, message parent (c32728b6-eadd-4f93-a876-f4f10e8ff39a) summarizing your fixes.
