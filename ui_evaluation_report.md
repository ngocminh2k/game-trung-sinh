# Báo Cáo Đánh Giá Toàn Diện UI/UX Game "Phế Căn Ký" (Trùng Sinh Tu Tiên)

> **Điểm tổng kết:** **4.5 / 10** *(Ý tưởng & Art: 8.5/10 — Bố cục & Lập trình UI/UX: 2.5/10)*

---

## 1. Trải nghiệm Chơi Thực Tế & Quy Trình Khảo Sát

Chúng tôi đã tiến hành khởi chạy dev server, vào game bằng trình duyệt Edge Headless (độ phân giải chuẩn 1440×900), trải nghiệm toàn bộ luồng:
1. Màn hình chính (**Main Menu**) và Thiết lập (**Settings**).
2. Tạo nhân vật & chọn 1 trong 10 Hệ Thống (**New Game / System Selection**).
3. Màn hình chuyển cảnh thủy mặc (**Loading Screen**).
4. Vào thế giới game tại **Làng Thanh Mộc** (Nhà cũ, Giếng làng, Hiên nhà Cụ Mai Hoa...).
5. Di chuyển sang **Sơn môn Vân Ẩn** bằng phím điều hướng `W-A-S-D` (Bậc đá xuống núi, đại hồng chung, thác mây).
6. Tương tác với hệ thống Hành trang / Giang hồ / Nhiệm vụ / Nhân sĩ / Đạo đồ.

---

## 2. Các Màn Hình Thực Tế (Screenshots)

### 2.1. Màn hình Khởi Động & Chọn Hệ Thống
````carousel
![Giao diện Main Menu](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/01_main_menu.png)
<!-- slide -->
![Chọn Hệ Thống và Độ Khó](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/03_new_game_selection.png)
<!-- slide -->
![Thiết lập](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/02_settings.png)
<!-- slide -->
![Màn hình Loading Thủy Mặc](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/04_loading_screen.png)
````

> [!TIP]
> **Điểm sáng:** Phong cách giấy dó (rice paper), ấn tín chu sa màu đỏ chữ "Mệnh" (命) và vòng tròn Enso hàn gắn rễ linh căn mang lại cảm giác Tiên hiệp cổ điển, hoài niệm và trang nhã.

---

### 2.2. Màn Hình Gameplay (Giao diện Khám phá & Di chuyển)
````carousel
![Khởi đầu tại Làng Thanh Mộc](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/07_gameplay_surface.png)
<!-- slide -->
![Di chuyển sang Sơn Môn Vân Ẩn](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/10_moved_east.png)
````

---

### 2.3. Màn Hình Mở Bảng Thông Tin (Nhân sĩ, Nhiệm vụ, Đạo đồ)
````carousel
![Bảng Nhân Sĩ & Nhân Vật](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/09_dock_people.png)
<!-- slide -->
![Bảng Nhiệm Vụ](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/09_dock_quests.png)
<!-- slide -->
![Bảng Đạo Đồ & Trang Bị](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/09_dock_path.png)
<!-- slide -->
![Bảng Chợ & Đổi Vật Phẩm](C:/Users/minhd/.gemini/antigravity-cli/brain/e7b72ba7-4b9d-4915-9d84-5114434fee44/09_dock_market.png)
````

---

## 3. Bảng Điểm Đánh Giá Chi Tiết

| Hạng mục | Điểm | Nhận xét chính |
| :--- | :---: | :--- |
| **Concept & Tranh minh họa (Art Style)** | **8.5 / 10** | Tranh nền phong cảnh (Làng quê, Sơn môn, Đền thờ) và Portrait nhân vật cực kỳ ấn tượng, vẽ tay chi tiết, đậm chất Xianxia. Âm thanh bước chân, chuông reo rất hợp vibe. |
| **Giao diện Menu & Khởi tạo (Menu & Setup)** | **7.0 / 10** | Thiết kế sạch, bố cục chọn 10 Hệ Thống (5×2) rõ ràng. Font chữ Noto Serif / Spectral hợp văn cảnh cổ phong. |
| **Bố cục màn hình chơi (Layout & Structure)** | **2.0 / 10** | **Lỗi xung đột nghiêm trọng**: Code redesign 3-zone (`TopBar`, `LeftRail`, `CenterStage`, `RightHUD`) bị đè bởi DOM legacy cũ. Element bản đồ che hết click tương tác chuột. |
| **Độ rõ nét & Khả năng đọc (Typography & Contrast)** | **2.5 / 10** | Chữ đè chữ, chữ bị co cụm thành cột dọc 20px, chữ đen trên nền xanh tối, chữ xám mờ in thẳng lên nền trời rực sáng. |
| **Trải nghiệm thao tác (UX & Controls)** | **4.0 / 10** | Phím tắt bàn phím (WASD / Mũi tên) nhạy, phản hồi nhanh. Tuy nhiên giao diện chuột (click) bị lỗi chặn pointer-events. Không có thanh trạng thái trực quan rõ ràng lúc mới vào. |
| **ĐIỂM TỔNG HỢP** | **4.5 / 10** | **"Xác là game đỉnh cao, nhưng hồn UI đang bị đứt gãy"** |

