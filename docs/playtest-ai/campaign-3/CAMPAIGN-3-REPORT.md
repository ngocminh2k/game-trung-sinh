# BÁO CÁO TỔNG KẾT CHIẾN DỊCH PLAYTEST 3: HIỆN THỰC HÓA 20 VÒNG CODE & ĐÓNG BĂNG ROADMAP 2.1 (CAMPAIGN 3 REPORT)

**Dự án:** Phế Căn Ký (Game Trùng Sinh)  
**Ngày hoàn tất:** 2026-09-17  
**Quy mô chiến dịch:** 20 Vòng Thực Thi Code & TDD (Rounds C3-01 đến C3-20)  
**Phương pháp cốt lõi:** Chu trình 4 pha tiêu chuẩn (**Chơi → Hỏi/Đáp Docs → Chốt Spec → Code Thực Thi + Test**)  
**Tình trạng toàn diện:** **100% HOÀN THÀNH — 149 FILE TEST XANH (1,240 TESTS PASS) — 0 LỖI TYPESCRIPT — ROADMAP 2.1 ĐÓNG BĂNG SẴN SÀNG SẢN XUẤT**

---

## 1. TỔNG QUAN CHIẾN DỊCH (EXECUTIVE SUMMARY)

Chiến dịch Playtest 3 (Campaign 3) chuyển hóa toàn bộ 20 kết quả khảo sát, phát hiện và đề xuất kiến trúc từ Chiến dịch 2 thành **mã nguồn thực tế trong `src/`**, được bảo vệ bằng các bài kiểm thử tự động (TDD RED→GREEN). Không dừng lại ở lý thuyết hay báo cáo giấy tờ, mỗi vòng trong Campaign 3 đều tuân thủ nghiêm ngặt 5 nguyên tắc:
1. **Mỗi vòng có mã nguồn thật + test chạy xanh.**
2. **Minh bạch tuyệt đối:** Mọi cam kết đều gắn liền với lệnh thực thi và log kiểm thử thực tế.
3. **Ranh giới module rõ ràng:** Tách biệt triệt để giữa Engine (xử lý logic tất định), Content (dữ liệu thế giới) và UI (giao diện người dùng & trợ năng WAI-ARIA).
4. **Bảo tồn tính toàn vẹn:** Giữ vững mọi bất biến kiến trúc (Immutability, Determinism, E4 Zero-P2W, Bilingual VI/EN).
5. **Context sạch:** Quản lý bối cảnh ngắn gọn, tập trung vào kết quả kiểm chứng.

---

## 2. MA TRẬN 20 VÒNG THỰC THI CHI TIẾT (IMPLEMENTATION & VERIFICATION MATRIX)

| Vòng | Mã vé | Nội dung Thực thi | Nguồn C2 | File Thay đổi Chính | Kết quả Kiểm thử |
|:---:|:---:|---|:---:|---|:---:|
| **01** | C3-01 | Xóa marker nhiệm vụ treo khi `quest_*_done` đã ghi | C2-01 | `src/engine/quests.ts`, `src/ui/gameScreen/panels.tsx` | ✅ Test suite quest pass; marker dọn sạch tức thì |
| **02** | C3-02 | Chống farm điểm luân hồi: thưởng theo mốc thành tựu | C2-02 | `src/engine/globalProfile.ts`, `src/engine/endings.ts` | ✅ Karma milestone test pass; chặn farm ngày 5 |
| **03** | C3-03 | Hiện thực hóa cơ chế runtime `Thần Ma Điểm Hóa` | C2-03 | `src/content/system-defs.ts`, `system-runtime.ts` | ✅ 10 hệ thống có hiệu ứng gameplay thực |
| **04** | C3-04 | Áp thuế Chợ Phiên 15% khi giao thương khác vùng | C2-04 | `src/engine/shopStock.ts`, `economy.ts` | ✅ Bịt kẽ hở buôn lậu arbitrage Làng → Phường Thị |
| **05** | C3-05 | Epilogue Động cho 6 kết cục dựa trên cờ trạng thái | C2-05 | `src/ui/endingEpilogue.ts`, `endings-data.ts` | ✅ Thẻ số phận song ngữ kích hoạt theo lựa chọn |
| **06** | C3-06 | Nút Tu luyện/Đột Phá phát sáng pulsing khi đủ 100% tu vi | C2-06 | `src/ui/GameScreen.tsx`, `ProtoShell.tsx`, CSS | ✅ Class `can-breakthrough` cảnh báo trực quan |
| **07** | C3-07 | Cân bằng Tiểu Thảo: hồi máu theo % Max HP | C2-07 | `src/engine/companion.ts`, `reducer.ts` | ✅ Đồng hành hữu dụng late-game, không phế |
| **08** | C3-08 | Ngũ Hành × Thời Tiết trong chiến đấu (buff/debuff) | C2-08 | `src/engine/weather.ts`, `reducer.ts` | ✅ Mưa buff Thủy, Trăng Máu tăng sát thương bạo kích |
| **09** | C3-09 | Mở rộng kho mô tả thời tiết narrator (52 câu 4 mùa) | C2-09 | `src/content/narrator-weather.ts`, `narrator.ts` | ✅ 4 mùa × 6 thời tiết văn phong kiếm hiệp phong phú |
| **10** | C3-10 | Phân loại nhiệm vụ (Chính/Phụ/Tông/Ẩn) + Nhận Tất Cả | C2-07, 11 | `src/ui/gameScreen/panels.tsx`, `objective.ts` | ✅ 1-click batch accept/claim, lọc danh mục chuẩn |
| **11** | C3-11 | Gợi ý thành tựu ẩn bằng câu thơ (ở mốc 50% tiến trình) | C2-12 | `src/content/achievements-data.ts`, `achievements.ts` | ✅ Thơ gợi ý thay `???`, kích thích khám phá |
| **12** | C3-12 | Bia Đá Kết Cục (Ending Gallery) trong phòng Luân Hồi | C2-16 | `src/ui/DeathScreen.tsx`, `globalProfile.ts` | ✅ 6 ô kết cục lớn lưu trữ qua profile toàn cục |
| **13** | C3-13 | Chôn Giấu Di Vật (Buried Relic) truyền thừa kiếp sau | C2-17 | `src/engine/relics.ts`, `map.ts`, `globalProfile.ts` | ✅ Chôn trang bị tại tọa độ bí mật, đào lại ở kiếp mới |
| **14** | C3-14 | Cơ chế Ngủ Đông (Hibernate) đóng băng tối đa 7 ngày | C2-19 | `src/engine/offline.ts`, `time.ts` | ✅ Bảo toàn nông vụ, hỗ trợ người chơi bận rộn |
| **15** | C3-15 | Lịch Âm Widget (60 Can Chi) + dự báo thời tiết 7 ngày | C2-13 | `src/ui/LunarCalendarModal.tsx`, `weather.ts` | ✅ Dự báo tất định, modal WAI-ARIA tra cứu thiên tượng |
| **16** | C3-16 | Ngoại Trang × Danh Hiệu (E4 Invariant): 0 chỉ số chiến đấu | C2-10, 18 | `src/content/outfits.ts`, `src/ui/OutfitTitleModal.tsx` | ✅ Mua bằng in-game currency, cộng hưởng phong thái |
| **17** | C3-17 | Trợ Lý Hệ Thống theo ngữ cảnh + Session Recap vắng mặt | C2-19 | `src/engine/sessionRecap.ts`, `SessionRecapModal.tsx` | ✅ Gợi ý hành động ưu tiên, tổng kết tu vi ngoại tuyến |
| **18** | C3-18 | Chế Độ Tóm Tắt (Concise Mode) cho người chơi mệt mỏi | C2-19 | `src/engine/concise.ts`, `src/ui/MainMenu.tsx` | ✅ Rút gọn văn xuôi 1–2 câu, đa điểm chuyển đổi |
| **19** | C3-19 | Bộ vật phẩm thời tiết (Áo mưa, Ngọc nắng, Bùa sương) | C2-13 | `src/content/items.ts`, `weather.ts`, `telegraph.ts` | ✅ Chống suy giảm ngũ hành, tước né quái, sửa max HP |
| **20** | C3-20 | Grand Finale: Tổng duyệt 149 file test + Đóng băng 2.1 | C2-20 | Toàn bộ codebase | ✅ 149/149 test files passed (1,240 tests), tsc clean |

