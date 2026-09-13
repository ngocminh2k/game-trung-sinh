# Đặc Tả Kỹ Thuật: SettingsModal (Thiết Lập Âm Dương & Thiên Quy)
**File ID**: `MODAL-04-SETTINGS`  
**Đường dẫn**: `docs/plans/ui-architecture/modals/04_SETTINGS_MODAL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/MainMenu.tsx` (`SettingsScreen`), `src/ui/layout/TopBar.tsx`  

---

## 1. MỤC ĐÍCH & NGỮ CẢNH XUẤT HIỆN
* **Mục đích**: Cung cấp bảng điều khiển trung tâm để người chơi tùy chỉnh âm lượng âm thanh, nhạc nền sáo trúc cổ phong, hiệu ứng kiếm hiệp, ngôn ngữ hiển thị và mức độ hỗ trợ của hệ thống.
* **Ngữ cảnh sử dụng**: Có thể mở được từ cả **Scene 1 (Boot Game)** lẫn **Scene 2 (Main Gameplay)** bất kỳ lúc nào mà không làm mất trạng thái phiên chơi.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & BỐ CỤC (LAYOUT)

* **Vị trí**: Modal căn giữa màn hình (`top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 200`).
* **Kích thước**: `width: 540px; max-width: 90vw; max-height: 85vh;`.
* **Màu sắc & Thẩm mỹ**:
  * Hộp ngọc bản gỗ đàn hương đen mun (`var(--bg-ink-card)`), viền mạ đồng cổ (`var(--border-ink)`).
  * Lớp nền phủ mờ: `backdrop-filter: blur(8px); background: rgba(0, 0, 0, 0.6)`.

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

### 3.1. Tiêu Đề (Header)
* **Kicker**: `[ THIÊN ĐẠO THIẾT LẬP ]`
* **Tiêu Đề Lớn**: *Quy Củ & Âm Luật*
* **Nút Đóng**: Nút `[✕]` góc trên phải viền vàng kim.

### 3.2. Nhóm Tùy Chỉnh Âm Thanh (Audio Sliders)
Mỗi thanh trượt gồm Icon âm thanh + Tên mục + Thanh kéo Slider ngọc bích + Số % hiển thị:
1. **Âm Lượng Tổng (Master Volume)**: Điều chỉnh âm thanh toàn cục (0 - 100%).
2. **Nhạc Nền Cổ Phong (BGM)**: Điều chỉnh tiếng sáo trúc, đàn tranh, tiếng suối reo làng quê (0 - 100%).
3. **Hiệu Ứng Tuyệt Kỹ (SFX)**: Điều chỉnh tiếng đao kiếm va chạm, tiếng nuốt linh đan, tiếng chuông đồng thăng cấp (0 - 100%).

### 3.3. Nhóm Tùy Chỉnh Ngôn Ngữ (Language Switcher)
* Bộ 2 nút chuyển đổi trang nhã: `[ Tiếng Việt ]` và `[ English ]`.
* Chuyển đổi ngôn ngữ tức thì trong toàn bộ giao diện mà không cần khởi động lại game.

### 3.4. Nhóm Tùy Chỉnh Trợ Năng (Accessibility & Pacing)
* **Tốc độ hiển thị câu chuyện**: `Chậm (Chữ chạy)` \| `Vừa (Tự nhiên)` \| `Tức thì (Không chờ)`.
* **Hiển thị phím tắt gợi ý**: Bật / Tắt việc hiển thị các nhãn `<kbd>WASD</kbd>`, `<kbd>1-3</kbd>`, `<kbd>Esc</kbd>` trên giao diện.

### 3.5. Chân Trang (Footer Actions)
* Nút `Khôi Phục Mặc Định (Reset to Default)`: Đặt lại toàn bộ về chuẩn ban đầu.
* Nút `Lưu & Quay Lại (Save & Close)`: Nút màu ngọc bích sáng nổi bật, tự động ghi nhớ thiết lập vào `localStorage`.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & TƯƠNG TÁC

* **Điều kiện Mở ra**:
  * Tại Scene 1: Nhấn nút "Thiết lập" trong Main Menu.
  * Tại Scene 2: Nhấn biểu tượng Bánh Răng trên thanh TopBar, hoặc nhấn phím tắt (nếu được cấu hình).
* **Điều kiện Đóng lại (3 cách)**:
  1. Nhấn nút `[✕]` ở góc trên phải.
  2. Nhấn nút `[Lưu & Quay Lại]` ở chân modal.
  3. Nhấn phím `Esc` hoặc click vào vùng tối mờ bên ngoài modal.
* **Hiệu ứng**:
  * Mở: Phóng to nhẹ từ tâm `scale(0.95)` lên `scale(1)` trong 180ms kèm âm thanh lật trang sách.
  * Đóng: Thu nhỏ nhẹ và mờ dần trong 120ms.
