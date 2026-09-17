# VÒNG 4 — C3-04 · Thuế Chợ Phiên 15% khi mua/bán khác vùng & Chống Arbitrage

> Campaign 3 — hiện thực hóa code. Vòng này: vé C2-04 → C3-04.
> **Trạng thái:** ✅ HOÀN THÀNH — vé C2-04 `fixed-verified`

---

## Pha 1 — CHƠI (Playtest & Persona Probing)

| Persona / Kịch bản | Hành vi kiểm thử | Kết quả quan sát |
|---|---|---|
| **Persona Min-Maxer / Merchant (p06 replicate)** | Khai thác chênh lệch giá thảo dược: mua tại Làng 20 Bạc (2 Bạc trắng), di chuyển đến Phường Thị bán 35 Bạc (3.5 Bạc trắng). | Trước sửa: Biên lợi nhuận thô đạt tới 75% không rủi ro, tạo vòng lặp farm bạc vô hạn phá vỡ kinh tế.<br>Sau sửa: Áp dụng thuế chợ phiên 15% (`MARKET_TOLL_RATE = 0.15`). Bán tại Phường Thị chịu 5 Bạc thuế ($35 \times 0.15 = 5.25 \to 5$ Bạc), thực nhận 30 Bạc. Lãi ròng giảm từ 15 Bạc xuống 10 Bạc (biên lợi nhuận giảm từ 75% xuống 50%). Nếu chịu thuế cả 2 đầu, lãi ròng còn 7 Bạc (~30.4%), triệt tiêu hoàn toàn động lực khai thác so với chi phí thời gian và rủi ro đi lại. |
| **Persona Local Farmer** | Giao dịch nội vùng trong Làng (mua bán với NPC cùng khu vực `playerLocationId === npc.locationId`). | Không chịu thuế chợ phiên (`isCrossRegionalShop = false`), thuế = 0, giá giữ nguyên 100% bảo toàn kinh tế đời sống thôn quê. |
| **Persona Cross-Regional Trader** | Mua vật phẩm tại Phường Thị từ xa hoặc bán hàng xuyên vùng. | Giá mua cộng phụ thu thuế 15%, giá bán trừ thuế 15%, bảo đảm công bằng và logic giao thương giữa các vùng miền. |

---

## Pha 2 — HỎI & ĐÁP (Đối chiếu tài liệu & code paths)

- **Tài liệu đối chiếu:**
  - `docs/playtest-ai/rounds/LEDGER.md` (Vé `C2-04`): "Thuế Chợ Phiên 15% khi mua/bán khác vùng | `src/engine/shopStock.ts`, `economy.ts` | Arbitrage Làng→Phường Thị sau thuế < chênh lệch; test biên".
  - `docs/playtest-ai/campaign-2/round-06.md`: Báo cáo phát hiện lỗ hổng arbitrage nông sản/dược liệu giữa các trạm buôn.
  - `src/engine/economy.ts`: Nơi quản lý tỉ giá và quy đổi tiền tệ.
  - `src/engine/shopStock.ts`: Nơi định giá hàng hóa theo thương gia và thời tiết.
- **Code paths traced:**
  - `src/engine/economy.ts`: Bổ sung hằng số `MARKET_TOLL_RATE = 0.15`, hàm tính thuế `calculateMarketToll`, hàm áp dụng thuế `applyMarketToll`, và hàm tính toán chênh lệch kinh tế `calculateArbitrage`.
  - `src/engine/shopStock.ts`: Bổ sung `isCrossRegionalShop` nhận diện shop khác khu vực qua `npc.locationId`, `marketTollForTrade`, và `effectiveTradePrice`.
  - `src/engine/index.ts`: Re-export các hằng số và hàm kinh tế.

---

## Pha 3 — CHỐT SPEC (Adjudicator)

