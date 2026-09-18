# VÒNG 9 — C3-09 · Mở Rộng Kho Mô Tả Thời Tiết Của Narrator (14 → 52 Câu Xianxia)

> Campaign 3 — hiện thực hóa code. Vòng này: vé C2-09 → C3-09.
> **Trạng thái:** ✅ HOÀN THÀNH — vé C2-09 `fixed-verified`

---

## Pha 1 — CHƠI (Playtest & Persona Probing)

| Persona / Kịch bản | Hành vi kiểm thử | Kết quả quan sát |
|---|---|---|
| **Persona Lore Reader & Immersion (p11 replicate)** | Người chơi tu tiên qua từng ngày (`DAY_PASSED`), quan sát log dẫn truyện của narrator khi chuyển ngày và đổi mùa. | **Trước sửa:** Chỉ có 4 câu thời tiết tĩnh (`quang`: "Trời quang đãng, gió mát.", `mua`: "Mưa lất phất làm ẩm đường đất.", `suong`: "Sương mù giăng kín lối đi.", `bao`: "Mây đen cuồn cuộn, sấm chớp rền vang."). Dù là mùa xuân ấm áp hay mùa đông lạnh giá, dù là ngày 1 hay ngày 100, câu mô tả lặp đi lặp lại tạo cảm giác "vẹt nói", triệt tiêu tính thẩm mỹ và phong vị tu chân.<br>**Sau sửa:** Mỗi mùa và thời tiết sở hữu 3 câu văn phong tu tiên thi vị, giàu hình tượng ngũ hành và thiên tượng. Mùa xuân có "Gió xuân mơn man, linh khí đất trời khẽ cựa mình như mầm non đội đất", mùa hạ có "Nắng hạ như thiêu như đốt, luồng nhiệt khí bốc lên ngùn ngụt từ vách đá", mùa đông có "Sương muối dày đặc đông kết thành lớp băng mỏng bao phủ cành cây ngọn cỏ". Đọc log nhật ký như đang lật giở từng trang tiểu thuyết tiên hiệp chân thực. |
| **Persona Casual Cultivator (p17 replicate)** | Người chơi chơi nhiều ngày liên tiếp trong cùng một mùa mưa/nắng. | Các câu mô tả xoay vòng tất định theo công thức `Math.abs(day) % list.length`. Ngày 1, ngày 2, ngày 3 trong cùng một thời tiết không còn bị trùng câu liên tục. Giữ được sự mới mẻ mà không cần gọi hàm ngẫu nhiên gây bất định seed save/load. |
| **Persona Combat Tactician & World Event (p19 replicate)** | Người chơi theo dõi thời khắc chuyển giao sang Ngày 15 (Đêm Trăng Máu - Blood Moon). | Đúng ngày 15, câu thời tiết thông thường được ưu tiên thay thế bằng điềm báo Huyết Nguyệt rực lửa: *"Huyết Nguyệt giáng lâm, vầng trăng đỏ ma quái kích động sát khí cuồng bạo của muôn loài yêu dị."* (hoặc tiếng Anh: *"The Blood Moon ascends; eerie red light stirs frenzied bloodlust in every demonic creature."*). Thông điệp cảnh báo rõ ràng cho cơ chế sát thương $+30\%$ đã hoàn thành ở Vòng 8. |

---

## Pha 2 — HỎI & ĐÁP (Đối chiếu tài liệu & code paths)

- **Tài liệu đối chiếu:**
  - `docs/playtest-ai/campaign-3/ROADMAP.md` (Dòng 09 - C3-09): "Mở rộng kho mô tả thời tiết của narrator (14→40+ câu) | C2-09 | `src/engine/narrator.ts` | 4 mùa × 6 trạng thái không lặp câu; test nội dung".
  - `docs/playtest-ai/rounds/LEDGER.md` (Vé `C2-09`): "Câu mô tả thời tiết của narrator lặp lại (14 câu cho 24 tổ hợp) | `content-nicety` | open | c2 r13 | p11 đọc thấy trùng câu. Ưu tiên thấp, làm sau cơ chế. → C2-T9".
  - `src/engine/weather.ts`: Định nghĩa `Season` (`'xuan' | 'ha' | 'thu' | 'dong'`), `WeatherKind` (`'quang' | 'mua' | 'suong' | 'bao'`), `isBloodMoon(day)`.
  - `src/engine/narrator.ts`: Hàm `narrateLine(event, locale)` xử lý `DAY_PASSED`, gọi `weatherFlavor(event.weather, locale)`.
