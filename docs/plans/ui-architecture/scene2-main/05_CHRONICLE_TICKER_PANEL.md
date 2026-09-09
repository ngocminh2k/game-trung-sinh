# Đặc Tả Kỹ Thuật: ChronicleTickerPanel (Biên Niên Ký & Linh Thông Đài - Đáy Màn Hình)
**File ID**: `SCENE2-PANEL-05-CHRONICLE-TICKER`  
**Đường dẫn**: `docs/plans/ui-architecture/scene2-main/05_CHRONICLE_TICKER_PANEL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/screens.css` (`.ticker`), `src/ui/GameScreen.tsx`  

---

## 1. MỤC ĐÍCH & Ý NGHĨA HỆ THỐNG
* **Mục đích**: Là nơi ghi chép theo dòng thời gian toàn bộ các biến cố, bước chân, chiến tích, lời đàm thoại và sự kiện diễn ra trong thế giới tu tiên. Đồng thời tích hợp **Linh Thông Đài (Quick Chat)** cho phép người chơi trực tiếp đàm đạo với Hệ Thống AI hoặc hỏi han tin tức nhân gian.
* **Giải pháp chống chật chội**: Hỗ trợ **3 chế độ hiển thị linh hoạt**, cho phép thu gọn thành một dòng lụa mỏng thanh nhã hoặc ẩn hoàn toàn để giải phóng tới gần 90px chiều cao cho bản đồ.

---

## 2. 3 TRẠNG THÁI HIỂN THỊ (DISPLAY MODES)

| Chế độ | Kích thước | Mô tả giao diện | Tác động lên không gian bản đồ |
| :--- | :---: | :--- | :--- |
| **1. Mở Rộng Đầy Đủ (`Expanded`)** | `height: 120px` | Xem danh sách 8 - 10 biến cố gần nhất có thanh cuộn riêng + Ô chat nhanh đối thoại AI với Hệ Thống (*"Hỏi Hệ Thống..."* + Nút `Nói chuyện`). Có nút thu nhỏ `[▼]`. | Bản đồ giữ chiều cao chuẩn thoải mái. |
| **2. Dải Lụa Một Dòng (`Compact 1-Line`)** | `height: 32px` | Thu gọn thành một dải lụa chữ chạy ngang đáy, chỉ hiển thị duy nhất 1 dòng sự kiện mới nhất (vd: *"Người tình dậy tại làng Thanh Mộc..."*). Có nút mở rộng `[▲]`. | **Bản đồ trung tâm tăng thêm gần 90px chiều cao!** |
| **3. Ẩn Hoàn Toàn (`Hidden`)** | `height: 0px` | Gấp phẳng xuống mép đáy màn hình. | **Bản đồ chạm sát chân màn hình kịch biên!** |

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

### 3.1. Dải Tiêu Đề & Nút Thu/Phóng (Header Bar)
* **Kicker**: `BIÊN NIÊN KÝ` màu vàng kim cổ điển.
* **Bộ Đếm Biến Cố**: Huy hiệu nhỏ hiển thị tổng số sự kiện ghi nhận (vd: `[ 18 biến cố ]`).
* **Dòng Biến Cố Mới Nhất**: Đoạn chữ tóm tắt biến cố vừa diễn ra (in nghiêng màu ngọc bích).
* **Nút Thu Phóng Vật Lý**: Nút `[▲ Mở Rộng]` khi đang ở dạng 1 dòng, hoặc nút `[▼ Thu Gọn]` khi đang ở dạng đầy đủ.

### 3.2. Danh Sách Nhật Ký Sự Kiện (Event History List - Khi Mở Rộng)
Danh sách cuộn dọc mượt mà gồm các dòng sự kiện kèm chấm tròn màu phân loại (`.ticker-dot`):
* **Chấm Xanh Ngọc (`--jade-300`)**: Sự kiện Cốt truyện & Đối thoại NPC.
* **Chấm Đỏ Son (`--vermilion-300`)**: Sự kiện Giao tranh, tung đòn, nhận sát thương.
* **Chấm Vàng Hoàng Kim (`--gold-400`)**: Nhặt được dược thảo, mua bán tiền bạc, chế đan.
* **Chấm Lam Sương Mù (`--mist-300`)**: Nhận nhiệm vụ, bước qua lối rẽ, chuyển vùng bản đồ.
* **Chấm Vàng Lấp Lánh (`--gold-glow`)**: Mở khóa Thành Tựu, đột phá cảnh giới tu vi.

### 3.3. Ô Chat Nhanh Hệ Thống (Linh Thông Đài - AI Quick Chat)
* Đặt gọn ở góc phải của thanh đáy:
  * Ô nhập văn bản nhỏ gọn: Placeholder *"Hỏi Hệ Thống..."*.
  * Nút `Nói chuyện`: Nút nhỏ màu ngọc bích gửi câu hỏi trực tiếp cho Hệ Thống AI.
  * Phản hồi từ Hệ Thống sẽ hiển thị lập tức vào dòng nhật ký sự kiện với giọng điệu riêng biệt theo tính cách của Hệ Thống đã chọn (Chiến Đấu, Cơ Duyên, Thu Thập...).

---

## 4. CƠ CHẾ ĐÓNG / MỞ & PHÍM TẮT TOÀN CỤC

* **Nút bấm vật lý**: Click vào nút `[▲]` / `[▼]` ở góc thanh đáy để chuyển giữa *Expanded (120px)* ↔ *Compact 1-Line (32px)*.
* **Phím tắt bàn phím**: Phím `L` (Log) để mở rộng hoặc thu gọn nhật ký bất kỳ lúc nào.
* **Tự động kích hoạt thông minh**:
  * Khi có sự kiện đặc biệt (vd: *Đột phá thành công* hoặc *Mở khóa danh hiệu mới*), thanh đáy tự động mở hé dòng chữ phát sáng trong 3 giây để người chơi nắm bắt thông tin, sau đó tự thu về dạng 1 dòng.
