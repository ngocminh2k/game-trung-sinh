# Đặc Tả Kỹ Thuật: RightHUDPanel (Đạo Khu Chân Dung & Sinh Mệnh - Cột Phải)
**File ID**: `SCENE2-PANEL-04-RIGHT-HUD`  
**Đường dẫn**: `docs/plans/ui-architecture/scene2-main/04_RIGHT_HUD_PANEL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/layout/RightHUD.tsx` (`RightHUD`), `src/ui/screens.css` (`.game-hud`, `.hud-card`)  

---

## 1. MỤC ĐÍCH & Ý NGHĨA HỆ THỐNG
* **Mục đích**: Là đài giám sát tình trạng sống còn và tiến trình tu luyện của nhân vật: Chân dung diện mạo, Ngọc ấn cảnh giới, 3 thanh sinh mệnh sống còn, Tứ trụ thuộc tính Thần-Tâm-Mạch-Vận, và Hộp mục tiêu nhiệm vụ.
* **Giải pháp chống chật chội**: Hỗ trợ **3 chế độ hiển thị linh hoạt**, đặc biệt là chế độ **Huy Hiệu Nổi Tối Giản (Floating Mini Badge)** giúp giải phóng tới 280px chiều rộng cho bản đồ, đồng thời có cơ chế **Tự động bung mở khẩn cấp** khi gặp nguy nan.

---

## 2. 3 TRẠNG THÁI HIỂN THỊ (DISPLAY MODES)

| Chế độ | Kích thước | Mô tả giao diện | Cơ chế thu gọn / mở rộng |
| :--- | :---: | :--- | :--- |
| **1. Mở Rộng Đầy Đủ (`Expanded`)** | `width: 280px` | Hiển thị toàn bộ: Chân dung (115px), Ngọc ấn tu vi, 3 thước đo Khí huyết/Linh khí/Tu vi, Tứ trụ thuộc tính, Mục tiêu nhiệm vụ. Đầu panel có nút `[Thu nhỏ ▶]`. | Thích hợp khi vừa đột phá, chuẩn bị vào trận hoặc phân bổ thuộc tính. |
| **2. Huy Hiệu Nổi Tối Giản (`Mini Badge`)** | `160px × 48px` | Toàn bộ hộp lớn biến mất! Thay vào đó là một **viên ngọc hồ lô nổi trong suốt** ở góc trên bên phải màn hình: Avatar tròn nhỏ (32px) + 2 vạch đo mini Máu (đỏ) & Khí (lam) + Tag cảnh giới (`LK-1`). | **Bản đồ trung tâm nới rộng thêm 280px sang phải!** Click vào huy hiệu này để mở lại HUD đầy đủ. |
| **3. Ẩn Hoàn Toàn (`Hidden`)** | `width: 0px` | Ẩn sạch sẽ toàn bộ bên phải, dành 100% không gian cho bản đồ. | Bật/tắt bằng phím `C`. |

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN (KHI MỞ ĐẦY ĐỦ)

### 3.1. Khung Tranh Chân Dung Tu Sĩ (Character Portrait 115px)
* Tranh minh họa nhân vật chất lượng cao: Tu sĩ áo vải thanh nhã, phong thái kiên nghị, đứng trên nền ánh trăng rừng trúc huyền ảo.
* Huy hiệu gắn dưới chân dung: Cảnh giới hiện tại mạ vàng `[ CẢNH GIỚI: LUYỆN KHÍ ]`.

### 3.2. Ngọc Ấn Cảnh Giới (Cultivation Seal)
* Vòng tròn đồng khắc chữ triện cổ `氣` (Khí).
* Hiển thị tầng thứ tu vi: `TẦNG HIỆN TẠI: 1/9`.
* Tiến độ tu vi tầng hiện tại: `Tu vi: 0/120`.

### 3.3. Bộ 3 Thước Đo Sinh Mệnh (Status Meters)
* **Khí Huyết (HP - Máu)**: Thanh màu đỏ son thắm `100/100 HP`. (Về 0 là tử nạn).
* **Linh Khí (Qi - Năng lượng chiêu thức)**: Thanh lam ngọc dịu mát `60/100 Qi`. (Dùng để xuất tuyệt kỹ hoặc đánh thường).
* **Tu Vi (Progress - Tích lũy đột phá)**: Thanh vàng hổ phách sáng lấp lánh `0/120 Tu Vi`. (Đầy 100% kích hoạt đột phá thăng tầng).

### 3.4. Tứ Trụ Thuộc Tính Đạo Cơ (Attributes Grid 4 Cột)
4 ô vuông mạ đồng cổ cân xứng:
* `THẦN: 3` (Ý chí tinh thần, cảm tri, chính xác).
* `TÂM: 4` (Đạo tâm kiên định, chống tâm ma, huyễn thuật).
* `MẠCH: 3` (Kinh mạch cường tráng, hồi phục khí huyết).
* `VẬN: 2` (Khí vận thiên mệnh, bạo kích, cơ duyên nhặt bảo).

### 3.5. Hộp Nhiệm Vụ Mục Tiêu & Đếm Ngày (Objective & Day)
* **Mục Tiêu Thiên Mệnh (Active Quest)**: Khung viền chỉ vàng tóm tắt bước hành động cần làm tiếp theo (vd: *"Đọc lá thư và chọn cách đối diện Cụ Mai Hoa. Tìm hiểu vết nứt trong ký ức."*).
* **Đồng Hồ Ngày**: Hiển thị `NGÀY: 1` và số ngày còn lại trước hạn định hiểm họa.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & TỰ ĐỘNG KÍCH HOẠT THÔNG MINH

* **Nút bấm vật lý**: Bấm nút `[Thu nhỏ ▶]` trên đỉnh RightHUD để gấp thành *Mini Badge*.
* **Phím tắt bàn phím**: Phím `C` (Character sheet) bật / tắt nhanh toàn bộ bảng HUD.
* **Cơ Chế Bung Mở Khẩn Cấp Tự Động (Smart Emergency Auto-Open)**:
  * Khi người chơi đang ở chế độ thu gọn (*Mini Badge* hoặc *Hidden*), nếu nhân vật bị trúng đòn hoặc **Khí Huyết tụt xuống dưới 30%** -> RightHUD sẽ **lập tức tự động bung mở toàn phần** kèm viền đỏ nhấp nháy cảnh báo nguy cấp!
  * Khi thanh Tu Vi tích lũy đầy 100% -> RightHUD tự động mở ra báo hiệu sẵn sàng đột phá.
