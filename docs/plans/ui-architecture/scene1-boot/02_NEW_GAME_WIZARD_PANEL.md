# Đặc Tả Kỹ Thuật: NewGameWizardPanel (Chọn Khởi Nguyên & Hệ Thống)
**File ID**: `SCENE1-PANEL-02-NEW-GAME-WIZARD`  
**Đường dẫn**: `docs/plans/ui-architecture/scene1-boot/02_NEW_GAME_WIZARD_PANEL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/MainMenu.tsx` (`NewGameScreen`)  

---

## 1. MỤC ĐÍCH & Ý NGHĨA HỆ THỐNG
* **Mục đích**: Cho phép người chơi định hình nhân vật trước khi giáng thế: Thiết lập độ thử thách của Đạo Tâm (Độ khó), và ký kết Khế Ước với một trong các Hệ Thống Trùng Sinh bí ẩn (hoặc kiên định từ chối để tự lực cánh sinh).
* **Hình thức**: Trình thiết lập 3 bước (3-Step Wizard) hiển thị trên một cuộn tranh thư tịch cổ mở rộng.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & BỐ CỤC TRÊN MÀN HÌNH

* **Vị trí**: Đặt chính giữa màn hình (`top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 50`).
* **Kích thước**: `width: min(1180px, 94vw); height: min(760px, 90vh);`.
* **Cấu trúc Không Gian**:
  * Trục cuốn thư tịch bằng gỗ lim ở 2 biên trái/phải.
  * Nền giấy xuyến chỉ vàng ngà dệt gấm, có chia thành 3 phân vùng ngang mượt mà.

---

## 3. NỘI DUNG CHI TIẾT 3 BƯỚC KHỞI NGUYÊN

### 3.1. Bước 1: Chọn Độ Khó Đạo Tâm (3 Thẻ Bài Ngang)
* **Thẻ 1: Phàm Nhân (Cozy / Story Mode)**:
  * Biểu tượng: Bông lúa vàng bình yên.
  * Đặc điểm: Giảm 30% sát thương quái vật, rút lui không bị khấu trừ máu, hạn định 12 đêm nới lỏng.
* **Thẻ 2: Cân Bằng (Balanced / Canon Mode)**:
  * Biểu tượng: Cân tiểu ly âm dương.
  * Đặc điểm: Đúng quy chuẩn tiểu thuyết xianxia nguyên bản, thử thách hợp lý, trải nghiệm chuẩn tác giả.
* **Thẻ 3: Nghịch Thiên (Hardcore / Iron Mode)**:
  * Biểu tượng: Lưỡi đao vỡ dính máu.
  * Đặc điểm: Quái vật dữ dằn, tài nguyên khan hiếm, hạn định hiểm họa trừng phạt cực gắt.

### 3.2. Bước 2: Ma Trận 6 Khế Ước Hệ Thống (Lưới 3×2)
Mỗi khế ước là một thẻ ngọc bài hình chữ nhật đứng có hiệu ứng phát sáng khi được chọn:

1. **Hệ Thống Chiến Đấu (Battle System)**:
   * Khẩu hiệu: *"Muốn trèo lên đỉnh đại đạo, phải giẫm lên máu tươi của vạn giới."*
   * Hiệu ứng: Ban kiếm khí, tăng 20% sát thương đòn đánh thường, thưởng thêm điểm khi diệt địch.
2. **Hệ Thống Thu Thập (Gathering System)**:
   * Khẩu hiệu: *"Dưới chân kẻ phàm trần là đất đá, dưới chân ngươi là vạn gốc linh dược."*
   * Hiệu ứng: Tăng gấp đôi sản lượng thảo dược, tăng xác suất đào trúng tiên thảo ngàn năm.
3. **Hệ Thống Đan Đạo (Alchemy System)**:
   * Khẩu hiệu: *"Linh căn có thể phế, nhưng thần đan có thể nghịch thiên cải mệnh."*
   * Hiệu ứng: Tăng hiệu quả hấp thu đan dược thêm 50%, giảm tiêu hao dược liệu khi luyện chế.
4. **Hệ Thống Cơ Duyên (Destiny System)**:
   * Khẩu hiệu: *"Người tính không bằng trời tính; nhưng trời đã đứng về phía ngươi."*
   * Hiệu ứng: Khởi đầu với chỉ số `VẬN: 5`, dễ gặp các kỳ ngộ hang động và bảo vật rơi từ trời.
5. **Hệ Thống Báo Thù (Vengeance System)**:
   * Khẩu hiệu: *"Nợ máu tiền kiếp, đời này phải hoàn trả gấp trăm lần."*
   * Hiệu ứng: Tăng 30% sát thương bạo kích khi giáp mặt những kẻ thù có liên hệ tiền kiếp.
6. **Từ Chối Hệ Thống (Reject System / Self-Reliance)**:
   * Khẩu hiệu: *"Ta mệnh do ta không do trời, càng không do bất kỳ hệ thống nào sai khiến."*
   * Hiệu ứng: Không có nhiệm vụ gò bó, nhận danh hiệu "Nghịch Mệnh Đạo Tâm", tự do tuyệt đối.

### 3.3. Bước 3: Xác Nhận & Nhập Đạo (Footer Bar)
* Hiển thị tóm tắt lựa chọn: Độ khó đã chọn + Hệ thống đã chọn.
* Nút `Ký Khế Ước & Nhập Đạo`: Nút vàng son rực rỡ, hiệu ứng viền sáng chạy quanh.
* Nút `Quay Lại Sảnh`: Hủy bỏ lựa chọn, trở về Main Menu.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & PHÍM TẮT

* **Mở ra**: Khi bấm "Khởi Đạo Mới" từ Sảnh chính, hoặc khi chọn một ô nhớ trống trong Save Slots.
* **Đóng lại**:
  * Bấm nút `Quay Lại` hoặc phím `Esc` -> Cuộn tranh thu gọn về tâm, quay về Sảnh chính.
  * Bấm `Ký Khế Ước` -> Kích hoạt âm thanh chuông ngọc và chuyển sang màn `LoadingTransition`.
