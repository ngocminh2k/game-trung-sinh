# Đặc Tả Kỹ Thuật: TopBarPanel (Thiên Cơ Các - Thanh Trạng Thái Đỉnh)
**File ID**: `SCENE2-PANEL-01-TOPBAR`  
**Đường dẫn**: `docs/plans/ui-architecture/scene2-main/01_TOPBAR_PANEL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/layout/TopBar.tsx` (`TopBar`), `src/ui/screens.css` (`.topbar`)  

---

## 1. MỤC ĐÍCH & NGỮ CẢNH
* **Mục đích**: Là thanh thông tin thiên cơ tối thượng gắn ở đỉnh đầu, hiển thị các thông tin toàn cục: Thời gian (Ngày), Tiến trình truyện (Chương), Địa lý (Vị trí), Kinh tế (Tài phú) và các công cụ hệ thống (Ngôn ngữ, Cài đặt).
* **Nguyên tắc giải phóng không gian**: Hỗ trợ cơ chế **Ghim cố định (Pinned)** hoặc **Tự động ẩn (Auto-hide)** để trả lại hơn 50px chiều cao cho bản đồ non nước.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & 2 TRẠNG THÁI HIỂN THỊ

* **Vị trí**: Đỉnh màn hình (`grid-area: top; width: 100%; z-index: 30;`).
* **2 Trạng Thái Hiển Thị (Display Modes)**:
  1. **Chế Độ Ghim Cố Định (`Pinned Mode` - Mặc định, Cao 52px - 56px)**:
     * Nằm cố định trên cùng, viền dưới mạ vàng mỏng ngăn cách với 3 cột chơi.
     * Nút ghim hình chiếc trâm ngọc `[📌]` sáng ở góc phải.
  2. **Chế Độ Tự Động Ẩn (`Auto-Hide / Zen TopBar` - Cao 0px)**:
     * Khi bấm bỏ ghim, thanh trượt lên trên mép màn hình (`transform: translateY(-100%)`).
     * **Bản đồ CenterStage lập tức tăng thêm hơn 50px chiều cao!**
     * Chỉ khi người chơi rê chuột sát mép trên cùng (`hover vùng top 10px`) hoặc ấn phím tắt `T`, TopBar mới trượt nhẹ nhàng xuống (`transform: translateY(0)` trong 150ms).

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

Xếp ngang gồm 4 cụm từ trái sang phải:

### 3.1. Cụm Thương Hiệu Trái (Brand)
* Ấn triện đỏ vuông `[ MỆNH ]` (32px).
* Tên game thư pháp *"Phế Căn Ký"* (`font-size: 18px; color: var(--gold-400);`).

### 3.2. Cụm Chip Trạng Thái Thiên Cơ (Status Chips)
Các viên ngọc bài tròn dẹt hình con nhộng (`.topbar-stat`):
* **Chip Ngày**: Viền vàng cổ, chữ in hoa: `Ngày 1` (tự động tăng khi sang ngày mới).
* **Chip Chương**: Viền ngọc bích: `Chương 1 · Phàm nhân xuất đạo` (đã tối ưu bỏ dòng phụ đề dài để chống chật chội).
* **Chip Vị Trí**: Viền lam ngọc: `Vị trí: Làng Thanh Mộc` (cập nhật theo bước chân).
* **Chip Hạn Định (Nếu có)**: Viền đỏ thắm cảnh báo: `Đêm thứ 12 · Còn 11 ngày`.

### 3.3. Cụm Tài Phú Kinh Tế (Currencies)
3 huy hiệu tiền tệ tu tiên với icon đặc trưng:
* **Vàng (Gold)**: Icon đồng tiền vàng mạ khắc `© 60 vàng`.
* **Bạc (Silver)**: Icon thỏi bạc ánh trắng `© 0 bạc`.
* **Linh Thạch (Spirit Stones)**: Icon tinh thạch thanh lam lấp lánh `✦ 0 linh thạch`.

### 3.4. Cụm Công Cụ Hệ Thống (System Actions)
* **Nút Song Ngữ**: Bộ gạt `[ VI | EN ]` chuyển ngôn ngữ tức thì.
* **Nút Cài Đặt**: Nút hình bánh răng gỗ mun mạ vàng, click để mở `SettingsModal`.
* **Nút Ghim / Bỏ Ghim**: Biểu tượng trâm ngọc `[📌]`.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & PHÍM TẮT

* **Nút bấm vật lý**: Bấm nút trâm ngọc `[📌]` để chuyển giữa *Pinned* ↔ *Auto-hide*.
* **Phím tắt**: Phím `T` (TopBar toggle) để gọi thanh TopBar trượt xuống hoặc ẩn đi ngay lập tức.
