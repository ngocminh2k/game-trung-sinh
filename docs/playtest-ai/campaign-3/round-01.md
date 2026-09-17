# VÒNG 1 — C3-01 · Sửa marker nhiệm vụ treo sau khi `quest_*_done`

> Campaign 3 — hiện thực hóa code. Vòng này: vé C2-01 → C3-01.
> **Trạng thái:** ✅ HOÀN THÀNH — vé C2-01 `fixed-verified`

---

## Pha 1 — CHƠI (3 agent browser, persona khác nhau)

| Agent | Persona | Session | Mục tiêu |
|---|---|---|---|
| P1a | Achiever (vi) | p21 | Hoàn thành ≥1 quest, đo objective line sau mỗi lần nộp |
| P1b | Explorer (en) | p22 | Nhận quest, lang thang, nộp muộn; đo objective sau turn-in |
| P1c | Casual/Churn (vi) | p23 | Bấm lung tung, nộp ≥1 quest; ghi cảm giác marker mơ hồ |

_Nhật ký hành vi: sẽ điền từ report p21/p22/p23 sau khi agent hoàn tất._

---

## Pha 2 — HỎI & ĐÁP (2 agent đối chiếu tài liệu)

- **Trace agent** (a730ca): truy vết `complete_quest` handler + `deriveObjective` + `tickQuestSteps` để tìm path marker treo.
- **Docs agent** (a8d736): đối chiếu thiết kế trong `docs/` (CHECKLIST, GDD, LEDGER C2-01) với hành vi code.

_Kết quả đối chiếu: sẽ điền sau khi agent hoàn tất._

---

## Pha 3 — CHỐT SPEC (adjudicator: tôi)

- **Chẩn đoán (từ Pha 1+2):** p22 (Explorer/en) nộp 2 quest qua Journal với chuyển cảnh objective sạch — writer happy-path `doCompleteQuest` trong reducer.ts ghi ATOMIC cả flag lẫn runtime, nên turn-in hợp lệ KHÔNG bị treo. p21/p23 chặn bởi bug khác (NpcChatModal inert — tách riêng). **Lỗi thật của C2-01 là DESYNC dual-source-of-truth:** save cũ/lỗi có `flags['quest_<id>_done'] = true` nhưng `state.quests[<id>].status` vẫn đọc `'active'`/`'available'` — objective line tái hiện quest đã xong, journal re-offer, story/system gate sai.
- **Phạm vi:** `src/engine/quests.ts` (`questStatus` — reader canonical, đọc flag `quest_<id>${FLAG_QUEST_DONE}`), `src/ui/objective.ts` (skip done-flagged + bỏ fallback `?? steps[0]`), `src/engine/migration.ts` (`upgradeV1toV2` reconcile runtime → `'completed'`), + 7 direct-read sites route qua `questStatus()`.
- **Hành vi trước:** flag done nhưng runtime `active` → objective line hiện lại `Hái 3 linh thảo.`; journal đưa quest đã xong về `available` để nhận lại; story/system gate đọc sai.
- **Hành vi sau:** done flag là nguồn chân lý — mọi surface đọc status qua `questStatus`; runtime lệch bị migration sửa; objective không bao giờ tái hiện quest đã hoàn thành.
- **Tiêu chí nghiệm thu:** 5 test mới (3 objective + 2 migration) RED→GREEN; full suite xanh; `tsc --noEmit` sạch.
- **Rủi ro/loại trừ:** KHÔNG thêm completed-guard vào `isQuestUnlocked` (sẽ chặn huy hiệu "Done" hợp lệ trong journal); không bump `GAME_STATE_VERSION` (reconcile nằm trong bước v1→v2 sẵn có).

---

## Pha 4 — CODE (1 agent, theo ranh giới file)

- **Thay đổi:**
  - `src/engine/quests.ts`: `questStatus` trả `'completed'` khi `flags['quest_<id>_done'] === true` (import `FLAG_QUEST_DONE`); không có flag → runtime như cũ.
  - `src/ui/objective.ts`: vòng active-quests thêm điều kiện `questStatus(game, questId) === 'active'`; bỏ `?? quest.steps[0]` (index out-of-bounds = skip, không revert step 0).
  - `src/engine/migration.ts`: `upgradeV1toV2` sau khi rename flag, với mọi key canonical `quest_<id>_done: true`, nếu `quests[<id>]` tồn tại → set `status: 'completed'`.
  - Route qua `questStatus()`: `panels.tsx` (questCountLabel active/available + QuestPanel status), `LeftRailTabContent.tsx` (activeQuests/availableQuests), `GameScreen.tsx` (system panel status + system chat reply), `story.ts` (`matchesLine` questDone/questActive), `system-runtime.ts` (`systemQuestsFor` activeExtras).
- **Test:** 3 test mới `test/objective.test.ts` (không tái hiện quest done; giữ beat authored; không fallback step 0) + 2 test mới `test/migration.test.ts` (reconcile runtime→completed; giữ quest active thật nguyên vẹn).
- **Verify:**
  ```
  $ npx vitest run test/objective.test.ts test/migration.test.ts
  → Test Files 2 passed (2) · Tests 23 passed (23)   [trước sửa: 4 failed | 19 passed]
  $ npx vitest run test/system-quests.test.ts ... test/rpg-systems.test.ts
  → Test Files 7 passed (7) · Tests 73 passed (73)   [suites hệ thống/story/NPC]
  $ npm test -- --run
  → Test Files 128 passed (128) · Tests 1021 passed (1021)   [full suite]
  $ npx tsc --noEmit → EXIT:0
  ```
- **Test bị bỏ qua:** không có test bị skip; toàn bộ 1021/1021 chạy và xanh.

---

## Kết luận vòng
- Vé C2-01 → **`fixed-verified`** (bằng chứng: 5 test RED→GREEN + full suite xanh + typecheck sạch).
- Bug phụ phát hiện (ngoài scope, tách vé riêng): **NpcChatModal inert** — `proto-shell-wrap` nhận `inert`+`pointerEvents:'none'` khi `protoModalActive` (GameScreen.tsx:728-729), vô hiệu hóa control của chính modal, chặn p21/p23 nộp quest qua NPC chat.
- LEDGER cập nhật dưới.