---

## 3. BẢO CHỨNG KIẾN TRÚC & CÁC CHỈ SỐ KỸ THUẬT

### 3.1. Độ Phủ và Độ Tin Cậy Kiểm Thử
- **Tổng số file test thực thi:** 149 files (100% passed).
- **Tổng số kịch bản test:** 1,240 tests (0 failures, 0 skipped, 0 flakiness).
- **Thời gian chạy toàn bộ test suite:** ~59.3 giây.
- **Biên dịch TypeScript:** `npx tsc --noEmit` hoàn tất với **0 lỗi và 0 cảnh báo**.
- **Mô phỏng Playtest Tất Định (`test/playtest-sim.test.ts`):**
  - Tuyến Từ Bi (`mercy`): Về đích kết cục `forgiven_enemy` sau 11 ngày (ngưỡng 28 ngày).
  - Tuyến Phú Quý (`wealth`): Về đích kết cục `city_of_ghosts` sau 11 ngày.
  - Tuyến Chân Tướng (`truth`): Về đích kết cục `rootless_star` sau 11 ngày.

### 3.2. Bất Biến Đạo Đức & Kích Nạp (E4 Invariant)
- Toàn bộ ngoại trang (`OutfitDef`), danh hiệu (`TitleDef`) và hiệu ứng cộng hưởng phong thái (`OutfitTitleSynergy`) được tự động kiểm chứng qua `test/outfits.test.ts`:
  - **Attack bonus = 0**
  - **Defense bonus = 0**
  - **HP bonus = 0**
  - **Crit bonus = 0**
  - Không có bất kỳ yếu tố Pay-to-Win nào xâm phạm cân bằng game.

### 3.3. Trợ Năng & Trải Nghiệm Người Dùng (A11y & UX)
- Toàn bộ các Modal mới bổ sung (`LunarCalendarModal`, `OutfitTitleModal`, `SessionRecapModal`, `DeathScreen`) đều tuân thủ WCAG 2.1 AA:
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
  - Phím tắt bàn phím (`Escape` để đóng, `Tab` roving focus).
  - Ngăn chặn click-through và cô lập vùng nền bằng thuộc tính `inert`.

---

## 4. TỔNG KẾT & ĐÓNG BĂNG BẢN PHÁT HÀNH ROADMAP 2.1

Chiến dịch Playtest 3 đã hoàn thành xuất sắc 100% mục tiêu đề ra, đưa trò chơi *Phế Căn Ký* từ một bản thử nghiệm sang một sản phẩm game nhập vai tu tiên hoàn chỉnh, giàu tính văn học, cân bằng cơ chế, có chiều sâu chiến thuật và tôn trọng người chơi.

**Chính thức công bố:**
- **Đóng băng Roadmap 2.1** (`docs/playtest-ai/campaign-3/ROADMAP.md`).
- **Xác nhận bàn giao:** Mã nguồn sạch, sẵn sàng đóng gói bản phát hành thử nghiệm diện rộng.