- **Code paths traced:**
  - `src/content/narrator-weather.ts`:
    - Tạo mới cấu trúc dữ liệu `WEATHER_NARRATIONS`: 16 tổ hợp (4 Mùa $\times$ 4 Thời tiết) $\times$ 3 biến thể song ngữ (VI & EN) = 48 câu.
    - Bổ sung `BLOOD_MOON_NARRATIONS`: 4 câu điềm báo Huyết Nguyệt song ngữ cho Ngày 15.
    - Tổng cộng: **52 câu xianxia phong phú** (vượt xa chỉ tiêu 40+ câu của vé).
    - Tạo hàm `getWeatherNarration(weather, locale, day)`:
      - Nếu `isBloodMoon(day)` $\to$ lấy từ `BLOOD_MOON_NARRATIONS`.
      - Ngược lại $\to$ tra cứu `${weather.season}_${weather.kind}`, chọn biến thể theo chỉ số `Math.abs(day) % list.length`.
      - Giữ fallback an toàn cho trường hợp dữ liệu thiếu sót.
  - `src/engine/narrator.ts`:
    - Cập nhật `weatherFlavor(weather, locale, day)` nhận thêm tham số `day?: number` và gọi `getWeatherNarration`.
    - Cập nhật nhánh `DAY_PASSED`:
      ```typescript
      case 'DAY_PASSED': {
        const desc = weatherFlavor(event.weather, locale, event.day)
        return locale === 'vi'
          ? `Trời sang ngày ${event.day}. ${desc}`
          : `Day ${event.day} dawns. ${desc}`
      }
      ```

---

## Pha 3 — CHỐT SPEC (Adjudicator)

- **Cấu trúc dữ liệu:**
  ```typescript
  export interface WeatherNarration {
    vi: string[]
    en: string[]
  }
  export const WEATHER_NARRATIONS: Record<string, WeatherNarration>
  export const BLOOD_MOON_NARRATIONS: WeatherNarration
  ```
- **Quy tắc tất định (Determinism):**
  - Không dùng `Math.random()`.
  - Dùng `const index = Math.abs(day) % list.length`. Đảm bảo cùng 1 ngày, cùng 1 save file khi load lại luôn sinh ra đúng câu văn cũ, giữ tính nhất quán tuyệt đối của save state.
- **Tiêu chuẩn nghiệm thu:**
  - Tổng số câu VI và EN đạt ít nhất 40+ câu.
  - Không trùng câu giữa 2 ngày liên tiếp có cùng thời tiết.
  - Tích hợp trơn tru với `DAY_PASSED` trong `narrateLine`.
  - Huyết Nguyệt ngày 15 được xướng tên chính xác.
  - `test/narrator-weather.test.ts` (4 tests) xanh 100%.
  - `tsc --noEmit` hoàn thành với 0 lỗi.

---

## Pha 4 — CODE & KIỂM CHỨNG (TDD)

- **Tệp tạo mới & sửa đổi:**
  - `src/content/narrator-weather.ts`: Khai báo 52 câu mô tả thời tiết và hàm giải quyết `getWeatherNarration`.
  - `src/engine/narrator.ts`: Kết nối `getWeatherNarration` vào `weatherFlavor` và nhánh `DAY_PASSED`.
  - `test/narrator-weather.test.ts`: Bộ test gồm 4 bài kiểm thử độ phủ câu, tính tất định xoay vòng theo ngày, tích hợp Huyết Nguyệt và sự kiện `DAY_PASSED`.
- **Kết quả kiểm chứng:**
  ```
  $ npx vitest run test/narrator-weather.test.ts test/weather-combat.test.ts test/narrator.test.ts
  ✓ test/weather-combat.test.ts (11 tests) 9ms
  ✓ test/narrator-weather.test.ts (4 tests) 3ms
  ✓ test/narrator.test.ts (26 tests) 11ms
  Test Files 3 passed (3) · Tests 41 passed (41)

  $ npx tsc --noEmit
  EXIT: 0 (sạch lỗi kiểu)
  ```

---

## Kết luận vòng
- Vé C2-09 → **`fixed-verified`** (Kho mô tả thời tiết mở rộng đạt 52 câu văn xianxia song ngữ).
- Sẵn sàng chuyển tiếp sang Vòng 10 (C3-10): Bảng truy nã: nút "Nhận Tất Cả" + phân loại nhiệm vụ (Chính/Phụ/Tông Môn/Ẩn).
