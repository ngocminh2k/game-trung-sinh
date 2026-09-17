# VÒNG 5 — C3-05 · Dynamic Epilogue Fate Cards cho 6 Archetype Kết Cục & 10 Hệ Thống

> Campaign 3 — hiện thực hóa code. Vòng này: vé C2-05 → C3-05.
> **Trạng thái:** ✅ HOÀN THÀNH — vé C2-05 `fixed-verified`

---

## Pha 1 — CHƠI (Playtest & Persona Probing)

| Persona / Kịch bản | Hành vi kiểm thử | Kết quả quan sát |
|---|---|---|
| **Persona Narrative Completionist (p08 replicate)** | Hoàn thành cốt truyện với các lựa chọn nhánh phức tạp: tin tưởng Mai Hoa nhưng không cứu được Hà, vạch trần Võ nhưng chưa hòa giải với Khoa, kết bạn với Ngô làm đạo lữ. | Trước sửa: Kết cục trả về mảng 5 đoạn text thuần, các nhánh kết thúc hệ thống (P1-1 system endings) rơi vào fallback `OUTCOME.quiet_harmony`, làm đứt gãy trải nghiệm nhân vật.<br>Sau sửa: Sinh 5 Thẻ Số Phận (`FateCard`) cấu trúc rõ ràng (`hero`, `village`, `sect`, `companion`, `world`) với tiêu đề và nội dung phản ánh chân thực từng cờ quyết định. 10 kết cục hệ thống có văn phong di sản riêng biệt, không còn bị nhầm lẫn với kết cục ẩn cư. |
| **Persona System Maxer (p02 replicate)** | Max cảnh giới với Hệ Thống Chiến Đấu (`system_battle_end`) hoặc Hệ Thống Hư Vô (`system_void_end`). | Nhận được Thẻ Số Phận nhân vật chính chuyên biệt: "Dao khắc trên tay ngươi đã cùn. Hệ Thống Chiến Đấu ghi một dòng chiến tích cuối rồi im..." hoặc "Vệt sáng cuối cùng tắt. Thần Ma Điểm Hóa của Hệ Thống Hư Vô hòa vào hư không...". |
| **Persona Legacy UI / Internationalization** | Kiểm tra hiển thị song ngữ VI/EN và tương thích ngược với component `GameScreen.tsx`. | `endingEpilogue(game, locale)` tự động trích xuất nội dung từ `endingFateCards`, bảo toàn 100% tương thích ngược kiểu `string[]` cho UI hiện tại, đồng thời sẵn sàng cho giao diện lật thẻ số phận trong tương lai. |

---

## Pha 2 — HỎI & ĐÁP (Đối chiếu tài liệu & code paths)

- **Tài liệu đối chiếu:**
  - `ROADMAP.md` (Dòng 05 - C3-05): "Epilogue Động cho 6 kết cục (đã có `endingEpilogue.ts` — mở rộng) | C2-05 | `src/ui/endingEpilogue.ts`, `endings-data.ts` | Mỗi kết cục sinh thẻ số phận theo cờ; song ngữ VI/EN".
  - `docs/playtest-ai/rounds/LEDGER.md` (Vé `C2-05`): "Epilogue Động cho 6 kết cục | `src/ui/endingEpilogue.ts`, `endings-data.ts` | Mỗi kết cục sinh thẻ số phận theo cờ; song ngữ VI/EN".
  - `src/content/endings-data.ts`: Định nghĩa danh sách 12 kết cục cốt truyện và 10 kết cục hệ thống.
  - `src/ui/endingEpilogue.ts`: Logic sinh văn bản kết thúc kiếp sống theo cờ sự kiện.
- **Code paths traced:**
  - `src/content/endings-data.ts`: Thêm `MajorEndingArchetype` ('mortal_harmony' | 'sect_heir' | 'rift_darkness' | 'ascension' | 'rogue_wanderer' | 'tragic_fallen' | 'system_destiny') và hàm `endingArchetype(endingId: string)`.
  - `src/ui/endingEpilogue.ts`: Định nghĩa interface `FateCard`, mở rộng từ điển `OUTCOME` cho toàn bộ 10 hệ thống, hàm `endingFateCards(game: GameState, locale: Locale): FateCard[]`, và tái cấu trúc `endingEpilogue` ánh xạ từ thẻ số phận.

