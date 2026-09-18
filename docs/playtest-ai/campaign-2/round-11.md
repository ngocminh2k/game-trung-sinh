# Campaign 2 — Vòng 11: Nhiệm Vụ Tông Môn, Bảng Treo Thưởng & Onboarding (B7, C5)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B7] Nhiệm vụ Tông Môn, Bảng Treo Thưởng | [C5] Trải nghiệm Onboarding 10 phút đầu  
**Nhóm Persona tham gia khảo sát:**
- `p07` (Diamond - Quest Junkie): Cày sạch Bảng Treo Thưởng.
- `p17` (Churn Risk - Ragequitter): Thử 10 phút đầu, xem có chỗ nào gây ức chế.
- `p04` (Spade - Aggressive Noob): Tìm kiếm nhiệm vụ khiêu chiến, đấu trường.
- `p12` (Club - Village Mayor): Tìm kiếm nhiệm vụ tương tác với đệ tử đồng môn.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Quest Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B7: Nhiệm vụ Tông Môn** | 12 nhiệm vụ nhánh Tông môn: Tuần sơn, Dọn dẹp Dược Viên, Hái thuốc cống nạp, Khiêu chiến lôi đài | `src/content/quests.ts` | ✅ Đạt |
| **B7: Bảng Treo Thưởng** | Hệ thống nhiệm vụ động quay vòng theo ngày in-game (`bounty.ts`), cống hiến đổi pháp bảo | `src/engine/bounty.ts` | ✅ Đạt |
| **C5: Onboarding 10 phút đầu** | Flow tân thủ: Tỉnh dậy ở Thôn Trang → Gặp Cụ Mai Hoa → Nhận túi càn khôn → Hái 3 nhánh cỏ → Đột phá tầng 1 | `src/content/story.ts` (scenes 1–4) | ✅ Đạt |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p07 (Quest Junkie):
> *"Bảng Treo Thưởng Tông Môn rất cuốn! Mỗi ngày có 3 nhiệm vụ mới (săn 2 Huyết Lang, hái 5 Linh Thảo, tuần tra Hắc Phong Cốc). Điểm cống hiến Tông môn tích lũy đổi được Bí kíp Tàn Quyển. Nhưng tôi muốn có nút 'Nhận toàn bộ' thay vì phải click từng cái."*
* **Đề xuất tính năng:** Thêm nút `Nhận Tất Cả Bảng Treo Thưởng (Accept All Bounties)`: 1-click nhận trọn gói 3 nhiệm vụ ngày.

### 🗣️ p17 (Ragequitter):
> *"Phút thứ 6, sau khi hái cỏ xong, game bảo tôi 'Bế quan đột phá Luyện Khí Tầng 1'. Tôi vào màn hình Tu Luyện nhưng không biết bấm vào đâu vì nút 'Vận Khí' chìm trong nền xám. Tôi suýt tắt game! Sau đó mới thấy dòng chữ nhỏ ghi 'Cần 100 Điểm Tu Vi'. Hãy làm nút này sáng rực lên khi đủ điều kiện."*
* **Đề xuất tính năng:** **Sửa UX quan trọng (Anti-churn)**: Nút `Đột Phá / Vận Khí` phải có hiệu ứng pulsing phát sáng màu vàng kim khi người chơi đã đủ 100% tu vi cần thiết.

### 🗣️ p04 (Aggressive Noob):
> *"Nhiệm vụ khiêu chiến Lôi Đài Tông Môn quá dễ! Tôi dùng chiêu Hỏa Cầu chưởng 2 phát là hạ xong Ngoại Môn Đệ Tử. Tôi muốn có cơ chế 'Khiêu chiến vượt cấp' — cho phép tôi đánh với Nội Môn Đệ Tử để ăn thưởng to gấp 5 lần dù tỷ lệ chết cao."*
* **Đề xuất tính năng:** Thêm chế độ `Khiêu Chiến Vượt Cấp (High-Risk Sparring)`: Cho phép đấu NPC hơn 1–2 tiểu cảnh giới, thắng nhận bội số thưởng, thua bị trọng thương nằm giường 3 ngày.

### 🗣️ p12 (Village Mayor):
> *"Khi làm nhiệm vụ Dọn dẹp Dược Viên, đệ tử Tiểu Thảo nói 'Cảm ơn sư huynh'. Nhưng sau đó tôi nói chuyện lại thì Tiểu Thảo lặp lại đúng câu đó. Nếu có thanh Hảo Cảm Tông Môn tăng dần theo số lần làm việc cùng nhau thì sẽ ấm áp hơn nhiều."*
* **Đề xuất tính năng:** Gắn `Điểm Hảo Cảm Đồng Môn` vào các nhiệm vụ hàng ngày: Tích lũy đủ sẽ mở khóa sự kiện tặng quà tương trợ lẫn nhau.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Hiệu ứng nút Đột Phá phát sáng khi đủ điều kiện:** **CHẤP NHẬN (Ưu tiên Cao - Giảm Churn Rate)** — Sửa ngay để cứu 30% người chơi mới khỏi kẹt lại ở phút thứ 6.
2. **Nút Nhận Tất Cả Bảng Treo Thưởng:** **CHẤP NHẬN (QoL)** — Tiện ích chuẩn mực cho game RPG.
3. **Khiêu Chiến Vượt Cấp:** **CHẤP NHẬN** — Phục vụ hoàn hảo tâm lý nhóm Killer / Aggressive Noob.
4. **Hảo Cảm Đồng Môn qua nhiệm vụ:** **CHẤP NHẬN** — Tăng tính gắn kết xã hội của thế giới tu tiên.
