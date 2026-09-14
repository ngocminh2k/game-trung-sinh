# Đặc Tả Kỹ Thuật: BreakthroughModal (Đột Phá Cảnh Giới & Phân Bổ Tiềm Năng)
**File ID**: `MODAL-03-BREAKTHROUGH`  
**Đường dẫn**: `docs/plans/ui-architecture/modals/03_BREAKTHROUGH_MODAL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/GameScreen.tsx` (`.attribute-banner`, `.hud-allocation-hint`)  

---

## 1. MỤC ĐÍCH & NGỮ CẢNH XUẤT HIỆN
* **Mục đích**: Tôn vinh khoảnh khắc thiêng liêng nhất của một tu sĩ: phá vỡ bình cảnh, gột rửa kinh mạch và thăng hoa lên một tầng cảnh giới mới (từ Phàm nhân lên Luyện Khí, hoặc từ Luyện Khí tầng 1 lên tầng 2...).
* **Ý nghĩa cơ chế**: Khi điểm Tu Vi tích lũy đạt ngưỡng cực hạn (`Progress >= Max`), nhân vật đột phá thành công và nhận được các **Điểm Thuộc Tính Tiềm Năng (Pending Attribute Points)** để tự do phân phối vào 4 trụ cột đạo cơ.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & BỐ CỤC (LAYOUT)

* **Vị trí**: Modal hào quang nổi bật chính giữa màn hình (`z-index: 120`).
* **Kích thước**: `width: 580px; max-height: 80vh;`.
* **Màu sắc & Thẩm mỹ**:
  * Nền lụa vàng ánh kim hoàng gia kết hợp hoa văn mây lành vân vũ.
  * Hiệu ứng hào quang ngọc bích tỏa sáng xoay tròn phía sau modal (`glow rotation pulse`).
  * Âm thanh chuông đồng ngân vang (`soundEngine.play('breakthrough')`).

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

### 3.1. Tiêu Đề Thăng Cấp (Breakthrough Banner)
* **Khẩu hiệu**: `[ THIÊN ĐẠO CHÚC PHÚC · BÌNH CẢNH PHÁ TAN ]`
* **Cảnh Giới Mới**: Dòng chữ vàng kim lớn hiển thị cảnh giới vừa đạt được (vd: *"Luyện Khí Tầng Thứ Hai"*).
* **Số Điểm Tiềm Năng Nhận Được**: Dòng chữ sáng: *"Ngươi có 2 điểm tiềm năng chưa phân bổ"*.

### 3.2. Bảng Phân Bổ Tứ Trụ Thuộc Tính (Allocation Grid)
Gồm 4 hàng tương ứng với 4 thuộc tính căn bản:

1. **THẦN (Spirit / Willpower)**:
   * Ý nghĩa: Tinh thần lực, khả năng khám phá cơ quan, tăng sát thương thần thức và độ chính xác.
   * Giao diện: Tên thuộc tính \| Giá trị hiện tại (`3`) \| Nút `[+] Cộng điểm`.
2. **TÂM (Heart / Mind)**:
   * Ý nghĩa: Đạo tâm kiên định, chống chịu huyễn thuật, giảm nguy cơ tẩu hỏa nhập ma.
   * Giao diện: Tên thuộc tính \| Giá trị hiện tại (`4`) \| Nút `[+] Cộng điểm`.
3. **MẠCH (Meridians / Vitality)**:
   * Ý nghĩa: Độ dày kinh mạch, tăng lượng Khí Huyết tối đa và độ hồi phục chân khí mỗi hiệp.
   * Giao diện: Tên thuộc tính \| Giá trị hiện tại (`3`) \| Nút `[+] Cộng điểm`.
4. **VẬN (Destiny / Luck)**:
   * Ý nghĩa: Khí vận trời ban, tăng tỷ lệ gặp cơ duyên, nhặt bảo vật quý hiếm, xuất hiện đòn chí mạng.
   * Giao diện: Tên thuộc tính \| Giá trị hiện tại (`2`) \| Nút `[+] Cộng điểm`.

* **Nút Hoàn Tác `[-] Trừ điểm`**: Cho phép người chơi điều chỉnh lại trước khi bấm xác nhận cuối cùng.

### 3.3. Chân Trang Xác Nhận (Footer)
* Hiển thị số điểm còn lại cần phân bổ: `Còn lại: X điểm`.
* Nút `Xác Nhận Đạo Cơ (Confirm)`:
  * Disabled khi người chơi chưa phân bổ hết số điểm tiềm năng.
  * Enabled và phát sáng rực rỡ khi toàn bộ điểm đã được ấn định.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & TƯƠNG TÁC

* **Điều kiện Mở ra**:
  * Tự động bung mở ngay sau hành động Tu Luyện (`action: 'train'`) hoặc Nhập Định làm đầy thanh Tu Vi.
  * Hoặc khi người chơi bấm vào dòng thông báo *"Phân bổ điểm thuộc tính"* đang nhấp nháy trên thanh RightHUD.
* **Điều kiện Đóng lại**:
  * Chỉ đóng lại sau khi người chơi đã phân bổ toàn bộ điểm tiềm năng và nhấn nút `Xác Nhận Đạo Cơ`.
  * Có thể tạm đóng bằng nút `[✕]` hoặc phím `Esc` để xem xét tình hình xung quanh; khi tạm đóng, dòng Banner cảnh báo tồn đọng điểm thuộc tính sẽ ghim ở đỉnh màn hình để nhắc nhở người chơi hoàn tất.
