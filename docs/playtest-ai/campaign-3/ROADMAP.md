# CAMPAIGN 3 — LỘ TRÌNH 20 VÒNG THỰC THI (ROADMAP 2.1)

**Trạng thái:** `ĐÃ ĐÓNG BĂNG (FROZEN 2.1)` 🧊  
**Ngày đóng băng:** 2026-09-17  
**Tiến độ hoàn thành:** **20/20 Vòng (100%)**  
**Bảo chứng chất lượng:** 149 file test xanh (1,240/1,240 tests passed), `npx tsc --noEmit` 0 lỗi, quy chuẩn đạo đức E4 (0 P2W) kiểm chứng 100%.  

Phương pháp thực thi: Mỗi vòng trải qua đúng chu trình 4 pha tiêu chuẩn (**Chơi → Hỏi/Đáp Docs → Chốt Spec → Code Thực Thi + Test**).

| Vòng | ID | Nội dung | Nguồn vé | File đã triển khai | Trạng thái | Tiêu chí nghiệm thu đã đạt |
|:---:|:---:|---|:---:|---|:---:|---|
| 01 | C3-01 | Sửa marker nhiệm vụ treo: NPC/địa điểm không còn chấm than khi `quest_*_done` được ghi | C2-01 | `src/engine/quests.ts`, UI map | ✅ Đạt | Không còn marker trên NPC đã hoàn thành; test tự động RED→GREEN |
| 02 | C3-02 | Bịt farm điểm luân hồi: thưởng theo cột mốc thành tựu, không theo "sống tới ngày 5" | C2-02 | `src/engine/globalProfile.ts`, `src/engine/endings.ts` | ✅ Đạt | Điểm luân hồi chỉ tăng theo mốc (3 NV / Luyện Khí t3 / đại sự kiện) |
| 03 | C3-03 | Làm rõ cơ chế `Thần Ma Điểm Hóa` trong `system-defs.ts` | C2-03 | `src/content/system-defs.ts`, `system-runtime.ts` | ✅ Đạt | Mỗi hệ thống có hiệu ứng runtime cụ thể + mô tả rõ |
| 04 | C3-04 | Thuế Chợ Phiên 15% khi mua/bán khác vùng | C2-04 | `src/engine/shopStock.ts`, `economy.ts` | ✅ Đạt | Arbitrage Làng→Phường Thị sau thuế < chênh lệch; test biên |
| 05 | C3-05 | Epilogue Động cho 6 kết cục (mở rộng `endingEpilogue.ts`) | C2-05 | `src/ui/endingEpilogue.ts`, `endings-data.ts` | ✅ Đạt | Mỗi kết cục sinh thẻ số phận theo cờ; song ngữ VI/EN |
| 06 | C3-06 | Nút Tu luyện/Đột Phá phát sáng pulsing khi đủ 100% tu vi | C2-06 | `src/ui/GameScreen.tsx`, `ProtoShell.tsx`, CSS | ✅ Đạt | Class `can-breakthrough` khi `progress >= threshold`; test UI |
| 07 | C3-07 | Cân bằng Tiểu Thảo: hồi máu theo % Max HP | C2-07 | `src/engine/companion.ts`, `reducer.ts` | ✅ Đạt | Heal tỷ lệ với HP tối đa, không phế late-game; test RED→GREEN |
| 08 | C3-08 | Ngũ Hành × Thời Tiết trong chiến đấu (bảng buff/debuff) | C2-08 | `src/engine/weather.ts`, `reducer.ts` | ✅ Đạt | Mưa buff Thủy, Trăng Máu +30% sát thương; test cân bằng |
| 09 | C3-09 | Mở rộng kho mô tả thời tiết của narrator (52 câu 4 mùa) | C2-09 | `src/content/narrator-weather.ts`, `narrator.ts` | ✅ Đạt | 4 mùa × 6 trạng thái không lặp câu; test nội dung |
| 10 | C3-10 | Bounty: nút "Nhận Tất Cả" + phân loại nhiệm vụ (Chính/Phụ/Tông Môn/Ẩn) | C2 Vòng 07, 11 | `src/ui/gameScreen/panels.tsx`, `objective.ts` | ✅ Đạt | 1-click nhận trọn bounty ngày; tab lọc hiển thị |
| 11 | C3-11 | Gợi ý thành tựu ẩn bằng câu thơ (thay `???` bằng manh mối) | C2 Vòng 12 | `src/content/achievements-data.ts`, `achievements.ts` | ✅ Đạt | Đủ nửa tiến trình → hiện manh mối thơ; test |
| 12 | C3-12 | Bia Đá Kết Cục (Ending Gallery) trong phòng Luân Hồi | C2 Vòng 16 | `src/ui/DeathScreen.tsx`, `globalProfile.ts` | ✅ Đạt | Hiện 6 ô, đã mở + gợi ý; lưu qua `globalProfile` |
| 13 | C3-13 | Chôn Giấu Di Vật (Buried Relic) — tọa độ bí mật cho kiếp sau | C2 Vòng 17 | `src/engine/relics.ts`, `map.ts`, `globalProfile.ts` | ✅ Đạt | Chọn 1 món chôn; kiếp sau đào lại tại tọa độ; test |
| 14 | C3-14 | Cơ chế Ngủ Đông (Hibernate) — dừng đồng hồ in-game khi vắng | C2 Vòng 19 | `src/engine/offline.ts`, `time.ts` | ✅ Đạt | Tạm dừng mùa vụ tối đa 7 ngày thực; test |
| 15 | C3-15 | Lịch Âm Widget + dự báo thời tiết 7 ngày | C2 Vòng 13 | `src/ui/LunarCalendarModal.tsx`, `weather.ts` | ✅ Đạt | Widget hiển thị can chi, ngày Trăng Máu, dự báo; test |
| 16 | C3-16 | Tương tác Ngoại Trang × Danh hiệu (E4): 0 chỉ số, đúng chuẩn | C2 Vòng 10, 12, 18 | `src/content/outfits.ts`, `OutfitTitleModal.tsx` | ✅ Đạt | Mua bằng in-game currency; 0 chỉ số combat; test |
| 17 | C3-17 | Trợ Lý Hệ Thống (bước tiếp theo theo ngữ cảnh) + Session Recap | C2 Vòng 19 | `src/engine/sessionRecap.ts`, `SessionRecapModal.tsx` | ✅ Đạt | Nút `💡` gợi ý bước kế; thẻ tóm tắt khi quay lại >1h |
| 18 | C3-18 | Chế Độ Tóm Tắt (Concise Mode) cho người chơi mệt mỏi | C2 Vòng 19 | `src/engine/concise.ts`, `src/ui/` | ✅ Đạt | Toggle rút gọn mô tả sự kiện 1–2 câu; test |
| 19 | C3-19 | Bộ vật phẩm thời tiết (Áo mưa, Ngọc tránh nắng, Bùa xua sương) | C2 Vòng 13 | `src/content/items.ts`, `weather.ts`, `telegraph.ts` | ✅ Đạt | Vật phẩm chống chịu hiệu ứng thời tiết; sửa max HP lôi đài |
| 20 | C3-20 | Grand Finale: tổng duyệt 20 vòng + Đóng băng Roadmap 2.1 | Toàn bộ | Toàn bộ codebase | ✅ Đạt | Full 149 test xanh, LEDGER cập nhật, đóng băng Roadmap 2.1 |

## Biên bản nghiệm thu Đóng băng Roadmap 2.1
1. Toàn bộ 20 hạng mục tính năng và sửa lỗi đã được đưa vào nhánh chính và được kiểm chứng độc lập.
2. Không còn bất kỳ test đỏ hoặc flaky nào trong test runner Vitest.
3. Dự án đáp ứng tiêu chuẩn sản xuất cho giai đoạn thử nghiệm mở rộng tiếp theo.
