# Đặc Tả Kỹ Thuật: LoadingTransition (Cửa Ải Luân Hồi - Màn Chuyển Cảnh)
**File ID**: `SCENE1-PANEL-04-LOADING-TRANSITION`  
**Đường dẫn**: `docs/plans/ui-architecture/scene1-boot/04_LOADING_TRANSITION.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/LoadingScreen.tsx` (`LoadingScreen`)  

---

## 1. MỤC ĐÍCH & Ý NGHĨA NGHỆ THUẬT
* **Mục đích**: Là cầu nối chuyển giao mượt mà giữa Scene 1 (Boot Game) và Scene 2 (Main Gameplay). Khi nạp dữ liệu thế giới, tài nguyên tranh vẽ, âm thanh và khởi tạo trạng thái hạt giống (Seed).
* **Cảm xúc mang lại**: Tạo cảm giác như linh hồn người chơi đang bay qua tinh không mờ mịt, phá vỡ luân hồi để hạ phàm nhập thể vào thiếu niên mang linh căn phế.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & BỐ CỤC TRÊN MÀN HÌNH

* **Vị trí**: Phủ kín toàn bộ màn hình (`position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 9999;`).
* **Bố cục**: Căn giữa hoàn toàn theo cả 2 trục (`display: grid; place-items: center;`).
* **Hiệu ứng nền**: Lớp sương khói mực tàu đen nhánh cuộn xoay chậm rãi (`background: radial-gradient(circle at center, #132e22 0%, #07170f 70%, #030805 100%)`).

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

### 3.1. Thái Cực Luân Hồi (Center Spinner)
* Vòng tròn ngọc bích hai nửa âm dương xoay đều nhịp nhàng (`width: 64px; height: 64px; border: 2px solid rgba(216, 180, 102, 0.4); border-top-color: var(--gold-400); border-radius: 50%; animation: spin 2s linear infinite;`).

### 3.2. Danh Ngôn Tâm Pháp Tu Tiên (Random Lore Quote)
* Dòng danh ngôn ngẫu nhiên hiển thị ở trung tâm bên dưới vòng xoay (thay đổi mỗi lần chuyển cảnh):
  * *"Linh căn dẫu phế, đạo tâm bất diệt."*
  * *"Thiên địa lấy vạn vật làm chó rơm; kẻ phàm trần lấy ý chí đọ cùng trời."*
  * *"Ngàn năm tu luyện, thắng bại chỉ tại một niệm chuyển mình."*
* Kiểu chữ thư pháp tao nhã màu vàng nhạt `var(--paper-100)`.

### 3.3. Dòng Trạng Thái Tiến Trình (Status Hint)
* Dòng chữ nhỏ chạy nhấp nháy: *"Đang dung hợp linh hồn... Tái tạo đan điền..."*
* Thanh tiến trình ngọc bích mỏng chạy êm từ 0% đến 100% trong khoảng thời gian ~1.2 giây.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & VÒNG ĐỜI (LIFECYCLE)

* **Thời điểm Kích hoạt (Enter)**:
  * Ngay khi người chơi bấm nút "Tiếp Tục", chọn "Nạp Đạo" trong Save Slots, hoặc hoàn tất Wizard "Ký Khế Ước".
* **Thời điểm Tan biến (Exit)**:
  * Sau khi bộ engine khởi tạo xong trạng thái game (`State Loaded`), màn hình này tự động mờ dần (`opacity: 1` -> `0` trong 500ms) để lộ ra giao diện Main Scene hoàn chỉnh.
  * Tự động unmount hoàn toàn khỏi DOM để không tốn tài nguyên đồ họa khi người chơi đang hành tẩu.
