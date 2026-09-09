# Investigation Report: Codebase, Environment, & Operating Rules for UI Icon Shortfall

- **Agent**: Explorer 1 (`explorer_1`)
- **Date**: 2026-09-08
- **Workspace**: `C:\Users\minhd\orca\workspaces\game-trung-sinh\redesign-game-UI`
- **Specification Source**: `docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md`
- **Status**: Complete / Read-Only Investigation

---

## 1. Executive Summary

This investigation analyzed the repository architecture, agent operating rules, worktree state, package dependencies, image manipulation tools, and existing UI rendering mechanisms for the **UI Icon Shortfall project** (121 icons: 60 NPC map pins, 23 Event pins, 9 Danger pins, 16 Exit pins, 6 LeftRail tabs, 4 Tứ Tượng attributes, 3 HUD status bars).

### Key Takeaways:
1. **Sharp is already installed and fully operational** in `devDependencies` (`sharp@^0.35.4`, libvips 8.18.6, libpng 1.6.58, librsvg 2.62.91). Node.js v24.20.0 executes it natively. No extra npm or python packages are needed for image manipulation, format conversion, transparency verification, or alpha channel analysis.
2. **AI image generation tool (`generate_image`)** is directly available in the environment via the default toolset, supporting 1:1 square asset generation.
3. **Repository has a dirty worktree** with active and uncommitted work from previous UI overhaul rounds (notably `claude` on `LeftRailTabContent.tsx` and `ProtoShell.tsx`). Per `AGENTS.md`, agents must **never** reset, force-push, or overwrite dirty files outside assigned scopes.
4. **Current UI uses placeholder Chinese glyphs (Hanzi) and fallback text** (`人`, `門`, `事`, `凶`, `氣`, `囊`, `市`, `道`, `契`, `神`, `心`, `脈`, `運`) across `ProtoShell.tsx`, `LeftRailTabContent.tsx`, and `GameScreen.tsx`. Target icon folders (`pins/npc`, `pins/event`, `pins/danger`, `pins/exit`, `tabs`, `attrs`, `hud`) do not yet exist under `src/assets/art/` and must be created.
5. **Asset loading pattern in Vite**: `src/ui/rpgArt.ts` demonstrates Vite's `import.meta.glob('../assets/art/.../*.png', { eager: true, query: '?url' })` pattern, enabling zero-maintenance dynamic registration.

---

## 2. Repo Operating Rules & Lifecycle Contracts

### 2.1 AGENTS.md (Doliolid Agent Operating Contract)
- **Universal Contract**: Applies to all agents (Cline, OpenCode, Claude Code, Codex, and Antigravity).
- **Mandatory Starting Steps**:
  1. Read `docs/agent-os/KNOWLEDGE.md` and `docs/agent-os/WORKFLOW.md`.
  2. Run `npm run agent:check` and check `git status --short`.
  3. Inspect `docs/agent-work/active/` and the latest handoff in `docs/agent-work/handoffs/`.
  4. Claim a narrow scope before editing:
     ```powershell
     npm run agent:claim -- --id <kebab-id> --owner <agent> --objective "..." --scope "src/..."
     ```
- **Operating Rules**:
  - **Never discard, reformat wholesale, or overwrite unrelated dirty changes**. Never git reset or force clean.
  - Architecture boundaries:
    - `src/engine/`: Deterministic game logic and reducer.
    - `src/content/`: Declarative game data and validation.
    - `src/ui/`: Presentation, input handling, and UI derivations.
    - `src/ai/`: Optional narration / suggestion boundary (never the source of truth).
  - Verification: Run smallest relevant checks first; report exact commands and results.
  - Handoffs: Mandatory when ownership changes via `npm run agent:handoff`.

### 2.2 docs/agent-os/KNOWLEDGE.md & WORKFLOW.md
- **Knowledge Routing**:
  - Visual & tone constraints: `.impeccable.md` (Ink-and-jade style, keyboard-first, ink-wash aesthetic).
  - Required checks matrix:
    - TypeScript source: `npm run typecheck`
    - Any source change: `npm run lint` and relevant `npm test -- <file>`
    - Build/config: `npm run build`
    - Visual/layout/flow: Playwright tests (`npx playwright test ...`)

---

## 3. Worktree State & Active Claims Inspection

### 3.1 Agent Check Command
Command: `npm run agent:check`
```
> game-trung-sinh@0.1.0 agent:check
> node scripts/agent-os.mjs check

agent-os: OK - shared rules, MCP registry, and tool bridges are present.
```
Result: **PASSED** (Exit code 0).

### 3.2 Git Status (`git status --short`)
- Numerous modified (`M` / `MM`) and untracked (`??`) files exist across the workspace:
  - Modified: `src/App.tsx`, `src/index.css`, `src/ui/GameScreen.tsx`, `src/ui/MainMenu.tsx`, `src/ui/gameScreen/panels.tsx`, `src/ui/screens.css`, `src/engine/reducer.ts`, etc.
  - Untracked: `src/ui/LeftRailTabContent.tsx`, `src/ui/NpcChatModal.tsx`, `src/ui/ProtoShell.tsx`, `src/ui/left-rail.css`, `src/ui/proto-shell.css`, various screenshot suites (`screenshots/round-*`), and inspection scripts (`scripts/inspect-*`).
- **Rule Enforcement**: All newly created assets and verification scripts must be added without touching or reverting these dirty files.

### 3.3 Active Claims in `docs/agent-work/active/`
- Active Claim: `left-rail-items-system-chat.md`
  - Owner: `claude` (timestamp: `2026-09-07T19:40:47.153Z`)
  - Objective: Left rail item slots and System chat log
  - Scope: `src/ui/LeftRailTabContent.tsx`, `src/ui/ProtoShell.tsx`, `src/ui/left-rail.css`, `scripts/verify-leftrail.mjs`
- **Implication**: Downstream workers creating asset files in `src/assets/art/` and `scripts/verify-ui-icons.mjs` do NOT conflict with this claim. If UI components (`ProtoShell.tsx` or `LeftRailTabContent.tsx`) are updated to render the new icons, workers should coordinate or stage that separately from asset file generation.

---

## 4. Dependencies & Available Libraries

### 4.1 Node & npm Configuration (`package.json`)
- **Runtime**: Node.js `v24.20.0` (engines requirement: `>=18`).
- **Installed Image Processing**:
  - `sharp`: `^0.35.4` is in `devDependencies` and fully installed in `node_modules`.
  - Tested directly:
    - Libvips version: `8.18.6`
    - PNG backend: `1.6.58`
    - SVG backend: `rsvg 2.62.91`
    - JPEG / WebP / TIFF / HEIF / GIF supported.
  - Tested synthetic generation: A 128x128 4-channel transparent PNG created via `sharp({ create: { width: 128, height: 128, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })` outputs 65,536 raw RGBA bytes with `hasAlpha: true`.
- **Other libraries**:
  - `canvas`, `pngjs`, `jimp`: Not installed, but **not needed** because `sharp` handles all required operations faster and natively with C bindings.

### 4.2 Existing Scripts in `scripts/`
- `scripts/convert-fake-png.mjs`: Past utility that used `sharp` to detect JPEGs masquerading as `.png` (`ffd8ff` signature) and re-encoded them to authentic PNGs.
- `scripts/convert-loop.mjs`: Polling loop that re-ran `convert-fake-png.mjs`.

---

## 5. Existing Assets & UI Icon Rendering Analysis

### 5.1 Asset Hierarchy (`src/assets/art/`)
Existing directories:
- `src/assets/art/items/`: 87 item icons (1024x1024 PNG, RGB 3-channel, no alpha).
- `src/assets/art/location-icons/`: 16 location icons (1024x1024 PNG, RGB 3-channel, no alpha).
- `src/assets/art/locations/`: 16 location illustration backdrops.
- `src/assets/art/npcs/`: 60 full-body character portraits.
- `src/assets/art/player/`: 11 player action poses.
- `src/assets/art/talents/`: Talent & technique illustrations.

**Missing Target Folders (Must be created)**:
- `src/assets/art/pins/npc/` (60 files: `elder-meihua.png`, `storyteller-ngo.png`, etc.)
- `src/assets/art/pins/event/` (23 files: `bamboo-rampart.png`, `village-well.png`, etc.)
- `src/assets/art/pins/danger/` (9 files: `bee-nest.png`, `wolf-tracks.png`, etc.)
- `src/assets/art/pins/exit/` (16 files: `village.png`, `market.png`, etc.)
- `src/assets/art/tabs/` (6 files: `people.png`, `vital.png`, `items.png`, `market.png`, `path.png`, `system.png`)
- `src/assets/art/attrs/` (4 files: `charm.png`, `mind.png`, `body.png`, `luck.png`)
- `src/assets/art/hud/` (3 files: `hp.png`, `qi.png`, `cultivation.png`)
**Total = 121 files.**

### 5.2 UI Icon Rendering in Source Code
1. **Map Pins (`src/ui/ProtoShell.tsx` lines 314–405)**:
   - Danger pins render Hanzi glyph: `'凶'` (`line 335`).
   - Event pins render Hanzi glyph: `'事'` (`line 335`).
   - Exit pins render Hanzi glyph: `'門'` (`line 335`).
   - NPC pins render Hanzi glyph: `'人'` (`line 394`).
   - In `GameScreen.tsx` (lines 687-705), exit pins optionally load `locationIconFor(cell.exitTo)` (full-size 1024px art).
2. **LeftRail Tabs (`src/ui/LeftRailTabContent.tsx` lines 446–453, `ProtoShell.tsx` lines 266–276)**:
   - `LEFT_TAB_LABELS` maps tabs to glyphs:
     - `people`: `'人'`
     - `vital`: `'氣'`
     - `items`: `'囊'`
     - `market`: `'市'`
     - `path`: `'道'`
     - `system`: `'契'`
   - Rendered as `<span className="glyph">{meta.glyph}</span>`.
3. **Tứ Tượng Attributes (`src/ui/ProtoShell.tsx` lines 35–40, 474–485)**:
   - `TG_STATS`: `charm` ('神'), `mind` ('心'), `body` ('脈'), `luck` ('運').
   - Rendered as `<div className="k">{t.seal}</div>`.
4. **HUD Bars (`src/ui/ProtoShell.tsx` lines 458–472)**:
   - HP bar (`.proto-bar.hp`), QI bar (`.proto-bar.qi`), Cultivation bar (`.proto-bar.cultivation`).
   - Currently rendered with text labels only (`<span className="lbl">{vi ? 'KHÍ HUYẾT' : 'HP'}</span>`), with no icon graphics.

### 5.3 Vite Asset Import Strategy
`src/ui/rpgArt.ts` uses:
```typescript
const itemModules = import.meta.glob('../assets/art/items/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
```
When new art files are added to matching folders, Vite automatically hashes and imports them during build without manual import statements. Creating similar modules (e.g. `src/ui/pinArt.ts` or `src/ui/tabArt.ts`) will cleanly integrate all 121 icons.

---

## 6. Image Manipulation Tools & Environment Capabilities

### 6.1 Tool Assessment Matrix
| Tool | Availability | Capabilities | Role in Project |
|---|---|---|---|
| **Sharp (Node.js)** | ✅ Installed (`^0.35.4`) | Resize, alpha channel creation, composite, pixel inspection, raw buffer extraction, SVG rasterization | **Primary post-processing & verification engine** |
| **`generate_image` (API)** | ✅ Available | Text-to-image AI generator, 1:1 aspect ratio | **Primary generation engine** for AI icons |
| **Python** | ✅ Python 3.14.7 | Standard library only (no PIL/Pillow installed) | Secondary / fallback scripts only (avoid) |
| **Node.js** | ✅ v24.20.0 | ESM support, child_process, fs/promises, sharp | **Script execution environment** |
| **PowerShell** | ✅ Windows PowerShell | File system operations, running npm scripts | Tool runner |

### 6.2 Recommended Verification Script Structure (`scripts/verify-ui-icons.mjs`)
Using `sharp`:
1. Read file buffer.
2. Read metadata (`meta.width === 128`, `meta.height === 128`, `meta.hasAlpha === true`, `meta.channels === 4`).
3. Extract raw RGBA bytes (`sharp(buf).raw().toBuffer()`).
4. Validate that transparency exists:
   - Check outer border/padding pixels (e.g. pixels where x < 8 or x > 120, y < 8 or y > 120) have `alpha === 0`.
   - Check that the image is not 100% transparent (it has visible non-zero alpha ink strokes).
5. Output detailed JSON / tabular report listing all 121 icons with status `PASS` / `FAIL`.

---

## 7. Recommendations for Implementation & Verification Phases

1. **Asset Creation Scope**:
   - Create directories:
     - `src/assets/art/pins/npc/` (60 files)
     - `src/assets/art/pins/event/` (23 files)
     - `src/assets/art/pins/danger/` (9 files)
     - `src/assets/art/pins/exit/` (16 files)
     - `src/assets/art/tabs/` (6 files)
     - `src/assets/art/attrs/` (4 files)
     - `src/assets/art/hud/` (3 files)
2. **Post-Processing & Alpha Channel Isolation**:
   - If AI generation yields an icon with a solid white or black background, a Node.js + Sharp processing script can isolate the ink strokes, remove background pixels (color-keying background to alpha=0), apply the specified group color accent (e.g. oklch son đỏ for NPC, ngọc lam for Event, huyết đỏ for Danger, hoàng kim for Exit/Attrs), resize to exactly 128x128 with ~10% padding, and save as 4-channel PNG.
3. **Verification Pipeline**:
   - Provide `scripts/verify-ui-icons.mjs` early in the process so workers can run incremental checks against the 121 target checklist.
4. **Coordination & Safety**:
   - Respect active claims (Claude's claim on LeftRail). Do not edit `ProtoShell.tsx` or `LeftRailTabContent.tsx` concurrently without explicit coordination.
   - Do not commit or revert dirty git files.
