# Đặc Tả Kỹ Thuật: CenterStagePanel (Càn Khôn Sân Khấu & Bản Đồ Toàn Cảnh)
**File ID**: `SCENE2-PANEL-03-CENTER-STAGE`  
**Đường dẫn**: `docs/plans/ui-architecture/scene2-main/03_CENTER_STAGE_PANEL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/layout/CenterStage.tsx` (`CenterStage`), `src/ui/layout/CommandBar.tsx` (`CommandBar`)  

---

## 1. MỤC ĐÍCH & Ý NGHĨA TRUNG TÂM
* **Mục đích**: Là trái tim của toàn bộ trò chơi, nơi trực tiếp hiển thị thế giới tu tiên, vị trí nhân vật, các ô kỳ ngộ, hiểm họa và tiếp nhận mọi mệnh lệnh hành động từ người chơi.
* **Nguyên tắc "Trọng Tâm Tuyệt Đối"**: CenterStage không bao giờ bị đóng hay ẩn đi. Thay vào đó, nó đóng vai trò là **tấm bạt co giãn linh hoạt (Elastic Master Canvas)**: Khi LeftRail, RightHUD hoặc Ticker đóng lại, CenterStage sẽ **tự động bung rộng kịch khung hình (từ 850px lên >1400px)**, mang lại tầm nhìn điện ảnh thênh thang.

---

## 2. BỐ CỤC XẾP DỌC TINH GỌN (VERTICAL STACK)

CenterStage gồm 3 phân khu xếp dọc từ trên xuống:
1. **Top Banners (Khẩu Quyết Chương & Cảnh Báo)**: Chiều cao `~40px`.
2. **World Map Frame (Bản Đồ Non Nước Toàn Cảnh)**: Chiếm `flex: 1 1 0; min-height: 320px` (toàn bộ diện tích khả dụng).
3. **Command Bar (Thanh Mệnh Lệnh Ngang)**: Chiều cao cố định `~95px` ở đáy sân khấu.

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

### 3.1. Phân Khu 1: Top Banners (Thông Cáo Đầu Sân Khấu)
* **Chapter Banner (Banner Chương)**:
  * Nền giấy xuyến chỉ viền xanh ngọc bích `var(--jade-500)`.
  * Cột 1: Kicker `[ CHƯƠNG HIỆN TẠI ]`.
  * Cột 2: Tên chương thư pháp (vd: *"Chương một: Phàm nhân xuất đạo"*).
  * Cột 3: Khẩu quyết chương (vd: *"Giày có mới, tìm cũ, một giỏ linh thảo làm hành trang"*).
* **Danger Banner (Banner Cảnh Báo Nguy Hiểm - Khi Cần)**:
  * Nền đỏ son chu sa nhấp nháy khi bước vào ô tử địa có quái vật ẩn nấp: `⚠ CẢNH BÁO HIỂM ĐỊA: Yêu khí lượn lờ, sát cơ tứ phía`.

### 3.2. Phân Khu 2: World Map Frame (Bản Đồ Non Nước Toàn Cảnh)
* **Bức Họa Nền Non Nước (Scene Backdrop)**:
  * Tranh phong cảnh thủy mặc khổ rộng chất lượng cao đặc trưng cho từng vùng (Thanh Mộc Thôn, Rừng Sương Mù, Sơn Môn Vân Ẩn, Nguyệt Ảnh Hồ...).
* **Lưới Ma Trận Địa Hình (World Map Grid 7×7)**:
  * Mỗi ô tương ứng với một vùng đất thực thụ.
  * **Vị trí người chơi (`player-marker`)**: Viên ngọc bích phát sáng hào quang di chuyển mượt mà giữa các ô.
  * **Các Node Địa Danh**:
    * Node Nhân Sĩ (`[Nhân]`): Màu vàng kim nhạt, có NPC đang đứng chờ.
    * Node Sự Kiện (`[Duyên]`): Màu xanh ngọc, có cơ duyên hoặc cốt truyện rẽ nhánh.
    * Node Lối Ra (`[Quan]`): Màu đồng cổ, dẫn sang bản đồ vùng lân cận.
    * Node Hiểm Họa (`[Hung]`): Màu đỏ thẫm, có yêu thú hoặc bẫy rập.
    * Ô Sương Mù: Ô chưa từng bước chân tới, phủ làn sương xám mờ ảo.
