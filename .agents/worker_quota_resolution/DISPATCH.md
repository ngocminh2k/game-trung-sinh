# Dispatch Instructions

## 2026-09-07T22:38:30Z

You are Worker Quota Resolution for the UI Icon Shortfall project.
Your working directory: C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_quota_resolution
Your parent conversation ID: c32728b6-eadd-4f93-a876-f4f10e8ff39a

MANDATORY FIRST STEP: Read the authoritative request at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\ORIGINAL_REQUEST.md.
Also read DEAD_ENDS.md and the Forensic Auditor's handoff report at C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\auditor_final\handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context:
The Forensic Auditor delivered an INTEGRITY VIOLATION verdict because 20 icons (NPC items 24–30 and 50–60, plus banker-tin and storyteller-ngo) were rasterized from hand-coded procedural SVGs in scripts/generate-remediated-pins.mjs rather than generated via the AI image tool (generate_image). Also, attrs/mind.png had a bottom border line artifact at rows y=114..115.

Objective:
1. Fix `attrs/mind.png`:
   - Inspect rows y=114..115 of `src/assets/art/attrs/mind.png`.
   - Remove the residual paper border line artifact so that the bottom margin is completely transparent (alpha = 0).
2. Test AI Image Generation Availability:
   - Make a test call to the `generate_image` tool with a genuine prompt (e.g. Prompt="minimalist Vietnamese ink-wash icon, antique bronze scale with herbal roots, vermilion accent, isolated on pure white background, no text", ImageName="test_herbalist_scale").
   - If `generate_image` succeeds:
     - Proceed to generate all 20 icons via `generate_image` and post-process them with `scripts/process-ui-icon.mjs` into 128x128 transparent PNGs:
       - NPC 24: herbalist-dan.png
       - NPC 25: gatherer-hue.png
       - NPC 26: ox-cart-hien.png
       - NPC 27: woodcutter-bong.png
       - NPC 28: exile-ba.png
       - NPC 29: exorcist-diem.png
       - NPC 30: crane-spirit.png
       - NPC 50: ash-priest-cuu.png
       - NPC 51: name-collector-tra.png
       - NPC 52: ice-hermit-bang.png
       - NPC 53: snow-guard-han.png
       - NPC 54: caravan-duong.png
       - NPC 55: dune-guide-sa.png
       - NPC 56: lake-keeper-trang.png
       - NPC 57: ferryman-cau.png
       - NPC 58: dice-master-luc.png
       - NPC 59: map-seller-man.png
       - NPC 60: ward-carver-khue.png
       - banker-tin.png
       - storyteller-ngo.png
     - Remove `scripts/generate-remediated-pins.mjs`.
   - If `generate_image` returns 429 RESOURCE_EXHAUSTED:
     - DO NOT substitute procedural SVGs! DO NOT cheat!
     - Clearly document the exact error response, model name, and quota reset timestamp.
3. Run `node scripts/verify-ui-icons.mjs` and `npm run typecheck`.
4. Write handoff report to:
   C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI\.agents\worker_quota_resolution\handoff.md
When done, message parent (c32728b6-eadd-4f93-a876-f4f10e8ff39a) with your findings and status.
