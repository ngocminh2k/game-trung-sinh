# VÒNG 8 — C3-08 · Ngũ Hành × Thời Tiết Trong Chiến Đấu (Bảng Buff/Debuff)

> Campaign 3 — hiện thực hóa code. Vòng này: vé C2-08 → C3-08.
> **Trạng thái:** ✅ HOÀN THÀNH — vé C2-08 `fixed-verified`

---

## Pha 1 — CHƠI (Playtest & Persona Probing)

| Persona / Kịch bản | Hành vi kiểm thử | Kết quả quan sát |
|---|---|---|
| **Persona Combat Tactician (p19 replicate)** | Người chơi theo dõi thời tiết mỗi ngày để lên kế hoạch xuất chinh. Trước sửa: Ngày mưa bão (`mua`/`bao`) hay trời nắng quang đãng (`quang`) hay đêm trăng máu (`isBloodMoon`) thì đòn đánh của người chơi hệ Thủy, Hỏa, Kim và quái vật đều gây sát thương y hệt nhau. Thời tiết chỉ tác động đến giá thảo dược ở chợ và chi phí di chuyển, hoàn toàn tách biệt khỏi chiến đấu. | Sau sửa: Khi trời mưa (`mua`), người chơi sở hữu Linh Căn hệ Thủy gây thêm +25% sát thương (hệ số 1.25), trong khi chiêu thức hệ Hỏa bị dập tắt bớt (-20%, hệ số 0.80). Ngược lại, trời nắng gắt (`quang`) tiếp thêm hỏa lực cho hệ Hỏa (+15%) và làm suy kiệt hệ Thủy (-10%). Trong sương mù (`suong`), hệ Mộc nhận +15% và cả hai bên nhận thêm +15% né tránh do tầm nhìn hạn chế. Chiến trường trở nên biến ảo và mang đậm tính chiến thuật ngũ hành tương sinh tương khắc. |
| **Persona Min-Maxer & Risk-Reward (p02 replicate)** | Người chơi canh đúng ngày 15 mỗi chu kỳ 28 ngày — Đêm Trăng Máu (Blood Moon). | Trong Đêm Trăng Máu, cả người chơi lẫn yêu thú đều nhận cuồng nộ sát thương +30% (`bloodMoonDamageModifier(day) === 1.3`). Kết hợp với thời tiết mưa bão, đòn đánh hệ Thủy tăng vọt lên tới $+62.5\%$ sát thương ($1.25 \times 1.30 = 1.625$). Đêm Trăng Máu trở thành thời cơ vàng để săn boss lớn hoặc đẩy tháp Lôi Đài với rủi ro cao ăn đòn cực đau. |
| **Persona Casual Cultivator (p17 replicate)** | Người chơi mới bước vào game ở Ngày 1, Linh Căn mặc định hệ Mộc, thời tiết trời trong (`quang`). | Hệ số ngũ hành thời tiết của hệ Mộc trong trời quang là $1.0$, Đêm Trăng Máu không kích hoạt (hệ số $1.0$). Người chơi mới không bị bối rối bởi các biến đổi đột ngột; toàn bộ chỉ số tân thủ và nhịp độ chiến đấu khởi đầu được giữ nguyên vẹn 100%. |

---

## Pha 2 — HỎI & ĐÁP (Đối chiếu tài liệu & code paths)

- **Tài liệu đối chiếu:**
  - `docs/playtest-ai/campaign-3/ROADMAP.md` (Dòng 08 - C3-08): "Ngũ Hành × Thời Tiết trong chiến đấu (bảng buff/debuff) | C2-08 | `src/engine/weather.ts, reducer.ts` | Mưa buff Thủy, Trăng Máu +30% sát thương; test cân bằng".
  - `docs/playtest-ai/rounds/LEDGER.md` (Vé `C2-08`): "Thời tiết không ảnh hưởng chiến đấu, chỉ ảnh hưởng hái thảo/di chuyển | `src/engine/weather.ts`, `reducer.ts` | p19: mưa/Trăng Máu không đổi sát thương. Đề xuất bảng Ngũ Hành × Thời Tiết. → C2-T8".
  - `src/engine/weather.ts`: Hệ thống thời tiết và mùa (`weatherFor`, `seasonFor`, `WEATHER_EFFECTS`).
  - `src/engine/content-types.ts`: Định nghĩa `type Element = 'Mộc' | 'Kim' | 'Hỏa' | 'Thủy' | 'Thổ'`.
  - `src/content/rpg.ts`: Bảng quái vật `ENEMIES` đã khai báo sẵn thuộc tính nguyên tố (`element: 'Mộc'`, `'Kim'`, `'Thủy'`, v.v.).
  - `src/engine/reducer.ts`: Đòn tấn công của người chơi `doCombatAttack` và lượt phản công của kẻ địch `resolveEnemyTurn`.
