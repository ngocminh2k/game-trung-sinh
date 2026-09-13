# Kế Hoạch Tổng Thể Kiến Trúc Giao Diện 2 Scene (Master Plan)
**Dự án: Phế Căn Ký (Tale of the Broken Root)**  
**Thư mục lưu trữ tài liệu đặc tả**: `docs/plans/ui-architecture/`  
**Triết lý kiến trúc cốt lõi**: *"Không Gian Động (Adaptive Collapsible Workspace) — Mọi panel xung quanh đều có thể Đóng / Mở / Thu Gọn độc lập, trọng tâm Bản Đồ tự động bung rộng kịch khung hình (Edge-to-Edge Widescreen)."*

---

## 1. MỤC TIÊU VÀ DANH MỤC TÀI LIỆU ĐẶC TẢ

Để đảm bảo thiết kế đàng hoàng, sâu sát và không bị gò bó, toàn bộ hệ thống UI/UX được phân rã thành các file đặc tả chuyên sâu độc lập theo cây cấu trúc sau:

```
docs/plans/ui-architecture/
├── 00_MASTER_PLAN.md                  <-- Tài liệu này (Tổng quan & Phím tắt)
├── modals/                            <-- PHÂN HỆ CÁC MODAL & OVERLAYS
│   ├── 01_STORY_MODAL.md              <-- Kỳ ngộ cốt truyện & 3 Lựa chọn số mệnh
│   ├── 02_COMBAT_ENCOUNTER_MODAL.md   <-- Võ đài giao tranh sinh tử
│   ├── 03_BREAKTHROUGH_MODAL.md       <-- Đột phá cảnh giới & Phân bổ tiềm năng
│   ├── 04_SETTINGS_MODAL.md           <-- Thiết lập âm dương, âm thanh, ngôn ngữ
│   └── 05_ENDING_SCREEN_MODAL.md      <-- Đại kết cục thiên mệnh & Luân hồi
├── scene1-boot/                       <-- PHÂN HỆ SCENE 1: BOOT GAME
│   ├── 01_MAIN_MENU_PANEL.md          <-- Sảnh khởi đạo & Điều hướng chính
│   ├── 02_NEW_GAME_WIZARD_PANEL.md    <-- Wizard chọn Khởi nguyên & Hệ thống 3 bước
│   ├── 03_SAVE_SLOTS_PANEL.md         <-- Thiên mệnh đăng kho (5 Ngọc bài lưu)
│   └── 04_LOADING_TRANSITION.md       <-- Cửa ải luân hồi (Chuyển cảnh)
└── scene2-main/                       <-- PHÂN HỆ SCENE 2: MAIN GAMEPLAY
    ├── 01_TOPBAR_PANEL.md             <-- Thiên Cơ Các (Ghim / Tự ẩn)
    ├── 02_LEFT_RAIL_PANEL.md          <-- Lục Đạo Hành Nang (3 Chế độ & 6 Tabs)
    ├── 03_CENTER_STAGE_PANEL.md       <-- Càn Khôn Sân Khấu (Bản đồ + Mệnh lệnh ngang + Zen Mode)
    ├── 04_RIGHT_HUD_PANEL.md          <-- Đạo Khu Chân Dung & Sinh Mệnh (3 Chế độ & Auto-open)
    └── 05_CHRONICLE_TICKER_PANEL.md   <-- Biên Niên Ký & Linh Thông Đài (3 Chế độ)
```

---

## 2. NGUYÊN TẮC GIẢI PHÓNG KHÔNG GIAN (ANTI-CLUTTER RULES)

1. **CenterStage là Trọng Tâm Tuyệt Đối**:
   - Không ép người chơi nhìn cùng lúc 6 panel cố định.
   - Khi các thanh xung quanh (LeftRail, RightHUD, ChronicleTicker, TopBar) đóng lại, bản đồ trung tâm sẽ tự động dãn rộng từ `850px` lên `1400px - 1600px`, tạo cảm giác du ngoạn giữa trời đất kỳ vĩ.
2. **3 Trạng Thái Chuẩn Hóa Cho Mỗi Panel**:
   - `Expanded (Mở Rộng)`: Hiển thị đầy đủ chi tiết, phục vụ thao tác chuyên sâu.
   - `Collapsed / Mini (Thu Gọn)`: Thu nhỏ thành dải biểu tượng mảnh mai hoặc huy hiệu nổi trong suốt, tiết kiệm tối đa diện tích.
   - `Hidden (Ẩn Hoàn Toàn)`: Giấu kịch mép màn hình, nhường 100% không gian cho cảnh quan.
3. **Chế Độ Thiền Định Toàn Cảnh (Zen Mode - Phím tắt `Z`)**:
   - Chỉ với 1 phím bấm `Z`, toàn bộ các thanh công cụ (LeftRail, RightHUD, Ticker, TopBar) lập tức thu gọn ẩn đi. Màn hình chỉ còn duy nhất bức họa non nước, nhân vật và thanh lệnh mờ ảo.
4. **Quy Chuẩn Modal (Modal Standards)**:
   - Mọi Modal đều có lớp phủ làm mờ nền (`backdrop-filter: blur(6px)`).
   - Mọi Modal đều có nút đóng vật lý `[✕]` góc trên phải và hỗ trợ phím `Esc`.
   - Có cơ chế Trap Focus (khóa tiêu điểm bàn phím bên trong modal) để người chơi thao tác bằng phím cực nhanh.

---

## 3. MA TRẬN PHÍM TẮT TOÀN CỤC (GLOBAL SHORTCUTS MATRIX)

| Phím Tắt | Tên Thao Tác | Hành Vi Giao Diện |
| :---: | :--- | :--- |
| **`Z`** | **Zen Mode (Toàn Cảnh)** | Ẩn / Hiện sạch toàn bộ các thanh bên, mở rộng bản đồ 100% |
| **`Tab`** | **LeftRail Toggle** | Chuyển đổi nhanh giữa Mở Rộng (`280px`) ↔ Dải Icon (`56px`) |
| **`B`** hoặc **`I`** | **Túi Đồ & Hành Trang** | Mở thẳng tab Hành trang trong LeftRail (hoặc đóng nếu đang mở) |
| **`P`** | **Nhân Sĩ (People)** | Mở thẳng tab Nhân sĩ địa phương trong LeftRail |
| **`M`** | **Phố Chợ (Market)** | Mở thẳng tab Chợ buôn bán trong LeftRail |
| **`C`** | **Bảng Nhân Vật (HUD)** | Chuyển đổi RightHUD Mở Rộng (`280px`) ↔ Huy Hiệu Mini (`160px`) |
| **`L`** | **Biên Niên Ký (Log)** | Mở rộng Ticker xem 10 biến cố (`120px`) ↔ Thu gọn 1 dòng (`32px`) |
| **`T`** | **Thiên Cơ Các (TopBar)** | Đóng / Mở thanh trạng thái đỉnh màn hình |
| **`1` - `3`** | **Lựa Chọn Số Mệnh** | Chọn nhánh hành động tương ứng trong StoryModal |
| **`Esc`** | **Thoát Khẩn Cấp** | Đóng Modal đang mở, hoặc thu gọn LeftRail/RightHUD về trạng thái tối giản |
| **`W A S D`** / **Mũi Tên** | **Hành Tẩu** | Di chuyển nhân vật trên các ô ma trận bản đồ |
| **`Enter`** | **Thử Vận / Xác Nhận** | Gửi mệnh lệnh gõ tự do hoặc xác nhận hộp thoại |
