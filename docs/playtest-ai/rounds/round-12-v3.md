# Vòng 12 - Báo Cáo Playtest AI (Version 3)

## Tổng Quan

| Chỉ Số | Giá Trị |
|--------|---------|
| **Vòng** | 12 |
| **Số Findings** | 13 |
| **Số Verdicts** | 3 nhóm (13 verdict items) |
| **Ngày** | 2026-09-16 |

---

## Bảng Findings

| # | Mức Độ | Vùng | Tiêu Đề | Nguồn |
|---|--------|------|---------|-------|
| 1 | High | ui-affordance | Click-through xuyên thấu hộp thoại NPC và nhật ký gây nhảy tab và dùng vật phẩm oan | r12p1 |
| 2 | High | quests | Mục tiêu nhiệm vụ biến mất khỏi HUD và không có nội dung hướng dẫn trong sổ tay | r12p1 |
| 3 | Medium | npc-social | Thoại NPC dùng chung mẫu rập khuôn và thiếu chiều sâu cốt truyện | r12p1 |
| 4 | Medium | cultivation | Mất dấu vết điều hướng gây vòng lặp tu luyện và dead-click nút Tu luyện | r12p1 |
| 5 | Critical | ui-affordance | Popover vật phẩm chặn sự kiện chuột lên toàn bộ ô lưới hành trang | r12p2 |
| 6 | High | cultivation | Nút Tu luyện nuốt click vô hiệu khi cạn chân khí mà không có phản hồi | r12p2 |
| 7 | Medium | map-travel | Mất sạch kết nối di chuyển khi vào hang khiến nhân vật bị kẹt cứng | r12p2 |
| 8 | Low | onboarding | Bấm nút Kiếp mới ở menu chính chỉ nhận focus chứ không vào game ngay | r12p2 |
| 9 | High | npc-social | Gift selection in NPC dialogue modal is unresponsive | r12p3 |
| 10 | High | ui-affordance | Index shift and accidental double-action on dynamic UI re-render | r12p3 |
| 11 | Medium | cultivation | Cultivation button dead clicks without feedback when Qi is insufficient | r12p3 |
| 12 | Medium | map-travel | Mất sạch kết nối di chuyển khi vào hang (duplicate từ r12p2) | r12p2 |
| 13 | Low | onboarding | Bấm nút Kiếp mới (duplicate từ r12p2) | r12p2 |

---

## Bảng Verdicts

### Nhóm 1: Verdicts từ Phiên r12p1

| Finding | Verdict | Giải Thích Tóm Tắt | File Sửa | Test Cần Thêm |
|---------|---------|-------------------|----------|---------------|
| 1. Click-through NPC/Journal | **false-positive** | Harness selector index artifact, không phải click-through vật lý. ProtoShell dùng `inert` khi chat mở, CSS z-index 60 backdrop chặn con trỏ. Bot gửi click theo index cũ sau khi DOM tái tạo. | - | `test/ui-modal-inert.test.tsx` |
| 2. Mục tiêu nhiệm vụ mất HUD | **design-flaw** | `deriveObjective()` không kiểm tra `game.quests`. HUD objective gắn trong `{storyOpen && ...}` bị unmount khi đóng story. Journal không render step description. | `src/ui/objective.ts`, `src/ui/ProtoShell.tsx`, `src/ui/gameScreen/panels.tsx` | `test/quest-hud-persistence.test.tsx` |
| 3. Thoại NPC mẫu chung | **by-design** | Thiết kế có ý: `GENERIC_CONVERSATIONS` dùng FNV-1a hash `${npcId}:${locationId}` phân bổ 6 bộ hội thoại khác nhau. Minor NPC dùng ambient chatter để tăng Affinity, deep branching dành cho companion chính. | - | - |
| 4. Vòng lặp tu luyện/dead-click | **false-positive** | Duplicate của issue #34 (F7 LEDGER). Bot r12b03: 0 dead clicks. Bot r12b06: 23 dead clicks do Qi=40 đạt breakthrough, `pendingAttributePoints>0` kích hoạt `ATTRIBUTE_ALLOCATION_REQUIRED` gate. Bot thiếu logic cộng điểm. | - | - |

### Nhóm 2: Verdicts từ Phiên r12p2

| Finding | Verdict | Giải Thích Tóm Tắt | File Sửa | Test Cần Thêm |
|---------|---------|-------------------|----------|---------------|
| 5. Popover chặn chuột inventory | **real-bug** | `.proto-item-popover` có `position: fixed`, `z-index: 1000`, `pointer-events: auto` che phủ ô lưới lân cận. Không có backdrop dismiss. | `src/ui/left-rail.css`, `src/ui/LeftRailTabContent.tsx` | `test/inventory-popover-hit-test.test.tsx` |
| 6. Nút Tu luyện nuốt click | **duplicate-of-ledger** | Duplicate #34/F7. Telemetry: Qi=40 (đầy), HP=87. Nguyên nhân: breakthrough gate `ATTRIBUTE_ALLOCATION_REQUIRED`. UI đã disable nút khi `pendingAttributePoints>0`. | - | - |
| 7. Mất kết nối di chuyển hang | **duplicate-of-ledger** | Duplicate #34/F7. Khi Qi=40 breakthrough, `pendingAttributePoints=2` → `canWalk=false` (ProtoShell:289) → paths Map rỗng → fallback label. Đồ thị bản đồ vẫn intact. | - | - |
| 8. Nút Kiếp mới chỉ focus | **false-positive** | Hiểu nhầm: MainMenu tự focus nút đầu tiên cho accessibility (WCAG). Click chuột luôn chuyển cảnh ngay (E2E tests + bot logs confirm `changed: true`). Digest harness ghi `<con trỏ>` tạo ảo觉. | - | - |

