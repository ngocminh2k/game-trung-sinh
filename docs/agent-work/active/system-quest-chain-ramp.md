# Active claim: system-quest-chain-ramp

- Owner: claude
- Claimed: 2026-09-14T15:55:03.804Z
- Objective: U1+U2: chain-flag gating cho system quest pool (ramp theo thu tu nop, khong can realmLevel)
- Scope: src/content/system-quests.ts, src/engine/system-runtime.ts
- Status: **BLOCKED — cho phep code** (user constraint: "ban khong code ban chi chot thay doi. bao van de")

## Chot thay doi (design locked, version "ok ban this")

### U1 — src/content/system-quests.ts (content only, khong doi schema)

voi 10 quest cua tung pool:
- `requiredFlags: []` cho quest dau chuoi; cac quest con lai `requiredFlags: ['quest_<pred>_done']`
- `nextQuestId: '<successor>'` cho moi quest khong phai cuoi chuoi
- bo `deadlineDays` (ly do: P2 duoi day)

Thu tu chuoi theo difficulty tang dan (stable ties giu nguyen thu tu id):

| pool | chuoi |
|---|---|
| battle | `_01 _02 _03 _05 _04 _06` |
| alchemy | `_01 _02 _03 _06 _04 _05` |
| assassin | `_01 _02 _03 _04 _06 _05` |
| void | `_01 _02 _03 _05 _04 _06` |
| merchant, lottery, explorer, healer, artisan, scholar | `_01 _02 _03 _04 _05 _06` (id order) |

### U2 — src/engine/system-runtime.ts

`systemQuestsFor()`: loc khoi pool nhung quest chua mo va chua tung cham vao, vi du

```
pool.filter((def) => state.quests[def.id] !== undefined ||
                    def.requiredFlags.every((f) => Boolean(state.flags[f])))
```

Inline check 2 dong, **khong** import `isQuestUnlocked` tu `./quests` (tranh them edge engine<->content; xem P4).
`activeExtras` va `budgetOk` giu nguyen.

## Van de phat sinh ( phai chot truoc khi code)

- **P1 — test collision (bat buoc sua cung change):** `test/ai-system.test.ts:22` assert `questPool` length 6 khi vua pick `sys_battle`. Sau U2 pool chi con 1 (`_01`). Phai doi thanh length 1 + id dau chuoi. Day la test sai theo design moi, khong phai regression.
- **P2 — deadlineDays phai bi bo, neu khong deadlock chain:** `deadlineDays` chi co hieu luc sau khi accept (`quest_<id>_expires_day`, reducer.ts:1786–1789) va chi bi check o `canCompleteQuest` (quests.ts:114–115). **Khong co path abandon/reset.** Neu player accept roi de het han, quest do never turn-in duoc => flag `_done` thieu vĩnh viễn => ca chuoi behind no khong bao gio mo. Voi chain gating day la deadlock, nen chuoi quest system phai bo han.
  - Keu theo: `test/system-quests.test.ts:33` assert `deadlineDays` 1..3 cho **moi** system quest => phai nong hoac doi thanh optional-when-present.
  - `world_<id>_cleared` flag (reducer.ts:~1850) chi ghi khi `deadlineDays` ton tai; vo system quests se khong bao gio ghi. Da grep: khong consumer nao => dead path, khong sao, ghi lai de don do.
- **P3 — copy bug (NGOAI scope claim nay):** `sys_quest_loaded` (src/content/system-messages.ts:28–30) render "Nhiem vu chinh tai xong: {quest}. Han: {days} ngay." — (a) goi side quest system la "Nhiem vu chinh" la sai ten; (b) sau P2 `days = def.deadlineDays ?? 0` (reducer.ts:~1798) => in ra "Han: 0 ngay". Can sua template + nhanh `days` co kien => phai claim rieng hoac mo scope.
- **P4 — ghi chu implementation:** `isQuestUnlocked` (engine/quests.ts:29–42) co quirk "status==='active' thi hien bat chap flags"; khong anh huong chain vi accept buoc flag `_done` cua pred ton tai mãi. Van inline de tranh import edge.

## Acceptance criteria (ghi truoc implementation)

1. Moi pool dung ra 1 chuoi duy nhat tu head (`requiredFlags: []`) qua `nextQuestId`, phu toan bo 6 quest, difficulty doc doc chuoi khong giam.
2. `npm run typecheck` + `npm run lint` + `vitest run test/system-quests.test.ts test/ai-system.test.ts test/system-engine.test.ts test/system-boot.test.ts test/system-ui.test.tsx` + content validation xanh (sau khi cap nhat 2 test theo P1/P2).
3. Player vua pick system: `systemQuestsFor` tra ve dung `_01`; `_02` khong hien, `canAcceptQuest` that bai.
4. Turn-in `_01` (seed du `requiredItems`): `_01` van con trong list (status completed), `_02` mo va accept duoc, `_03` an.
5. Quest dang `active` van hien du pred chua `_done` (chong mat quest giua chuoi).
6. Khong them modifier `requiredStage` moi len QuestDef (da bac, schema giu nguyen).

## Verification plan

- `npm run typecheck`, `npm run lint`
- `npx vitest run test/system-quests.test.ts test/ai-system.test.ts test/system-engine.test.ts test/system-boot.test.ts test/system-ui.test.tsx`
- content validation path cua `validateAllContent` (src/content/index.ts:113–176) — da co check "nextQuest not found", them check chuoi neu can
- test moi `test/system-quest-chain.test.ts`: 4 case nhu tom tat o criteria 1,3,4,5 (chain walk structual + 3 engine scenario)

## Follow-up claims (tam thoi khong lam)

- U3: auto-accept `_01` lan goi system dau + narration, bo `secret` cho `_01`
- U4 (D6): `marrow_gather_pill` (battle_03) va `ninefold_pill` (battle_05) `requiredStage: 2` trong items.ts -> phan thuong som ma dung som khong dung duoc
- P3 fix: sua `sys_quest_loaded` template + nhanh `days` trong reducer
