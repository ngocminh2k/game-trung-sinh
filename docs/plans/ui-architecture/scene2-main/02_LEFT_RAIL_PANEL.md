# Đặc Tả Kỹ Thuật: LeftRailPanel (Lục Đạo Hành Nang - Cột Trái)
**File ID**: `SCENE2-PANEL-02-LEFT-RAIL`  
**Đường dẫn**: `docs/plans/ui-architecture/scene2-main/02_LEFT_RAIL_PANEL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/layout/LeftRail.tsx` (`LeftRail`), `src/ui/gameScreen/panels.tsx`  

---

## 1. MỤC ĐÍCH & Ý NGHĨA HỆ THỐNG
* **Mục đích**: Là nơi lưu trữ và điều khiển 6 phân hệ phụ trợ quan trọng: *Nhân sĩ địa phương, Khí huyết tu vi, Hành trang túi đồ, Phố chợ buôn bán, Đạo đồ công pháp, và Khế ước hệ thống*.
* **Giải pháp chống chật chội**: Thay vì luôn mở rộng chiếm 280px chèn ép bản đồ, LeftRail hỗ trợ **3 chế độ hiển thị linh hoạt** giúp người chơi thu gọn thành dải icon thanh nhã hoặc ẩn hoàn toàn.

---

## 2. 3 TRẠNG THÁI HIỂN THỊ (DISPLAY MODES)

| Chế độ | Kích thước | Mô tả giao diện | Tác động lên Bản Đồ Trung Tâm |
| :--- | :---: | :--- | :--- |
| **1. Mở Rộng (`Expanded`)** | `width: 280px` | Cột Tab bar dọc (56px) + Khung nội dung thẻ (224px). Có nút `[◀ Thu gọn]` và `[✕ Đóng]`. Thích hợp khi đang quản lý đồ hoặc mua bán. | Bản đồ chiếm chiều rộng chuẩn ~850px. |
| **2. Dải Biểu Tượng (`Icon Strip`)** | `width: 56px` | Chỉ giữ lại 6 icon thanh mảnh sát mép trái kèm số đếm badge đỏ. Bấm vào icon nào thì khung nội dung trượt ra dạng Drawer nổi. | **Bản đồ tự động bung rộng thêm 224px!** |
| **3. Ẩn Hoàn Toàn (`Hidden`)** | `width: 0px` | Thu giấu hoàn toàn vào mép trái, chỉ còn 1 tai nắm nhỏ mạ vàng `[ ☰ ]` hoặc `[ ▶ ]` mờ ảo ở mép. | **Bản đồ mở rộng kịch mép trái màn hình!** |

---

## 3. NỘI DUNG CHI TIẾT 6 SUB-PANELS (KHI MỞ NỘI DUNG)

### 3.1. Tab 1: `Nhân Sĩ (People)` (Phím tắt: `P`)
* **Badge**: Số lượng NPC đang có mặt tại địa điểm hiện tại (vd: `7`).
* **Nội dung**:
  * Danh sách thẻ bài NPC (vd: *Cụ Mai Hoa, Trương Thiết Thợ Rèn, Tiểu Thúy...*).
  * Mỗi thẻ gồm: Avatar chân dung nhỏ, Tên danh hiệu, Thân phận, Thanh điểm Hảo cảm (Affection).
  * Nút thao tác nhanh: `Nói chuyện`, `Tặng lễ vật`, `Thỉnh giáo võ học`.

### 3.2. Tab 2: `Khí Huyết (Vitals)`
* **Badge**: Cảnh giới viết tắt (vd: `LK-1`).
* **Nội dung**:
  * Chi tiết Cảnh giới: Luyện Khí tầng 1/9 (`Tiến độ: 0/120`).
  * Chi tiết Linh Căn: Thuộc tính linh căn (Mộc/Hỏa/Thủy/Kim/Thổ), Phẩm cấp (Phế căn / Hạ phẩm / Trung phẩm), Hiệu suất hấp thu linh khí (`45%`).
  * Danh mục kinh mạch khai thông: Tình trạng 8 mạch kỳ kinh.

### 3.3. Tab 3: `Hành Trang (Items)` (Phím tắt: `B` hoặc `I`)
* **Badge**: Số lượng vật phẩm đang mang theo / Dung lượng tối đa (vd: `4/50`).
* **Nội dung**:
  * Lưới túi đồ 50 ô (Inventory Grid) phân loại thành: *Đan Dược / Vũ Khí / Giáp Trụ / Bí Tịch / Kỳ Vật*.
  * Thẻ chi tiết vật phẩm: Tranh minh họa, tên, phẩm cấp, công dụng, giá trị.
  * Các nút thao tác: `Dùng đồ` (nuốt đan), `Trang bị` (cầm kiếm), `Cất vào kho`, `Vứt bỏ`.

### 3.4. Tab 4: `Phố Chợ (Market)` (Phím tắt: `M`)
* **Badge**: `0` nếu không ở chợ, `1` nếu đang đứng ở chợ.
* **Nội dung**:
  * Bộ chuyển đổi 2 chế độ: `[ Mua Hàng ]` và `[ Bán Ra ]`.
  * Danh mục các mặt hàng thương nhân làng bày bán: Thảo dược, Đan hoàn, Bùa chú, Khí giới thô sơ.
  * Giá niêm yết bằng Vàng hoặc Bạc kèm nút `Mua nhanh`.

### 3.5. Tab 5: `Đạo Đồ (Path)`
* **Badge**: Số lượng tuyệt kỹ đã lĩnh ngộ (vd: `2`).
* **Nội dung**:
  * Cây công pháp tu tiên (Techniques Tree): Công pháp tâm pháp đã học, cấp độ lĩnh ngộ (vd: *Vân Ẩn Kiếm Quyết tầng 1*).
  * Bia đá khắc họa Thành tựu & Danh hiệu đạt được (vd: *Bước Đầu Tiên, Dược Đồng Thần Nông*).

### 3.6. Tab 6: `Hệ Thống (System)`
* **Badge**: Số nhiệm vụ hệ thống đang chờ nhận / hoàn thành (vd: `6`).
* **Nội dung**:
  * Tên Khế Ước Hệ Thống đang ký kết (vd: *Hệ Thống Chiến Đấu*).
  * Danh sách Nhiệm Vụ Bí Mật do Hệ Thống ban bố (vd: *Chiến Đấu I: Thử Thách Máu - Thắng 3 trận giao tranh*).
  * Điểm cống hiến tích lũy và nút `Nhận thưởng`.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & PHÍM TẮT TOÀN CỤC

* **Nút bấm vật lý**:
  * Nút `[◀]` trên đỉnh LeftRail: Thu gọn từ *Expanded* về *Icon Strip*.
  * Nút `[✕]` hoặc click vào icon đang active: Đóng khung nội dung.
* **Phím tắt bàn phím**:
  * `Tab`: Mở rộng / Thu gọn nhanh LeftRail.
  * `B` hoặc `I`: Bật thẳng tab **Hành trang**.
  * `P`: Bật thẳng tab **Nhân sĩ**.
  * `M`: Bật thẳng tab **Phố chợ**.
  * `Esc`: Thu gọn ngay lập tức khung nội dung đang mở.
* **Tự động kích hoạt thông minh**:
  * Khi người chơi bước vào ô Chợ (`market`) -> LeftRail tự động bung tab Chợ.
  * Khi nhặt được vật phẩm mới -> Icon Hành trang phát sáng nhẹ thu hút sự chú ý.