### Nhóm 3: Verdicts từ Phiên r12p3

| Finding | Verdict | Giải Thích Tóm Tắt | File Sửa | Test Cần Thêm |
|---------|---------|-------------------|----------|---------------|
| 9. Gift selection unresponsive | **duplicate-of-ledger** | Duplicate #39 LEDGER. UI có `<select id="gift-select">` + `<button data-testid="gift-send">`. Nút disabled khi chưa chọn, enable khi đã chọn. Bot harness không hỗ trợ `.selectOption()` trên `<select>` native. | - | - |
| 10. Index shift double-action | **false-positive** | Test driver stale index artifact. `nthActionable` dùng `querySelectorAll` index số nguyên. DOM re-render (NPC mới mount, quest accept unmount) dịch chuyển index. Con trỏ người thật bind trực tiếp element, không bị ảnh hưởng. | - | - |
| 11. Cultivation dead clicks Qi insufficient | **duplicate-of-ledger** | Duplicate #34/F7. Telemetry: Qi=40 (max tier), HP=87. Không "cạn chân khí". Gate `ATTRIBUTE_ALLOCATION_REQUIRED` chủ đích. UI có banner status + nút +1 sáng. | - | - |

---

## Bảng Tickets (GitHub Issues Đề Xuất)

| Ticket | Tiêu Đề | Mức Độ | Files Liên Quan | Trạng Thái |
|--------|---------|--------|-----------------|------------|
| #NEW-1 | Fix quest HUD objective persistence after story close | High | `src/ui/GameScreen.tsx`, `src/ui/gameScreen/panels.tsx`, `src/ui/LeftRailTabContent.tsx` | Mở |
| #NEW-2 | Fix inventory item popover pointer-events interception | Critical | `src/ui/left-rail.css`, `src/ui/LeftRailTabContent.tsx` | Mở |
| #NEW-3 | Add modal inert attribute for NpcChatModal + Journal | High | `src/ui/GameScreen.tsx`, `src/ui/ProtoShell.tsx`, `src/ui/NpcChatModal.tsx` | Mở |
| #NEW-4 | Add data-testid="objective-line" to HUD objective | High | `src/ui/ProtoShell.tsx` | Mở |
| #LEDGER-34 | Attribute allocation gate (đã đóng) | - | `src/engine/reducer.ts:393-399` | Đã đóng |
| #LEDGER-39 | Gift selection NPC (đã đóng) | - | `src/ui/NpcChatModal.tsx:594-613` | Đã đóng |

---

## Bảng Fixes (Sửa Đổi Đề Xuất)

| Fix ID | Mô Tả | Files | Ưu Tiên |
|--------|-------|-------|---------|
| F1 | Di chuyển `objective-widget` ra khỏi `{storyOpen && ...}` block trong GameScreen.tsx, đặt cố định trên HUD topbar | `src/ui/GameScreen.tsx` | Cao |
| F2 | Cập nhật `DockPanelQuests` render active quest step: title, `descriptionVi`, `guideVi`, progress indicators | `src/ui/gameScreen/panels.tsx` | Cao |
| F3 | Thêm `data-testid="objective-line"` vào objective text container ProtoShell | `src/ui/ProtoShell.tsx` | Cao |
| F4 | Set `pointer-events: none` trên `.proto-item-popover` wrapper, `pointer-events: auto` chỉ trên inner card + action buttons | `src/ui/left-rail.css` | Cao |
| F5 | Điều chỉnh thuật toán định vị popover flyout bên ngoài bounding box lưới 50 ô hành trang | `src/ui/LeftRailTabContent.tsx` | Cao |
| F6 | Mở rộng `useEffect` inert trong GameScreen.tsx: thêm `npcChatTarget !== null` vào điều kiện toggle inert cho `.proto-shell-wrap` + `.world-content` | `src/ui/GameScreen.tsx` | Cao |
| F7 | Thêm `pointer-events: auto` + `e.stopPropagation()` trên modal surface NpcChatModal, backdrop chặn pointer-events xuyên thấu | `src/ui/NpcChatModal.tsx`, `src/ui/left-rail.css` | Cao |
| F8 | Thêm logic auto-allocate attribute points cho test bot | `scripts/browser-play-bot.mjs` | Thấp |

---

## Bot Summaries

```json
{"_summary":{"steps":120,"dead_clicks":0,"unique_gaps":[],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":57,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button","tên dính chuỗi vô hồn: \"CCốc chủ Cốcẩn sĩ hang đá♥ 0\" #button","tên dính chuỗi vô hồn: \"VVong hồn Hàvong hồn lang thang♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ khắc Khuêthợ khắc bùa♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":65,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":101,"dead_clicks":23,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["play:hái thảo: không tìm được điều khiển (/hái thảo/i) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":101,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":120,"dead_clicks":0,"unique_gaps":[],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","dialog"],"days_seen":null,"errors":[]}}
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
```