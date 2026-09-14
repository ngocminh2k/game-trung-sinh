# Đặc Tả Kỹ Thuật: MainMenuPanel (Sảnh Khởi Đạo)
**File ID**: `SCENE1-PANEL-01-MAIN-MENU`  
**Đường dẫn**: `docs/plans/ui-architecture/scene1-boot/01_MAIN_MENU_PANEL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/MainMenu.tsx` (`MainMenu`)  

---

## 1. MỤC ĐÍCH & TẦM NHÌN NGHỆ THUẬT
* **Mục đích**: Là bộ mặt đón tiếp đầu tiên khi người chơi khởi động game hoặc trở về từ một kiếp tu tiên.
* **Phong cách thẩm mỹ**: Khung cảnh làng Thanh Mộc mờ sương trong tranh thủy mặc cuộn dài. Thư pháp chữ thảo cổ xưa, tạo cảm giác phiêu bồng, cổ kính và thâm trầm.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & TỌA ĐỘ TRÊN MÀN HÌNH

* **Không Gian Tổng Thể**: Chiếm trọn màn hình (`100vw × 100vh; position: fixed; inset: 0;`).
* **Khu Vực Tương Tác (Menu Dock)**:
  * Đặt tại vị trí tỉ lệ vàng bên trái: Cách mép trái `8vw` (~120px trên màn hình 1440px).
  * Căn giữa theo trục dọc: `top: 50%; transform: translateY(-50%)`.
  * Độ rộng cố định: `width: 360px`.
  * Hơn `65%` diện tích còn lại ở bên phải là khoảng thở nghệ thuật, khoe trọn bức tranh làng quê tu tiên non nước hữu tình.

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

### 3.1. Cụm Thương Hiệu & Tiêu Đề (Branding Block)
* **Ấn Triện Ngọc Đỏ**: Con dấu vuông góc trên trái `[ MỆNH ]` màu son chu sa rực rỡ (`width: 44px; height: 44px;`).
* **Tiêu Đề Thư Pháp**: Dòng chữ lớn *"Phế Căn Ký"* (`font-family: var(--font-display); font-size: 40px; color: var(--ink-900);`).
* **Khẩu Quyết Mở Đầu (Tagline)**: *"Hội Chuyện Trùng Sinh Tu Tiên — Linh Căn Phế, Chí Khí Không Phế"* (`color: var(--jade-700); font-size: 13px; font-weight: 600;`).

### 3.2. Cột Nút Lệnh Điều Hướng (Action Navigation)
Xếp dọc gồm 4 nút dạng thanh ngọc thon dài (`height: 48px; border-radius: 8px;`):

1. **Nút `Tiếp Tục Tu Tiên (Continue)`**:
   * Trạng thái: Chỉ active khi tồn tại save gần nhất. Nếu chưa có save, nút bị mờ (`opacity: 0.45; pointer-events: none`).
   * Phụ đề nhỏ: Hiển thị tóm tắt tiến trình (vd: *"Ngày 4 · Luyện Khí Tầng 2 · Làng Thanh Mộc"*).
2. **Nút `Khởi Đạo Mới (New Game)`**:
   * Dẫn tới màn Wizard chọn Thiên Phú & Độ Khó.
   * Nút có viền vàng mạ đồng, phát sáng ngọc bích nhẹ khi hover.
3. **Nút `Thiên Mệnh Đăng Kho (Save/Load Slots)`**:
   * Mở bảng quản lý 5 ô nhớ lưu game.
4. **Nút `Thiết Lập (Settings)`**:
   * Mở modal cài đặt âm thanh, ngôn ngữ.

### 3.3. Bộ Chuyển Ngôn Ngữ (Language Switcher)
* Nằm ở góc dưới cùng bên trái của cụm menu: Bộ gạt song ngữ `[ VI | EN ]` dạng viên ngọc nhỏ, hiển thị ngôn ngữ đang chọn với màu nền ngọc bích `var(--jade-700)`.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & CHUYỂN CẢNH

* **Hiện ra (Enter)**:
  * Khi app khởi động hoặc người chơi chọn "Thoát về sảnh chính" từ Main Scene.
  * Hiệu ứng: Fade-in mờ ảo 400ms kết hợp âm thanh tiếng gió thổi qua rặng trúc (`soundEngine`).
* **Tắt đi (Exit)**:
  * Khi người chơi bấm vào bất kỳ nút điều hướng nào:
    * Bấm "Tiếp Tục" -> Chuyển thẳng sang `LoadingTransition` để nạp save.
    * Bấm "Khởi Đạo Mới" -> Mở `NewGameWizardPanel`.
    * Bấm "Thiên Mệnh Đăng Kho" -> Mở `SaveSlotsPanel`.
    * Bấm "Thiết Lập" -> Mở `SettingsModal`.
