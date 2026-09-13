# Đặc Tả Kỹ Thuật: SaveSlotsPanel (Thiên Mệnh Đăng Kho - Quản Lý 5 Slot Lưu)
**File ID**: `SCENE1-PANEL-03-SAVE-SLOTS`  
**Đường dẫn**: `docs/plans/ui-architecture/scene1-boot/03_SAVE_SLOTS_PANEL.md`  
**Thành phần mã nguồn tương ứng**: `src/App.tsx` (`SaveSlotsScreen`), `src/ui/session.ts`  

---

## 1. MỤC ĐÍCH & Ý NGHĨA HỆ THỐNG
* **Mục đích**: Cung cấp giao diện quản lý đa tiến trình chơi game (5 Slot lưu trữ độc lập). Người chơi có thể tự do lưu lại các kiếp tu tiên khác nhau, thử nghiệm các hướng đi và hệ thống khác nhau mà không sợ đè mất dữ liệu.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & BỐ CỤC TRÊN MÀN HÌNH

* **Vị trí**: Modal căn giữa màn hình (`top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 60;`).
* **Kích thước**: `width: 820px; max-width: 90vw; max-height: 85vh;`.
* **Màu sắc & Thẩm mỹ**:
  * Hộp ngọc bản gỗ đàn hương đen mun khảm chỉ vàng.
  * Phía sau là lớp kính mờ mịt làm dịu khung cảnh nền sảnh chính (`backdrop-filter: blur(8px)`).
  * Danh sách 5 slot cuộn dọc mượt mà với thanh cuộn thủy mặc mảnh.

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

### 3.1. Tiêu Đề (Header)
* **Kicker**: `[ THIÊN ĐẠO TRẦM TÍCH ]`
* **Tiêu Đề Lớn**: *Thiên Mệnh Đăng Kho (Lưu & Nạp Tiến Trình)*
* **Nút Đóng**: Nút `[✕]` góc trên bên phải.

### 3.2. Danh Sách 5 Thẻ Ngọc Bài (Slot 1 đến Slot 5)
Mỗi slot là một hàng ngang dạng phiến ngọc dày dặn (`.save-slot`, `min-height: 84px`):

* **Nếu Slot Đã Có Dữ Liệu**:
  * **Cột 1 (Số Slot & Đạo Hiệu)**:
    * Thẻ số slot hình ấn đồng: `[ VỊ TRÍ 1 ]`.
    * Tên nhân vật + Cảnh giới: vd *"Lý Trường Sinh — Luyện Khí Tầng 3"*.
  * **Cột 2 (Thông Tin Chi Tiết Kiếp Này)**:
    * Vị trí hiện tại: vd *"Làng Thanh Mộc · Cửa nhà Cụ Mai Hoa"*.
    * Khế ước hệ thống đang mang: vd *"Hệ Thống Chiến Đấu"*.
    * Ngày tu luyện & Thời gian thực tế lưu: vd *"Ngày 5 · Đã lưu 12 phút trước"*.
  * **Cột 3 (Cụm Nút Thao Tác)**:
    * Nút `Nạp Đạo (Load)`: Nút viền vàng ngọc sáng rực, bấm vào để tiếp tục chơi ngay.
    * Nút `Xóa Dấu Vết (Delete)`: Nút màu son đỏ, có cơ chế xác nhận 2 bước để chống lỡ tay xóa nhầm (*"Ngươi chắc chắn muốn xóa kiếp này? Bấm lại để xác nhận"*).
* **Nếu Slot Trống**:
  * Hiển thị hoa văn mờ: *"Ngọc bài còn trống — Chờ khắc thiên mệnh mới"*.
  * Nút `Khởi Tạo Mới`: Bấm vào để kích hoạt quy trình tạo nhân vật mới ghi vào ô này.

### 3.3. Chân Trang (Footer)
* Nút `Quay Lại Sảnh Chính`: Nút thanh nhã nằm ở đáy modal.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & PHÍM TẮT

* **Điều kiện Mở ra**:
  1. Bấm nút "Đọc thẻ lưu" từ Main Menu.
  2. Bấm "Khởi đạo mới" từ Main Menu nhưng toàn bộ 5 slot đều đã có dữ liệu -> Bắt buộc mở bảng này để người chơi chủ động chọn slot muốn ghi đè.
* **Điều kiện Đóng lại (3 cách)**:
  1. Nhấn nút `[✕]` góc trên phải hoặc nút `[Quay Lại]` ở đáy.
  2. Nhấn phím `Esc` trên bàn phím.
  3. Chọn một slot có dữ liệu để Nạp -> Tự động đóng modal và chuyển sang `LoadingTransition`.
* **Phím Tắt Điều Hướng Bàn Phím**:
  * Mũi tên lên/xuống (`↑` / `↓`): Di chuyển tiêu điểm giữa các slot.
  * Phím `Enter`: Nạp slot đang được chọn.