- **Code paths traced:**
  - `src/engine/weather.ts`:
    - Thêm hàm thuần `isBloodMoon(day: number): boolean`: Kiểm tra chu kỳ âm lịch 28 ngày, ngày thứ 15 là Đêm Trăng Máu.
    - Thêm hàm thuần `bloodMoonDamageModifier(day: number): number`: Trả về $1.3$ vào Đêm Trăng Máu, $1.0$ cho ngày thường.
    - Thêm hàm thuần `elementWeatherModifier(element: Element, weatherKind: WeatherKind): number`: Tính toán hệ số khuếch đại ngũ hành theo thời tiết.
    - Thêm hàm thuần `weatherDodgeBonus(weatherKind: WeatherKind): number`: Trả về $+0.15$ (15%) né đòn khi sương mù (`suong`), $0$ cho các thời tiết khác.
    - Thêm hàm thuần `getPlayerElement(state)`: Trích xuất ngũ hành từ linh căn (`spiritRoot.elementVi`), mặc định fallback về `'Mộc'`.
  - `src/engine/reducer.ts`:
    - `doCombatAttack`:
      ```typescript
      const weather = weatherFor(state.seed, state.day)
      const playerElement = getPlayerElement(state)
      const weatherElementMod = elementWeatherModifier(playerElement, weather.kind)
      const bloodMoonMod = bloodMoonDamageModifier(state.day)
      const combatWeatherMod = weatherElementMod * bloodMoonMod
      const amount = Math.max(1, Math.round((rawAmount + focus) * combatWeatherMod))
      ```
    - `resolveEnemyTurn`:
      - Né đòn: `dodgeChance = Math.min(0.9, skillDodgeChance(state) + companionDodge + weatherDodge)`.
      - Sát thương kẻ địch:
        ```typescript
        const enemyElement = enemy.element ?? 'Mộc'
        const enemyWeatherMod = elementWeatherModifier(enemyElement, weather.kind)
        const bloodMoonMod = bloodMoonDamageModifier(state.day)
        const raw = (...) * enemyWeatherMod * bloodMoonMod
        const amount = Math.max(1, Math.round(raw))
        ```

---

## Pha 3 — CHỐT SPEC (Adjudicator)

- **Chẩn đoán:** Thời tiết và ngũ hành trước đây chỉ tác động lên kinh tế (giá dược liệu) và thể lực (chi phí di chuyển), khiến combat mang tính tĩnh, thiếu sự kết nối với thiên tượng và vũ trụ quan tu tiên (Tu chân giả mượn thiên địa chi lực).
- **Ma trận Ngũ Hành × Thời Tiết:**
  | Thời tiết (`weatherKind`) | Nguyên tố ưu thế (Buff) | Nguyên tố suy yếu (Debuff) | Trung tính (1.0) | Hiệu ứng môi trường |
  |---|---|---|---|---|
  | **Mưa (`mua`)** | Thủy: $+25\%$ (1.25), Mộc: $+5\%$ (1.05) | Hỏa: $-20\%$ (0.80) | Kim, Thổ | — |
  | **Trời quang (`quang`)** | Hỏa: $+15\%$ (1.15) | Thủy: $-10\%$ (0.90) | Mộc, Kim, Thổ | — |
  | **Bão (`bao`)** | Kim: $+25\%$ (1.25), Thủy: $+15\%$ (1.15) | Mộc: $-10\%$ (0.90) | Hỏa, Thổ | — |
  | **Sương mù (`suong`)** | Mộc: $+15\%$ (1.15) | Hỏa: $-10\%$ (0.90) | Kim, Thủy, Thổ | Né đòn: $+15\%$ |

- **Đêm Trăng Máu (Blood Moon):**
  - Điều kiện: `((((day - 1) % 28) + 28) % 28) + 1 === 15`.
  - Hệ số: $\times 1.30$ (+30% toàn diện sát thương combat cho cả người chơi và kẻ địch).
  - Tích hợp nhân chập: $\text{combatModifier} = \text{elementWeatherModifier} \times \text{bloodMoonDamageModifier}$.

- **Tiêu chuẩn nghiệm thu:**
  - `test/weather-combat.test.ts` (11 tests) xanh 100%.
  - `test/weather.test.ts`, `test/combat-flow.test.ts`, `test/invariants.test.ts` xanh 100% không hồi quy.
  - `tsc --noEmit` hoàn thành với 0 lỗi.

---

## Pha 4 — CODE & KIỂM CHỨNG (TDD)

- **Tệp sửa đổi:**
  - `src/engine/weather.ts`: Bổ sung `isBloodMoon`, `bloodMoonDamageModifier`, `elementWeatherModifier`, `weatherDodgeBonus`, `getPlayerElement`.
  - `src/engine/index.ts`: Re-export các hàm mới.
  - `src/engine/reducer.ts`: Tích hợp `elementWeatherModifier`, `bloodMoonDamageModifier`, `weatherDodgeBonus` vào `doCombatAttack` và `resolveEnemyTurn`.
  - `test/weather-combat.test.ts`: Bộ test 11 trường hợp kiểm thử ma trận ngũ hành, chu kỳ trăng máu, né đòn sương mù và tích hợp reducer.
  - `docs/playtest-ai/rounds/LEDGER.md`: Cập nhật bảng Campaign 2 và Campaign 3.
- **Kết quả kiểm chứng:**
  ```
  $ npx vitest run test/weather-combat.test.ts test/invariants.test.ts test/companion.test.ts test/weather.test.ts
  ✓ test/weather-combat.test.ts (11 tests) 10ms
  ✓ test/companion.test.ts (24 tests) 20ms
  ✓ test/invariants.test.ts (5 tests) 136ms
  ✓ test/weather.test.ts (7 tests) 9ms
  Test Files 4 passed (4) · Tests 47 passed (47)

  $ npx tsc --noEmit
  EXIT: 0 (sạch lỗi kiểu)
  ```

---

## Kết luận vòng
- Vé C2-08 → **`fixed-verified`** (Ngũ Hành × Thời Tiết trong chiến đấu hoàn thành).
- Sẵn sàng chuyển tiếp sang Vòng 9 (C3-09): Mở rộng câu mô tả thời tiết của narrator (14 $\to$ 40+ câu đa dạng theo 4 mùa $\times$ 6 trạng thái).
