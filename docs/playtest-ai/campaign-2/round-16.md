# Campaign 2 — Vòng 16: Khảo Sát 6 Đại Kết Cục, Hậu Kết Cục & Epilogue (A6, A9)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [A6] 6 nhánh kết cục chính | [A9] Hậu kết cục (Post-game / Epilogue)  
**Nhóm Persona tham gia khảo sát:**
- `p05` (Diamond - Completionist): Săn sạch cả 6 kết cục, đo độ khác biệt.
- `p11` (Club - Deep Story Reader): Đánh giá chất lượng văn học của lá thư kết thúc.
- `p16` (Heart - Wanderer): Thử đi lạc để tìm kết cục ẩn.
- `p14` (Heart - Free Command Tester): Tìm cách phá vỡ kết cục bằng hành vi kỳ quặc.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Ending Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **A6: 6 kết cục chính** | Bình Phàm (kết thúc sớm), Tông Môn (an cư), Huyết Ma (tà đạo), Phi Thăng (đại viên mãn), Tán Tu (tự do), Vong Thân (thất bại/tử vong) | `src/content/endings-data.ts` | ✅ Đạt |
| **A6: Điều kiện kích hoạt** | Mỗi kết cc có điều kiện cờ (flag) và chỉ số rõ ràng, không chồng lấn logic | `src/engine/endings.ts` | ✅ Đạt |
| **A9: Hậu kết cc / Epilogue** | **PHÁT HIỆN KHOẢNG TRỐNG**: Sau màn hình kết cc, người chơi chỉ có nút "Luân Hồi" quay về đầu game. Không có nội dung epilogue mô tả số phận thế giới sau đó | `src/ui/DeathScreen.tsx` | ⚠️ Thiếu |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p05 (Completionist):
> *"Tôi đã mở khóa được 5/6 kết cc. Sự khác biệt giữa chúng rất lớn: kết cục Huyết Ma cho bạn biết bạn đã giết cả sư phụ và đệ tử của mình, kết cục Tông Môn cho bạn thấy bạn đã đào tạo 12 đệ tử. Nhưng tôi mất 3 kiếp chỉ để tìm kết cc thứ 6 (Tán Tu) vì không có bất kỳ gi ý nào."*
* **Đề xuất tính năng:** Thêm `Bia Đá Kết Cục (Ending Gallery / Bia Linh Hồn)`: Một màn hình trong phòng Luân Hồi hiển thị 6 ô, 1 số đã mở khóa, 5 ô còn lại hiển thị đúng 1 câu gợi ý mơ hồ để người chơi biết hướng rẽ.

### 🗣️ p11 (Deep Story Reader):
> *"Kết cc Phi Thăng đọc rất đã: 'Ngươi bước qua tầng mây, ngoái nhìn lần cuối, thấy cảnh cũ đã thuộc về kẻ khác. Ngươi mỉm cười, không ngoảnh lại nữa.' Văn phong tuyệt vời. Nhưng câu chuyện khép lại quá đột ngột — tôi muốn biết Thôn Trang và những người tôi cứu sau đó ra sao."*
* **Đề xuất tính năng:** **Đề xuất lớn (A9)** — Viết `Epilogue Động`: Sau màn hình kết cục, hiển thị 3–5 thẻ tóm tắt số phận theo các quyết định người chơi đã thực hiện (VD: "Cụ Mai Hoa qua đời năm 78 tuổi, an nhàn bên con cháu, vì ngươi đã chữa lành căn bệnh của bà ở ngày 12").

### 🗣️ p16 (Wanderer):
> *"Tôi thử đi thẳng vào Hắc Phong Cốc ở ngày thứ 2 với Luyện Khí tầng 1, và chết ngay lập tức với kết cục Vong Thân. Rất hợp lý và không hề có bug 'tường vô hình' chặn tôi."*
* **Ghi nhận tích cực:** Không có vùng cấm giả tạo; game tôn trọng quyền tự do của người chơi và để hậu quả xảy ra tự nhiên.

### 🗣️ p14 (Free Command Tester):
> *"Tôi thử nhập 'xin chết' ở dòng lệnh và nhận... 'Ngươi không thể chạm vào cái chết bằng lời nói'. Sau đó tôi vẫn chết khi đi vào Hắc Phong Cốc tầng 4. Hệ thống lệnh tự do có phản hồi thông minh."*
* **Đề xuất tính năng:** Thêm vài câu phản hồi nhại lại cho các lệnh ngớ ngẩn phổ biến (VD: 'ta muốn ăn cơm' → 'Tu sĩ Luyện Khí đã tích cốc, không cần ăn cơm, nhưng ngươi vẫn có thể thử xới một bát tro bếp').

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Epilogue Động (A9):** **CHẤP NHẬN (Ưu tiên CAO NHẤT vòng này)** — Đây là khoảng trống lớn nhất của toàn bộ chiến dịch. Cần khai thác hạ tầng c (flags) sẵn có để tạo 3–5 thẻ số phận thế giới sau khi kết thúc.
2. **Bia Đá Kết Cục (Ending Gallery):** **CHẤP NHẬN** — Tăng động lực chơi lại, giải quyết nỗi khổ của p05.
3. **Phản hồi lệnh ngớ ngẩn mở rộng:** **CHẤP NHN (Nội dung nhỏ, vui)** — Tăng cá tính, chi phí thấp.