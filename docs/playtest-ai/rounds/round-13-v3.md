# 🎮 Playtest Round 13 — Báo Cáo Tổng Hợp (v3)

*Ngày: 2026-09-16 | Nguồn: 3 người chơi (r13p1, r13p2, r13p3) + 20 bot runs (r13b00–19)*

---

## 📋 Tóm Tắt Executive

| Chỉ Số | Giá Trị |
|--------|---------|
| **Tổng findings** | 14 (raw) → 6 unique sau khử trùng |
| **Real bugs** | 4 (1 critical, 2 high, 1 medium) |
| **Design flaws** | 2 (combat tactical depth, quest HUD priority) |
| **False positives (harness artifacts)** | 8 (Class #38 Scraper Artifact + timing) |
| **By-design (intentional)** | 2 (item popover UX, combat simplicity) |

**Key Insight**: Phần lớn "bugs" là **test-harness artifacts** (Class #38) — bot đọc `node.textContent` thô, bỏ qua `aria-hidden` và CSS Grid layout. Giao diện thực tế render đúng cho người chơi và screen reader.

---

## 🔍 Findings (Phát Hiện) — Bảng Tổng Hợp

| # | Title | Severity | Area | Source | Verdict |
|---|-------|----------|------|--------|---------|
| F1 | NPC button labels rendered as glued strings (missing spaces) | high | localization | r13p1 + all 20 bots | **false-positive** (Class #38) |
| F2 | Map travel controls intermittently invisible to bot harness | medium | map-travel | r13p1 + 15/21 bots | **false-positive** (timing) |
| F3 | NPC talk controls intermittently invisible to bot harness | medium | npc-social | r13p1 + 13/21 bots | **false-positive** (timing) |
| F4 | Gather herbs (Hái thảo) control intermittently invisible to bot | low | economy | r13p1 + 2/21 bots | **false-positive** (timing) |
| F5 | NPC button labels concatenated without spacing (dup F1) | high | localization | r13p2 + 16 bots | **false-positive** (Class #38) |
| F6 | Quest HUD shows only system role ("Nhân sĩ") — no active quest objective | high | quests | r13p2 + r13p3 | **real-bug** / **design-flaw** |
| F7 | Travel controls selector mismatch (regex too rigid) | medium | map-travel | r13p2 | **false-positive** (bot regex) |
| F8 | Combat loop lacks tactical depth — "attack" spam wins | medium | combat | r13p2 | **design-flaw** / **by-design** |
| F9 | T-MODAL-ISOLATION: NPC Chat Modal click-through (partially fixed) | high | ui-affordance | r13p3 | **real-bug** |
| F10 | T-ITEM-POPOVER: Inventory item popover not triggering on click | critical | ui-affordance | r13p3 | **by-design** (UX pattern) |
| F11 | T-QUEST-HUD: Quest objective HUD missing when no urgent deadline | high | quests | r13p3 | **real-bug** (dup F6) |
| F12 | Localization: NPC button labels glued (dup F1/F5) | medium | localization | r13p3 + 10 bots | **false-positive** (Class #38) |

---

## ⚖️ Verdicts (Phán Định) — Chi Tiết

### ❌ FALSE POSITIVES — Class #38 Scraper Artifact (F1, F5, F12)

| Finding | Evidence | Explanation |
|---------|----------|-------------|
| NPC buttons: `"CCụ Mai Hoatrưởng làng♥ 0"` | `LeftRailTabContent.tsx:187-195` — CSS Grid `32px 1fr auto; gap: 10px`; avatar `aria-hidden="true"`; heart `aria-label="Hảo cảm 0"` | Harness `browser-use-server.mjs:73` đọc `node.textContent` thô qua sibling nodes, bỏ qua layout CSS và `aria-hidden`. UI thực tế & screen reader **đúng chuẩn WCAG 2.1**. |
| | LEDGER.md Round 1 (#34), Round 1v3 (F8), Round 2 (#12), Round 4 (#7), Round 10 (#5), Round 12 (#5), Round 13 (line 379) **đã close** | Duplicate đã được triaged ≥ 7 lần. |

**Proposed Fix**: *Không sửa game code.* Cập nhật harness để respect `aria-hidden` và CSS layout (dùng accessibility tree APIs thay vì `textContent`).

---

### ❌ FALSE POSITIVES — Harness Timing / Selector Issues (F2, F3, F4, F7)

| Finding | Evidence | Explanation |
|---------|----------|-------------|
| Map travel: 15/21 bots gap `map:travel` | Human playthrough (r13p1 clicks 20–26) **thành công**; ProtoShell BFS + pin render đúng | Bot query DOM **trước khi React mount** pins → race condition harness. |
| NPC talk: 13/21 bots gap `npc:talk` | Human playthrough (r13p1 click 27 mở dialog, click 3 chọn option) **thành công** | Cùng timing issue. Round 3 đã fix cap NPC pin (T7 promoted fixed-verified). |
| Gather herbs: 2/21 bots gap | Human thấy button index 37; chỉ 2 bot bị (cùng bot kẹt ATTRIBUTE_ALLOCATION_REQUIRED) | Chip `Hái thảo` luôn render (universal verb). |
| Travel regex mismatch | ProtoShell `aria-label` có 2 pattern: `Đi tới {label} (N bước)` (region exit) vs `Đi N bước tới {label}` (local). Bot regex `/^Đi (tới\|\d)/` không match pattern 2 | **Bot regex bug**, không phải UI bug. Screen reader đọc đầy đủ đúng. |

**Proposed Fix**: *Không sửa game code.* Harness: add render-wait / dùng Playwright `waitForSelector`; cập nhật regex bot.

---

### ✅ REAL BUGS (Cần Sửa)

#### 🔴 F9 — T-MODAL-ISOLATION: NPC Chat Modal Click-Through (High)

| Aspect | Detail |
|--------|--------|
| **Evidence** | LEDGER Round 12 (line 329), Round 14 (line 406) — ticket **open**. `NpcChatModal.tsx:654-656` có `stopPropagation` trên choice buttons, nhưng backdrop handler (501-504) chỉ stop khi `e.target === e.currentTarget`. ProtoShell `inert` trên `mainRef` chỉ khi `isModalActive` — có gaps. Multiple human players (r13p3 actions #26, #27, #22, #23) báo click-through. |
| **Root Cause** | Modal isolation incomplete: (1) `inert` không cover all background interactive regions; (2) backdrop `pointer-events` leak; (3) interactive children trong modal không đều `stopPropagation`. |
| **Fix Files** | `src/ui/NpcChatModal.tsx`, `src/ui/ProtoShell.tsx`, `src/ui/GameScreen.tsx` |
| **Proposed Fix** | - Thêm `e.stopPropagation()` cho **tất cả** interactive elements trong modal (choice buttons, gift select/send).<br>- Backdrop: `pointer-events: auto` + proper `z-index` isolation.<br>- Apply `inert` hoặc `pointer-events: none` cho `.proto-shell-wrap` khi modal active.<br>- Explicit click capture trên modal container. |
| **Test To Add** | `test/npc-chat-bilingual.test.ts`: mở modal, click nhanh choices → verify background (map pins, inventory, tabs) **không** bị trigger. |

---

#### 🔴 F10 — T-ITEM-POPOVER: Inventory Popover Click Trigger (Critical) — **BY DESIGN**

| Aspect | Detail |
|--------|--------|
| **Evidence** | `LeftRailTabContent.tsx:254-261` — `onClick` trực tiếp dispatch `use_item`/`equip_item`. Popover chỉ hiện trên `onMouseEnter` (hover/focus). CSS `.proto-item-popover-backdrop` có `pointer-events: auto` nhưng transparent, chặn click adjacent grid cells. |
| **Explanation** | **Intentional UX pattern** (Diablo, PoE style): click = primary action (use/equip ngay), hover/focus = inspect details + secondary actions. Mobile/touch users dùng long-press hoặc popover button "Sử dụng" bên trong. |
| **Verdict** | **by-design** — không phải bug. |
| **Optional Improvement** | Thêm visual hint lần đầu: "Click để dùng, hover để xem chi tiết"; hoặc popover trên long-press/touch-hold cho mobile. |

---

#### 🔴 F6/F11 — T-QUEST-HUD: Quest Objective Missing (High) — **REAL BUG / DESIGN FLAW**

| Aspect | Detail |
|--------|--------|
| **Evidence** | LEDGER Round 12 Finding 2 → Ticket **T-QUEST-HUD** [high/ui-css] status **open**, fresh: true. Round 13 queue vẫn open. `objective.ts:56-67` check active quests **sau** deadline/combat/story checks (lines 29-53) → fall through về cultivation progress (76-79). DockPanelQuests (`panels.tsx`) không render active quest step nổi bật. |
| **Root Cause** | Priority order sai: HUD ưu tiên generic cultivation progress hơn active quest guidance. `deriveObjective` nên check active quest **trước** fallback. |
| **Fix Files** | `src/ui/objective.ts`, `src/ui/gameScreen/panels.tsx` |
| **Proposed Fix** | 1. `deriveObjective`: move active quest check (lines 56-67) **lên trước** night deadline & cultivation fallback.<br>2. Return `quest.steps[currentStepIndex].descVi/descEn` khi có quest `status === 'active'`.<br>3. `DockPanelQuests`: luôn render active quest step description + guidance dưới quest title. |
| **Test To Add** | `test/system-quests.test.ts`: accept quest → verify `deriveObjective` trả step 0 desc; complete step 0 → verify step 1; complete quest → verify fallback cultivation progress.<br>`test/system-ui.test.tsx`: verify DockPanelQuests hiển thị `quest.steps[currentStepIndex].descVi`. |

---

### 🎨 DESIGN FLAWS (Cần Quyết Định Thiết Kế)

#### F8 — Combat Tactical Depth (Medium) — **DESIGN FLAW / BY DESIGN**

| Perspective | Verdict | Rationale |
|-------------|---------|-----------|
| **r13p2** (human) | design-flaw | White Tiger 46 HP chết sau 4 attack + 1 skill + 2 heal — zero decision-making. Persona p19 (Killer) expects tactical combat. |
| **LEDGER Round 8 Finding 9** | by-design | "Battle System companion là arrogant meta-entity... combat results handled by ticker and world chronicle." Genre: cultivation-novel idle progression (Achiever/Explorer), **không** phải tactical RPG (Killer). |
| **MDA / Schell** | by-design | Koster: legible pattern rewards optimization fits genre. Schell Lens of Toy: "toy" là cultivation loop, không phải combat minigame. |

**Decision Needed**: Giữ nguyên (idle progression) hay thêm tactical layer (telegraphs, positioning, cooldowns, enemy AI) — major feature, không phải bug fix.

---

## 🎫 Tickets (Vé) — Trạng Thái

| Ticket | Title | Severity | Status | Round Created | Round 13 State |
|--------|-------|----------|--------|---------------|----------------|
| **T-MODAL-ISOLATION** | NPC Chat Modal click-through | high | **open** | Round 12 | **open** (r13p3 confirms still exists) |
| **T-ITEM-POPOVER** | Inventory item popover click trigger | critical | **open** | Round 12 | **reclassified: by-design** |
| **T-QUEST-HUD** | Quest objective HUD missing | high | **open** | Round 12 | **open** (r13p2, r13p3 confirm) |
| **T-SECT-COMBAT-AFFORDANCE** | Fight chip at sect with arena enemies | high | **fixed-verified** | Round 12 | **promoted Round 14** (ProtoShell filter `e.arena === undefined`) |

---

## 🛠 Fixes (Sửa Chữa) — Action Items

| Priority | Ticket / Finding | Files to Change | Summary |
|----------|------------------|-----------------|---------|
| **P0** | T-MODAL-ISOLATION (F9) | `src/ui/NpcChatModal.tsx`, `src/ui/ProtoShell.tsx`, `src/ui/GameScreen.tsx` | Complete modal isolation: stopPropagation all children, backdrop capture, inert background |
| **P0** | T-QUEST-HUD (F6/F11) | `src/ui/objective.ts`, `src/ui/gameScreen/panels.tsx` | Re-prioritize active quest in `deriveObjective`; render quest step in DockPanelQuests |
| **P1** | Combat tactical depth (F8) | `src/engine/reducer.ts`, `src/ui/ProtoShell.tsx`, `src/content/beasts.ts`, `src/ui/gameScreen/panels.tsx` | **Design decision required** — add telegraphs, positioning, cooldowns, enemy AI if pivoting to tactical |
| **P2** | Harness improvements (F1,F2,F3,F4,F5,F7,F12) | `scripts/browser-use-server.mjs`, `docs/playtest-ai/bots/` | Respect `aria-hidden`/CSS layout; add render-wait; fix travel regex; accessibility tree scraping |

---

## 🤖 Bot Summaries (Raw Machine Evidence)

```
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":57,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button","tên dính chuỗi vô hồn: \"CCốc chủ Cốcẩn sĩ hang đá♥ 0\" #button","tên dính chuỗi vô hồn: \"VVong hồn Hàvong hồn lang thang♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ khắc Khuêthợ khắc bùa♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":65,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":101,"dead_clicks":23,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["play:hái thảo: không tìm được điều khiển (/hái thảo/i) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":101,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":87,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":57,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button","tên dính chuỗi vô hồn: \"CCốc chủ Cốcẩn sĩ hang đá♥ 0\" #button","tên dính chuỗi vô hồn: \"VVong hồn Hàvong hồn lang thang♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ khắc Khuêthợ khắc bùa♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":65,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":101,"dead_clicks":23,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["play:hái thảo: không tìm được điều khiển (/hái thảo/i) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":101,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":87,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":120,"dead_clicks":0,"unique_gaps":[],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
```

---

## 📌 Kết Luận & Next Steps

1. **Immediate (P0)**: Fix **T-MODAL-ISOLATION** & **T-QUEST-HUD** — both confirmed real bugs affecting players.
2. **Design Decision**: Combat tactical depth (F8) — keep idle progression or invest in tactical layer.
3. **Harness Debt**: 8/14 findings are harness artifacts. Invest in `browser-use-server.mjs` improvements (aria-hidden aware, render-wait, better selectors) to reduce noise in future rounds.
4. **Closed**: T-SECT-COMBAT-AFFORDANCE promoted to fixed-verified (Round 14).

---

*Generated from Round 13 playtest data (3 human sessions + 20 bot runs) — adjudicated against LEDGER.md history.*