---

## 4. Phân Tích Chi Tiết Các Vấn Đề Lớn (Critical Issues)

### 🔴 1. Xung Đột Giữa UI Mới (Redesign) và DOM Di Sản (Legacy Back-compat)
- Trong [GameScreen.tsx](file:///C:/Users/minhd/orca/workspaces/game-trung-sinh/redesign-game-UI/src/ui/GameScreen.tsx), để phục vụ bộ test cũ, cả 2 giao diện (3-zone mới và dock/journal cũ) đều được render song song bên trong `<main className="game-shell">`.
- Kết quả: Khi container `.game-shell` là CSS Grid, các thẻ legacy tự động nhảy vào chiếm chỗ, bóp nghẹt `.game-stage` và `.game-hud` khiến chiều cao ban đầu của chúng tụt về **0px**!

### 🔴 2. Lớp Bản Đồ Phủ Toàn Màn Hình Chặn Tương Tác Chuột
- Thẻ `img.world-map-art` trong `<section className="world-content">` trải rộng ra toàn bộ khung nhìn và nhận sự kiện chuột.
- Khi người chơi dùng chuột để bấm vào các tab bên trái (`rail-tab-vitals`, `rail-tab-items`), trình duyệt báo lỗi `img intercepts pointer events`, khiến chuột bị vô hiệu hóa hoàn toàn, chỉ có thể bấm phím mũi tên.

### 🔴 3. Chữ Đè Lên Nhau (Overlapping Typography)
- Khi mở Bảng Nhiệm vụ hoặc Bảng Chợ:
  - Khung **"Gõ lệnh"** nằm đè ngay lên tiêu đề **"CHƯƠNG HIỆN TẠI"**.
  - Ô input nhập liệu đè lên dòng văn bản **"BIÊN NIÊN KÝ"**.
  - Dropdown **"Bộ sưu tập"** đè lên dòng hướng dẫn phím Enter.
  - Toàn bộ nội dung ở cột giữa biến thành một khối chữ lộn xộn, không thể đọc được.

### 🔴 4. Co Cụm Cột Dọc Kỳ Dị (20px Width Crush)
- Tại Bảng **Đạo đồ & Trang bị**:
  - Cột văn bản mô tả bị bóp nghẹt xuống khoảng 20px.
  - Mỗi chữ, mỗi từ bị bẻ dòng riêng lẻ:
    ```
    Khôn
    sắc,
    nh
    ưng
    rất
    vừa
    tay...
    ```
  - Các tab điều hướng góc trên bên phải bị cụt thành: `"Ngư..."`, `"Nhi..."`, `"Túi ..."`, `"Chợ ..."`, `"Đạo ..."`.

### 🔴 5. Độ Tương Phản Màu Kém (Accessibility Failures)
- **Biên niên ký**: Văn bản màu xám nhạt không có khung nền bóng đổ, in trực tiếp lên nền trời ban mai màu trắng vàng chói lóa.
- **TopBar Logo**: Chữ "Phế Căn Ký" màu xanh rêu sẫm in trên dải thanh TopBar màu xanh đen lá sẫm $\rightarrow$ gần như tàng hình.
- **Input Command Bar**: Chữ gợi ý màu đen in trên nền tối khiến người chơi không biết có thể gõ lệnh tại đây.

---

## 5. Kết Luận & Lời Khuyên Cải Tiến Để Đạt 9/10

1. **Cô lập dứt điểm DOM Legacy**: 
   - Đưa toàn bộ các phần tử tương thích test cũ (`.world-content`, `.dock-tabs`) vào một container ẩn (`display: none` hoặc tách biệt khỏi CSS Grid của `.game-shell`), không để chúng can thiệp vào layout hiển thị.
2. **Kích hoạt trọn vẹn 3-Zone Redesign**:
   - Để `LeftRail`, `CenterStage`, `RightHUD` mở rộng đúng tỷ lệ đã định nghĩa trong `tokens.css`.
   - Hiển thị đầy đủ Portrait nhân vật, thanh Máu/Khí, linh thạch và các nút thao tác nhanh (Tu luyện, Đả tọa, Dược liệu) ngay khi vừa vào game.
3. **Thêm lớp phủ Scrim (Nền mờ) cho phần đọc truyện (Chronicle & Story)**:
   - Thêm nền giấy mờ kính (glassmorphism/rice-paper translucent card `rgba(20, 30, 24, 0.75)`) phía sau Biên Niên Ký để đảm bảo chữ luôn nổi bật trên bất kỳ bức tranh phong nền nào.
