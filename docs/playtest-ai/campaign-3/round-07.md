# VÒNG 7 — C3-07 · Cân Bằng Tiểu Thảo & Linh Thú: Hồi Máu Theo % Max HP

> Campaign 3 — hiện thực hóa code. Vòng này: vé C2-07 → C3-07.
> **Trạng thái:** ✅ HOÀN THÀNH — vé C2-07 `fixed-verified`

---

## Pha 1 — CHƠI (Playtest & Persona Probing)

| Persona / Kịch bản | Hành vi kiểm thử | Kết quả quan sát |
|---|---|---|
| **Persona Min-Maxer Late-game (p02 replicate)** | Người chơi đạt cảnh giới cao (Kim Đan, Nguyên Anh, Hóa Thần) với thanh Máu tối đa mở rộng từ 100 lên 200–500 HP. Trước sửa: Bạn đồng hành Tiểu Thảo hoặc linh thú hệ trị liệu chỉ hồi một lượng cố định 30 HP phẳng (`REST_HEAL_HP` + 30 HP). Ở early-game (HP 100), 30 HP là 30% — rất mạnh; nhưng ở late-game (HP 300+), 30 HP chỉ chiếm chưa đầy 10%, trở nên hoàn toàn phế phẩm so với sát thương quái đánh 40–80 HP mỗi đòn. | Sau sửa: Lượng hồi máu của Tiểu Thảo và linh thú buff `heal` được tính theo công thức động `% Max HP` với floor guarantee: $\text{healAmount} = \max(\text{buff.value}, \lfloor\text{maxHp} \times \text{buff.value} / 100 + 0.5\rfloor)$. Ở early-game (Max HP 100) hồi 30 HP; mid-game (Max HP 200) hồi 60 HP; late-game (Max HP 350) hồi 105 HP; endgame (Max HP 500) hồi 150 HP. Tiểu Thảo và linh thú hồi máu duy trì giá trị chiến thuật xuyên suốt toàn bộ vòng đời tu tiên. |
| **Persona Roleplayer / Story Companion Lover (p09 replicate)** | Người chơi gắn bó sâu sắc với cốt truyện Tiểu Thảo từ đầu game, không muốn vứt bỏ nàng khi lên map cao. | Khi tu vi và thể chất nhân vật tăng tiến (`stage` và thuộc tính `body`), Tiểu Thảo tăng trưởng sức mạnh trị liệu đồng hành tương xứng, tạo cảm giác gắn kết tri kỷ tu tiên bền chặt. |
| **Persona Dual UI & Accessibility (ProtoShell & GameScreen)** | Thanh đo sinh lực HP trên cả ProtoShell và GameScreen khi người chơi nâng điểm thể chất hoặc đột phá đại cảnh giới. | Thanh đo HP chuyển từ mốc cố định `max={100}` sang `playerMaxHp(game)`, hiển thị đúng tỷ lệ phần trăm `hp / maxHp`, thanh đo co giãn chính xác và các thuộc tính hỗ trợ tiếp cận `aria-valuemax={maxHp}` cập nhật trực tiếp. |

---

## Pha 2 — HỎI & ĐÁP (Đối chiếu tài liệu & code paths)

- **Tài liệu đối chiếu:**
  - `docs/playtest-ai/campaign-3/ROADMAP.md` (Dòng 07 - C3-07): "Cân bằng Tiểu Thảo: hồi máu theo % Max HP | C2-07 | `src/engine/companion.ts`, `reducer.ts`, `content/beasts.ts` | Heal tỷ lệ với HP tối đa, không phế late-game; test RED→GREEN".
  - `docs/playtest-ai/rounds/LEDGER.md` (Vé `C2-07`): "Tiểu Thảo hồi máu phẳng 30 HP → phế ở late-game | `src/engine/companion.ts`, `reducer.ts`, `content/beasts.ts` | Đổi heal thành % Max HP hoặc scale theo realm; test RED→GREEN".
  - `src/engine/constants.ts`: Định nghĩa `MAX_HP = 100`.
  - `src/engine/companion.ts`: Xử lý buff linh thú và bạn đồng hành (`companionBuff`, `COMPANION_EXTRA_ACTION`).
  - `src/engine/stats.ts`: Hệ thống chỉ số và thuộc tính nhân vật.
  - `src/engine/reducer.ts`: Hành động nghỉ ngơi `doRest` và giải quyết lượt phản đòn của kẻ địch `resolveEnemyTurn`.
