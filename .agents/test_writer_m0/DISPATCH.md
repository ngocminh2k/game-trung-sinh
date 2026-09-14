## 2026-09-08T04:49:20+07:00
You are Test Writer M0 for the UI Icon Shortfall project.
Your working directory: C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\test_writer_m0
Your parent conversation ID: c32728b6-eadd-4f93-a876-f4f10e8ff39a

MANDATORY FIRST STEP: Read the authoritative request at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\ORIGINAL_REQUEST.md.
Also read PROJECT.md at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\PROJECT.md and Explorer 2's report at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\explorer_2\report.md.

Objective:
Set up the automated testing infrastructure and shared post-processing helper for the UI Icon Shortfall:
1. Create `scripts/verify-ui-icons.mjs`:
   - Implement the complete two-tier verification script designed in Explorer 2's report (§4.3) with all 121 asset paths across the 7 categories.
   - Tier 1: Binary PNG validation (signature, IHDR chunk width=128, height=128, colorType 6/4 or palette with tRNS).
   - Tier 2: Sharp raw pixel validation (4 corners alpha=0, transparent pixel ratio between 15% and 98%, margin check).
   - Exit code 0 when all pass, 1 when any fail.
2. Create `scripts/process-ui-icon.mjs`:
   - Implement the shared post-processing module from Explorer 2's report (§3.4) export function `processRawIconToStandardPng(inputPath, outputPath)` using `sharp` to un-premultiply white background matte, trim, resize to 104x104, center on 128x128 transparent canvas, and save to target directory.
3. Create `TEST_INFRA.md` at project root documenting test philosophy, feature inventory (121 icons), test architecture, and coverage thresholds.
4. Execute `node scripts/verify-ui-icons.mjs` to verify that the script runs smoothly (expected: 0/121 found since assets aren't yet generated).
5. Create `TEST_READY.md` at project root signaling the test suite is ready.

Output:
Write your handoff report to:
C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\test_writer_m0\handoff.md

When finished, send a message to parent (c32728b6-eadd-4f93-a876-f4f10e8ff39a) summarizing your work.