- **Chẩn đoán:** Khoảng cách giá mua/bán giữa các vùng không có cơ chế điều tiết thuế chợ (Market Toll) dẫn đến exploit mua rẻ bán đắt xuyên vùng không chịu rủi ro.
- **Phạm vi code:**
  1. `src/engine/economy.ts`:
     - `MARKET_TOLL_RATE = 0.15` (15% thuế chợ phiên).
     - `calculateMarketToll(amount: number, isCrossRegional = true): number`: Làm tròn chuẩn số nguyên bằng `Math.round(amount * MARKET_TOLL_RATE)`. Trả về 0 nếu `isCrossRegional = false` hoặc `amount <= 0`.
     - `applyMarketToll(amount, isCrossRegional, mode)`: 'sell' trả về `{ baseAmount, toll, netAmount: base - toll }`, 'buy' trả về `{ baseAmount, toll, netAmount: base + toll }`.
     - `calculateArbitrage(buyPrice, sellPrice, crossRegionalBuy, crossRegionalSell)`: Trả về bảng phân tích lợi nhuận gộp, thuế, lợi nhuận ròng, và tỉ suất lợi nhuận trước/sau thuế.
  2. `src/engine/shopStock.ts`:
     - `DEFAULT_MARKET_LOCATION = 'market'`.
     - `isCrossRegionalShop(playerLocationId, shopNpcId)`: Tra cứu vị trí NPC qua `getNpc(shopNpcId).locationId`, so sánh với `playerLocationId`.
     - `marketTollForTrade(price, isCrossRegional)` và `effectiveTradePrice(basePrice, isCrossRegional, mode)`.
  3. `src/engine/index.ts`: Xuất bản các hàm mới.
- **Hành vi trước:** Không có thuế xuyên vùng, biên lợi nhuận chênh lệch giá 75% bị lạm dụng.
- **Hành vi sau:** Thuế 15% tự động áp dụng khi giao dịch xuyên vùng, giảm lợi nhuận ròng xuống dưới ngưỡng exploit, bảo vệ cân bằng tài nguyên trong game.
- **Tiêu chí nghiệm thu:** `test/market-toll.test.ts` (11 tests) xanh 100%, `test/economy.test.ts` giữ vững 7/7 passed, typecheck `tsc --noEmit` đạt 0 lỗi.

---

## Pha 4 — CODE & KIỂM CHỨNG (TDD)

- **Tệp sửa đổi:**
  - `src/engine/economy.ts`: Bổ sung `MARKET_TOLL_RATE`, `calculateMarketToll`, `applyMarketToll`, `calculateArbitrage`.
  - `src/engine/shopStock.ts`: Bổ sung `isCrossRegionalShop`, `marketTollForTrade`, `effectiveTradePrice`.
  - `src/engine/index.ts`: Re-export đầy đủ.
- **Bộ test mới:** `test/market-toll.test.ts` (11 tests):
  1. Xác thực hằng số `MARKET_TOLL_RATE === 0.15`.
  2. `calculateMarketToll` trả về 0 khi không xuyên vùng hoặc số tiền <= 0.
  3. `calculateMarketToll` tính chính xác 15% và làm tròn số học (100 -> 15, 35 -> 5, 20 -> 3, 10 -> 2, 1 -> 0).
  4. `applyMarketToll` cho 'sell' khấu trừ thuế khỏi số tiền nhận.
  5. `applyMarketToll` cho 'buy' cộng thuế vào chi phí mua.
  6. `applyMarketToll` giữ nguyên giá gốc khi giao dịch nội vùng.
  7. `calculateArbitrage` kịch bản Làng 20 Bạc -> Thị 35 Bạc triệt tiêu biên lợi nhuận từ 75% xuống 50% (lãi giảm từ 15 xuống 10 Bạc).
  8. `calculateArbitrage` kịch bản 2 đầu xuyên vùng giảm lãi còn 7 Bạc (~30.4%).
  9. `isCrossRegionalShop` nhận diện chính xác vị trí người chơi và NPC (`n_farmer_tu` ở village, `n_merchant_bao` ở market).
  10. `effectiveTradePrice` và `marketTollForTrade` tính toán giá giao dịch thực tế chính xác.
- **Kết quả kiểm chứng:**
  ```
  $ npx vitest run test/market-toll.test.ts
  → Test Files 1 passed (1) · Tests 11 passed (11)
  $ npx vitest run test/economy.test.ts
  → Test Files 1 passed (1) · Tests 7 passed (7)
  $ npx tsc --noEmit
  → EXIT: 0 (sạch lỗi kiểu)
  ```

---

## Kết luận vòng
- Vé C2-04 → **`fixed-verified`** (Hệ thống Thuế Chợ Phiên 15% và ngăn chặn Arbitrage xuyên vùng đã hoàn thành và kiểm chứng trọn vẹn).
- Cập nhật `LEDGER.md` và tiến sang Vòng 5.