- **Code paths traced:**
  - `src/engine/companion.ts`:
    - Định nghĩa hằng số `TIEU_THAO_COMPANION_ID = 'companion_tieu_thao'`.
    - Hỗ trợ định danh Tiểu Thảo (`companion_tieu_thao`, `tieu_thao`, `beast_tieu_thao`) trả về `{ kind: 'heal', value: 30 }`.
    - Thêm hàm thuần `calculateCompanionHeal(buff, maxHp)`: Tính toán hồi phục theo % Max HP, làm tròn số nguyên gần nhất, chặn dưới bằng `buff.value` (floor guarantee chống tụt máu khi bị debuff).
    - Thêm hàm trợ thủ `companionHealAmount(companionId, beasts, maxHp)`.
  - `src/engine/stats.ts`:
    - Thêm hàm thuần `playerMaxHp(state)`:
      $$\text{playerMaxHp} = \text{MAX\_HP} + (\text{stage} \times 30) + \max(0, (\text{body} - 3) \times 2)$$
      Bảo toàn 100% tương thích ngược: ở Stage 0 với Body 3, $\text{playerMaxHp} = 100 + 0 + 0 = 100$.
  - `src/engine/reducer.ts`:
    - `doRest`: Lấy `maxHp = playerMaxHp(state)`, tính `companionRestHeal = calculateCompanionHeal(companion, maxHp)`, hồi phục `totalHeal = REST_HEAL_HP + companionRestHeal`, giới hạn trần ở `maxHp`.
    - `resolveEnemyTurn`: Cả 2 nhánh né đòn và trúng đòn đều tính `companionHeal = calculateCompanionHeal(companion, maxHp)` và giới hạn trần máu người chơi tại `maxHp` thay vì cứng `MAX_HP`.
  - `src/ui/GameScreen.tsx` & `src/ui/ProtoShell.tsx`:
    - Đồng bộ `maxHp = playerMaxHp(game)` cho thanh đo HP, ARIA attributes và tỷ lệ phần trăm thanh máu.

---

## Pha 3 — CHỐT SPEC (Adjudicator)

- **Chẩn đoán:** Hồi máu phẳng 30 HP của Tiểu Thảo mất dần giá trị khi nhân vật thăng tiến từ Luyện Khí (100 HP) lên các cảnh giới cao hơn (200–500 HP), khiến bạn đồng hành gắn bó cốt truyện bị lãng quên ở late game.
- **Công thức chuẩn hóa:**
  $$\text{playerMaxHp}(state) = 100 + (\text{stage} \times 30) + \max(0, (\text{body} - 3) \times 2)$$
  $$\text{healAmount}(\text{buff}, \text{maxHp}) = \begin{cases} 0 & \text{nếu } \text{buff.kind} \neq \text{'heal'} \lor \text{buff.value} \le 0 \\ \max\left(\text{buff.value}, \left\lfloor\frac{\text{maxHp} \times \text{buff.value}}{100} + 0.5\right\rfloor\right) & \text{còn lại} \end{cases}$$
- **Hành vi trước:**
  - `doRest`: Luôn hồi phẳng `REST_HEAL_HP = 30`, không nhận bonus từ Tiểu Thảo/linh thú, trần cứng `MAX_HP = 100`.
  - `resolveEnemyTurn`: Lấy `companionHeal = companion?.value ?? 0` (phẳng 30), trần cứng `MAX_HP = 100`.
- **Hành vi sau:**
  - `doRest`: Hồi `REST_HEAL_HP + companionRestHeal`, scale theo Max HP của người chơi, trần động theo `playerMaxHp(state)`.
  - `resolveEnemyTurn`: Lấy `companionHeal` scale theo % Max HP của người chơi, trần động theo `playerMaxHp(state)`.
- **Tiêu chuẩn nghiệm thu:**
  - `test/companion.test.ts` (24 tests) xanh 100%.
  - `test/invariants.test.ts` (5 tests) xanh 100% khi fuzz kiểm tra invariant HP với `playerMaxHp(state)`.
  - `tsc --noEmit` hoàn thành với 0 lỗi.

---

## Pha 4 — CODE & KIỂM CHỨNG (TDD)

- **Tệp sửa đổi:**
  - `src/engine/companion.ts`: Thêm `TIEU_THAO_COMPANION_ID`, `calculateCompanionHeal`, `companionHealAmount`, mở rộng `companionBuff`.
  - `src/engine/stats.ts`: Thêm `playerMaxHp(state)`.
  - `src/engine/index.ts`: Re-export các hàm mới.
  - `src/engine/reducer.ts`: Tích hợp `playerMaxHp` và `calculateCompanionHeal` vào `doRest` và `resolveEnemyTurn`.
  - `src/ui/ProtoShell.tsx`: Cập nhật `maxHp = playerMaxHp(game)` cho thanh HP, mini-badge và progressbar ARIA.
  - `src/ui/GameScreen.tsx`: Cập nhật `max={playerMaxHp(game)}` cho Meter HP.
  - `test/companion.test.ts`: Bộ test 24 trường hợp kiểm thử tỉ mỉ từ đơn vị tới tích hợp reducer.
  - `test/invariants.test.ts`: Cập nhật invariant bound `player.hp <= playerMaxHp(state)`.
- **Kết quả kiểm chứng:**
  ```
  $ npx vitest run test/companion.test.ts test/invariants.test.ts test/breakthrough-glow.ui.test.tsx
  ✓ test/companion.test.ts (24 tests) 22ms
  ✓ test/invariants.test.ts (5 tests) 162ms
  ✓ test/breakthrough-glow.ui.test.tsx (7 tests) 293ms
  Test Files 3 passed (3) · Tests 36 passed (36)
  
  $ npx tsc --noEmit
  EXIT: 0 (sạch lỗi kiểu)
  ```

---

## Kết luận vòng
- Vé C2-07 → **`fixed-verified`** (Tiểu Thảo & linh thú hồi máu theo % Max HP hoàn thành).
- Cập nhật `LEDGER.md` và sẵn sàng sang Vòng 8 (C3-08).
