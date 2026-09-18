# Campaign 2 — Vòng 05: Thẩm Định Chiến Đấu Lượt, Kỹ Năng & Cân Bằng Build (B2, C2)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B2] Chiến đấu lượt + kỹ năng + pháp bảo | [C2] Cân bằng chiến đấu — không build lấn át  
**Nhóm Persona tham gia khảo sát:**
- `p04` (Spade - Competitive Beginner): Ham thắng, ghét thua, kiểm tra độ khó chấp nhận được.
- `p01` (Spade - Speedrunner): Đo thời gian dứt điểm mỗi trận, tìm cách tối ưu sát thương.
- `p15` (Heart - Skeptic): Chọc ngoáy từng kỹ năng xem có cái nào lỗi không.
- `p19` (Churn Risk - Combat Expectant): Mong hành động ngay từ giây đầu.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Balance Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B2: Chiến đấu lượt** | Công thức sát thương `DMG = ATK × SkillMul − DEF × 0.5`, có trạng thái Chảy máu, Choáng, Phản phệ, hồi khí mỗi lượt | `src/engine/reducer.ts`, `src/engine/rpg-state.ts` | ✅ Đạt |
| **B2: Kỹ năng & Pháp bảo** | Cây kỹ năng phân nhánh Kiếm – Chưởng – Phù – Thân Pháp; pháp bảo có hệ số cộng hưởng ngũ hành | `src/content/skill-tree.ts` | ✅ Đạt |
| **C2: Cân bằng chiến đấu** | So sánh 4 nhánh build tại tầng Luyện Khí 5: DPS tương đối 100 (Kiếm) / 92 (Chưởng) / 88 (Phù) / 84 (Thân Pháp, bù lại bằng tốc độ ra tay +18%) — độ lệch tối đa **16%**, nằm trong ngưỡng chấp nhận được (< 25%) | Phân tích số liệu tĩnh từ `skill-tree.ts` | ✅ Đạt |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p04 (Competitive Beginner):
> *"Trận đầu tiên gặp Sói Xám tôi suýt chết vì quên bấm uống thuốc. Lần thứ hai tôi dùng 'Trảm Phong Trảo' đánh choáng rồi hồi máu kịp thời. Cảm giác RẤT ĐÃ khi lật ngược thế cờ! Tuy nhiên tôi không thấy có cảnh báo nào cho biết con sói này mạnh hơn tôi bao nhiêu."*
* **Đề xuất tính năng:** Thêm chỉ số `Đe Dọa (Threat Level)` hiển thị dưới tên quái: ⚔️ Ngang sức / ⚠️ Nguy hiểm /  Tử địa, giúp người chơi mới biết mình nên đánh hay chạy.

### 🗣️ p01 (Speedrunner):
> *"Tôi đo được: Một trận với Trư Nha Sương mất trung bình 6 lượt khi ở Luyện Khí tầng 4. Nếu tối ưu hoàn hảo chỉ cần 4 lượt. Có khoảng trống cho kỹ năng cao. Nhưng nút 'Tự động đánh' (Auto) hiện tại hơi ngốc, không biết dùng thuốc khi máu thấp."*
* **Đề xuất tính năng:** Nâng cấp AI `Tự Động Chiến Đấu`: Cho phép tùy chỉnh ngưng tự động dùng thuốc (VD: máu < 40% uống Bổ Huyết Đan) và ưu tiên kỹ năng hệ Kiếm.

### 🗣️ p15 (Skeptic):
> *"Tôi thử kết hợp 'Hộ Thể Kim Quang' + 'Phản Chấn Quyết' để xây dựng lối chơi phòng ngự phản kích. Kết quả: Kẻ địch tự đánh vào gương phản đòn của tôi và chết. Cơ chế hoạt động chính xác! Nhưng pháp bảo 'Huyền Quy Thuẫn' cộng kháng tính âm hai lần, tôi nghĩ đây là lỗi hiển thị, mặc dù sát thương nhận vào đúng như tính toán."*
* **Đề xuất tính năng:** Sửa lỗi hiển thị mô tả pháp bảo bị cộng dồn kháng tính; hiển thị rõ `Kháng Vật Lý +12% (Tổng +27% gồm pháp bảo)`.

### 🗣️ p19 (Combat Expectant):
> *"Tôi vào game là muốn chém giết ngay. Mất 8 phút đầu lo đọc chữ và đi bộ mới gặp trận đánh đầu tiên. Hơi sốt ruột."*
* **Đề xuất tính năng:** Thêm `Khu Vực Đấu Tập Dân Binh` ngay tại Cổng Làng: Đánh với bù nhìn rơm để làm quen cơ chế chiến đấu trong 1 phút đầu tiên, nhận ngay 5 Đồng và một thanh gỗ.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Chỉ số Đe Dọa (Threat Level):** **CHẤP NHẬN (u tiên Cao)** — Giải quyết triệt để vấn đề "chết oan không báo trước" (Checklist C7).
2. **Nâng cấp AI Tự động chiến đấu:** **CHẤP NHẬN** — Tăng chất lượng cuộc sống (QoL) cho người chơi hệ Speedrunner.
3. **Sửa hiển thị mô tả pháp bảo:** **CHP NHẬN (Bug thật, không phải feature)** — Cần đưa vào danh sách vé lỗi UI.
4. **Khu Đấu Tập Dân Binh:** **CHẤP NHẬN** — Cải thiện Onboarding (Checklist C5), đáp ứng nhóm người chơi muốn hành động sớm.