* **Huy Hiệu Vị Trí Hiện Tại (Location Badge - Góc Trên Trái)**:
  * Hộp ngọc nhỏ bán trong suốt hiển thị: *"Ngươi đang ở đây: Tên Ô (Tọa độ X·Y)"*.
* **La Bàn Phong Thủy (Compass - Góc Trên Phải)**:
  * La bàn đồng tròn nhỏ có kim từ thạch chỉ hướng Bắc (`N`).
* **Thanh Chú Giải Đáy Bản Đồ (Legend Bar)**:
  * Dải đen bán trong suốt (`backdrop-filter: blur(6px)`) gắn sát mép dưới bản đồ.
  * Toàn bộ 6 biểu tượng chú giải (*Nhân vật, Người, Sự kiện, Lối ra, Hiểm họa, Sương mù*) nằm gọn trên **1 dòng duy nhất**, không che khuất tầm nhìn.

### 3.3. Phân Khu 3: Command Bar (Thanh Mệnh Lệnh Ngang)
* **Hàng 1: Ô Gõ Lệnh Tự Do & Nút Thử Vận**:
  * Input rộng rãi: Placeholder gợi ý luân phiên (*"tu luyện"*, *"đi bắc"*, *"nói chuyện với Mai Hoa"*...).
  * Nút `Thử Vận (Act)`: Nút gradient xanh ngọc mạ vàng mộng ảo, gửi lệnh cho AI/Engine xử lý.
* **Hàng 2: Hàng Chip Hành Động Nhanh (5 Nút Thẳng Hàng)**:
  * `[ Nghỉ ]` (Rest): Hồi phục chút ít Khí Huyết và Chân Khí, trôi qua 1 lượt.
  * `[ Tu luyện ]` (Train): Tĩnh tọa hấp thu linh khí thiên địa, tích lũy điểm Tu Vi.
  * `[ Hái thảo ]` (Gather): Tìm kiếm dược liệu và khoáng thạch tại ô hiện tại.
  * `[ Di chuyển ]` (Move): Đi tuần tra hoặc hướng về phía trước.
  * `[ Quay số ]` (Draw): Thử vận khí bốc quẻ thiên cơ.
* **Hàng 3: Dòng Chỉ Dẫn Nhẹ Nhàng**:
  * Dòng chữ nhỏ thanh thoát giải thích cách thức tương tác ngôn ngữ tự do.

---

## 4. CHẾ ĐỘ THIỀN ĐỊNH TOÀN CẢNH (ZEN MODE - PHÍM TẮT `Z`)

* **Ý nghĩa**: Dành cho người chơi muốn đắm mình trọn vẹn vào thế giới non nước, ngắm tranh cảnh đẹp và di chuyển hành tẩu mà không bị bất kỳ khối UI nào làm xao nhãng.
* **Hành vi khi ấn phím `Z`**:
  1. LeftRail tự động thu gọn về `0px`.
  2. RightHUD tự động thu gọn về `0px` (hoặc mini badge mờ).
  3. ChronicleTicker tự động gấp xuống `0px`.
  4. TopBar tự động trượt lên trên ẩn đi.
  5. **Bản đồ CenterStage bung rộng 100% toàn màn hình (`100vw × calc(100vh - 110px)`)!**
* **Thoát Zen Mode**: Ấn lại phím `Z`, toàn bộ các thanh công cụ khôi phục lại vị trí ban đầu.
