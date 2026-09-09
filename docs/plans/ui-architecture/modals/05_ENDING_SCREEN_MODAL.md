# Đặc Tả Kỹ Thuật: EndingScreenModal (Đại Kết Cục Thiên Mệnh & Luân Hồi)
**File ID**: `MODAL-05-ENDING`  
**Đường dẫn**: `docs/plans/ui-architecture/modals/05_ENDING_SCREEN_MODAL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/GameScreen.tsx` (`.ending-banner`, `DeathScreen`)  

---

## 1. MỤC ĐÍCH & NGỮ CẢNH XUẤT HIỆN
* **Mục đích**: Tổng kết và khắc họa trọn vẹn cuộc đời của nhân vật khi đạt đến một trong những kết thúc của vận mệnh:
  * Hoàn thành viên mãn con đường đại đạo (Ascension).
  * Lựa chọn cuộc đời phàm trần an nhiên (Mortal Peace).
  * Tử nạn giữa đường do cạn kiệt Khí Huyết, bị kẻ thù hạ sát, hoặc tẩu hỏa nhập ma.
* **Phong cách thẩm mỹ**: Cuốn cổ sử trường thiên cuộn mở, phong vân biến ảo, nhạc nền bi tráng hoặc thanh bình tùy theo kết cục, đóng dấu ấn triện son đỏ son chu sa xác chứng kiếp người.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & BỐ CỤC (LAYOUT)

* **Vị trí**: Phủ kín toàn bộ màn hình (`100vw × 100vh; position: fixed; inset: 0; z-index: 300`).
* **Bố cục**:
  * Cuộn tranh cổ thư trải dài từ trên xuống dưới, căn giữa màn hình (`max-width: 900px; height: 90vh; margin: 5vh auto; overflow-y: auto;`).
  * Khung viền chạm khắc rồng phượng cổ xưa, nền giấy xuyến chỉ ố vàng theo năm tháng.

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

### 3.1. Ấn Triện & Danh Hiệu Kết Cục (Title & Seal)
* **Ấn Triện Son Chu Sa**: Con dấu lớn hình vuông đóng xuống kèm âm thanh nặng chắc (`soundEngine.play('stamp')`):
  * Ví dụ: `[ THÀNH ĐẠO ]`, `[ TỬ NẠN ]`, `[ PHÀM TRẦN ]`.
* **Tên Kết Cục Lớn**: Dòng chữ thư pháp vàng kim uy nghi (vd: *"Vạn Cổ Kiếm Tiên"*, *"Gió Bụi Yên Lạc"*, *"Huyết Tẫn Khí Tuyệt"*).
* **Bài Thơ Điếu Văn / Tụng Ca (Epitaph)**: 4 câu thơ đúc kết cuộc đời nhân vật (Song ngữ Vi/En).

### 3.2. Biên Niên Sử Hậu Truyện (Epilogue Lines)
* Khung văn bản thuật lại những biến cố diễn ra sau khi nhân vật kết thúc hành trình:
  * Làng Thanh Mộc ra sao?
  * Cụ Mai Hoa và những bằng hữu tiền kiếp đã đổi thay thế nào?
  * Tông môn Vân Ẩn có còn lưu truyền truyền thuyết về một kẻ phế căn nghịch mệnh?

### 3.3. Bảng Thống Kê Thiên Mệnh (Run Statistics)
Hiển thị dạng bảng ngọc bài 2 cột tinh tế:
* **Số ngày đã sống**: vd `Ngày 12`.
* **Cảnh giới tối đa đạt được**: vd `Luyện Khí Tầng 4`.
* **Khế ước hệ thống đã gắn bó**: vd `Hệ Thống Chiến Đấu`.
* **Số kẻ địch đã trảm**: vd `8 Yêu thú`.
* **Kỳ hoa dị thảo đã hái**: vd `24 Cây`.
* **Thành tựu đã mở khóa**: Danh sách các huy hiệu thành tích đạt được trong kiếp này.

### 3.4. Nút Hành Động Tái Sinh (Reincarnation Action)
* Nút lớn rực rỡ ở đáy trang: **`Tái Sinh Luân Hồi (Reincarnate & Return to Menu)`**.
* Kèm dòng phụ đề nhỏ: *"Một kiếp đã qua, thiên đạo lại mở. Kiếp sau, con đường do chính ngươi chọn."*

---

## 4. CƠ CHẾ ĐÓNG / MỞ & CHUYỂN CẢNH

* **Điều kiện Mở ra**:
  * Kích hoạt tự động khi `game.terminal === true` (người chơi chọn xong nhánh kết cục cuối cùng của cốt truyện hoặc tử nạn do HP về 0).
* **Điều kiện Đóng lại & Chuyển tiếp**:
  * Nhấn vào nút `Tái Sinh Luân Hồi` -> Màn hình mờ dần (Fade-out) và đưa người chơi quay trở về **Scene 1 (Boot Game Scene - Sảnh Khởi Đạo)** để chuẩn bị cho một kiếp tu tiên mới.
  * Không thể đóng tạm thời bằng phím `Esc` vì đây là màn hình tổng kết kết thúc phiên chơi.
