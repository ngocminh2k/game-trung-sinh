# Đặc Tả Kỹ Thuật: CombatEncounterModal (Võ Đài Giao Tranh Sinh Tử)
**File ID**: `MODAL-02-COMBAT`  
**Đường dẫn**: `docs/plans/ui-architecture/modals/02_COMBAT_ENCOUNTER_MODAL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/layout/CenterStage.tsx` (`.encounter-banner`, `.encounter-actions`)  

---

## 1. MỤC ĐÍCH & NGỮ CẢNH XUẤT HIỆN
* **Mục đích**: Hiện thực hóa hệ thống giao tranh mang tính xác định (Deterministic Combat). Khi người chơi đối mặt với yêu thú, tà tu hoặc quái dị trong cấm địa, giao diện chuyển sang trạng thái chiến đấu tập trung cao độ.
* **Nguyên tắc thiết kế**: Thay vì mở ra một cửa sổ popup che khuất tầm nhìn, giao tranh sẽ **chiếm quyền điều khiển trực tiếp trên CenterStage (In-Place Takeover)**: Bản đồ chuyển thành võ đài đối kháng, loại bỏ mọi yếu tố gây xao nhãng.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & BỐ CỤC (LAYOUT)

* **Vị trí**: Thay thế trực tiếp khung bản đồ trong `CenterStage` (`.stage-surface`).
* **Kích thước**: Chiếm 100% diện tích của Sân khấu trung tâm (`width: 100%; min-height: 480px`).
* **Cấu trúc chia 2 nửa đối xứng**:
  * **Nửa trên (Sàn đấu & Địch thủ)**: Chiếm 65% chiều cao.
  * **Nửa dưới (Bảng quyết sách chiêu thức)**: Chiếm 35% chiều cao.

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN

### 3.1. Phân Khu Địch Thủ (Enemy Arena)
* **Hình Ảnh Đối Thủ (Enemy Portrait & Art)**: Tranh minh họa quái vật/địch thủ hùng dũng ở trung tâm sàn đấu (vd: *Hắc Xà Yêu Hóa*, *Khôi Lỗi Thủ Hộ*).
* **Tên & Cảnh Giới Đối Thủ**: Tiêu đề in đậm màu đỏ son kèm đẳng cấp (vd: *"Hắc Thiết Cuồng Viên — Nhị Giai Yêu Thú"*).
* **Thanh Khí Huyết Kẻ Địch (Enemy HP Bar)**:
  * Thanh máu màu đỏ thắm to bản chạy ngang phía dưới tên địch.
  * Chỉ số số liệu cụ thể: `Máu hiện tại / Máu tối đa` (vd: `140/200 HP`).
  * Hiệu ứng rung nhẹ khi bị trúng đòn (`shake animation`).

### 3.2. Bảng Xuất Chiêu (Combat Action Dock)
Gồm 4 khối nút bấm chiến thuật lớn, mạ viền kim loại cổ, có hiển thị tiêu hao tài nguyên:

1. **Nút `Đánh Thường (Basic Strike)`**:
   * Tiêu hao: `0 HP` | Tiêu hao `4 Chân Khí (Qi)`.
   * Gây sát thương cơ bản dựa trên chỉ số Thần và Mạch của nhân vật.
   * Tự động nhận tiêu điểm (Auto-focus) ngay khi bước vào trận để người chơi có thể ấn `Enter` đánh ngay.
2. **Các Nút `Kỹ Năng Độc Môn (Techniques)`**:
   * Danh sách các công pháp người chơi đã học (vd: *"Vân Ẩn Kiếm Quyết"*, *"Kinh Lôi Chưởng"*).
   * Hiển thị tiêu hao Chân Khí tương ứng (vd: `12 Qi`).
   * Hiệu ứng sát thương bạo kích hoặc kèm hiệu ứng phá giáp.
3. **Nút `Thủ Thế (Defend)`**:
   * Giảm 50% sát thương nhận vào trong lượt tiếp theo của kẻ địch.
   * Hồi phục nhẹ 2-4 điểm Chân Khí.
4. **Nút `Rút Lui (Retreat)`**:
   * Thoát khỏi trận chiến an toàn.
   * Phạt: Khấu trừ một lượng Khí Huyết nhất định (vd: `−15 HP`) do bị địch truy kích từ phía sau.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & TƯƠNG TÁC BÀN PHÍM

* **Điều kiện Kích hoạt (Enter Combat)**:
  1. Người chơi di chuyển vào ô có quái vật/hiểm họa (`node.kind === 'danger'`).
  2. Người chơi chủ động bấm nút "Bước vào giao chiến" từ Banner cảnh báo.
* **Điều kiện Kết thúc (Exit Combat)**:
  1. **Chiến Thắng**: HP đối thủ về `0` -> Kích hoạt âm thanh kiếm kích đắc thắng, thưởng chiến lợi phẩm (Đan dược / Linh thạch), đóng chế độ giao tranh, trả lại bản đồ non nước.
  2. **Rút Lui Thành Công**: Nhấn nút `Rút Lui` -> Trừ máu nhân vật, lùi nhân vật về ô an toàn trước đó, đóng giao tranh.
  3. **Thất Bại (Tử Nạn)**: HP người chơi về `0` -> Kích hoạt `DeathScreen` / `EndingScreen`.
* **Phím Tắt Hỗ Trợ**:
  * Phím `1`: Đánh thường.
  * Phím `2`, `3`: Dùng các tuyệt kỹ công pháp.
  * Phím `4`: Thủ thế.
  * Phím `R` hoặc `Esc`: Rút lui.