---

## Pha 3 — CHỐT SPEC (Adjudicator)

- **Chẩn đoán:** Epilogue hiện tại thiếu cấu trúc thẻ (Fate Cards) để UI hiển thị trực quan; 10 kết cục hệ thống thiếu văn bản epilogue dẫn đến fallback sai lệch về `quiet_harmony`; thiếu phân loại Archetype kết cục cấp cao.
- **Phạm vi code:**
  1. `src/content/endings-data.ts`:
     - Phân nhóm 6 Archetype cốt truyện lớn + 1 nhóm hệ thống:
       - `mortal_harmony`: `quiet_harmony`, `forgiven_enemy`, `iron_lantern`.
       - `sect_heir`: `jade_heir`, `keeper_of_names`.
       - `rift_darkness`: `rift_kingdom`, `city_of_ghosts`.
       - `ascension`: `nameless_ascension`, `rootless_star`.
       - `rogue_wanderer`: `blank_page`, `borrowed_face`.
       - `tragic_fallen`: `tragic_death`.
       - `system_destiny`: 10 kết cục bắt đầu bằng `system_`.
     - Export hàm `endingArchetype(endingId: string): MajorEndingArchetype`.
  2. `src/ui/endingEpilogue.ts`:
     - Interface `FateCard`:
       ```typescript
       export interface FateCard {
         readonly id: string
         readonly category: 'hero' | 'village' | 'sect' | 'companion' | 'world'
         readonly title: string
         readonly content: string
       }
       ```
     - Thêm 10 entry văn phong di sản cho 10 kết cục hệ thống vào `OUTCOME` (song ngữ VI/EN).
     - Export hàm `endingFateCards(game: GameState, locale: Locale): FateCard[]` sinh đủ 5 thẻ theo thứ tự danh mục chuẩn.
     - `endingEpilogue(game, locale)` tái sử dụng `endingFateCards(game, locale).map((c) => c.content)`.
- **Hành vi trước:** Trả về mảng chuỗi trần; kết thúc hệ thống bị fallback về kết cục ẩn cư thôn quê; không có siêu dữ liệu thể loại thẻ.
- **Hành vi sau:** Dữ liệu thẻ có cấu trúc, có định danh danh mục, tiêu đề địa phương hóa, 10 hệ thống có nội dung riêng biệt, tương thích ngược 100%.
- **Tiêu chí nghiệm thu:** `test/ending-fate-cards.test.ts` (7 tests) và `test/ending-epilogue.test.ts` (1 test) xanh 100%, `tsc --noEmit` 0 lỗi.

---

## Pha 4 — CODE & KIỂM CHỨNG (TDD)

- **Tệp sửa đổi:**
  - `src/content/endings-data.ts`: Thêm `MajorEndingArchetype`, `endingArchetype`.
  - `src/ui/endingEpilogue.ts`: Thêm `FateCard`, `endingFateCards`, bổ sung 10 system endings vào `OUTCOME`, refactor `endingEpilogue`.
  - `test/ending-fate-cards.test.ts`: 7 tests kiểm chứng archetypes, thẻ số phận, tính động theo cờ, và tính tương thích ngược.
- **Kết quả kiểm chứng:**
  ```
  $ npx vitest run test/ending-fate-cards.test.ts test/ending-epilogue.test.ts
  → Test Files 2 passed (2) · Tests 8 passed (8)
  $ npx tsc --noEmit
  → EXIT: 0 (sạch lỗi kiểu)
  ```

---

## Kết luận vòng
- Vé C2-05 → **`fixed-verified`** (Hệ thống Epilogue Động với 5 Thẻ Số Phận theo cờ cho 6 Archetype và 10 Hệ Thống hoàn thành).
- Cập nhật `LEDGER.md` và tiếp tục Vòng 6 (C3-06).
