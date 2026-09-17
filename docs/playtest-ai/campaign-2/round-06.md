# Campaign 2 — Vòng 06: Thẩm Định Kinh Tế 4 Tầng Tiền Tệ & ROI Từng Nghề (B6, C3)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B6] Kinh tế 4 tầng tiền tệ + cửa hàng | [C3] Cân bằng kinh tế — ROI từng nghề  
**Nhóm Persona tham gia khảo sát:**
- `p06` (Diamond - Spreadsheet Player): Lập bảng cân đối thu chi, đo tỷ lệ lạm phát.
- `p15` (Heart - Skeptic): Đo ROI tối ưu của từng nghề, tìm điểm khai thác lỗi.
- `p13` (Heart - Cartographer): Đo chi phí di chuyển giữa các vùng kinh tế.
- `p10` (Club - Casual Mobile): Không đọc hướng dẫn, chỉ bấm xem có tự hiểu được giá cả không.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Economy Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B6: 4 tầng tiền tệ** | Đồng → Bạc → Vàng → Linh Thạch. Tỷ giá tĩnh: 100 Đồng = 1 Bạc, 100 Bạc = 1 Vàng, 10 Vàng = 1 Hạ Phẩm Linh Thạch | `src/engine/economy.ts`, `src/engine/constants.ts` | ✅ Đạt |
| **B6: Cửa hàng** | Danh mục cửa hàng theo vùng (Tạp Hóa Làng, Phường Thị, Tàng Bảo Các Tông Môn) có động giá theo tồn kho | `src/content/shops.ts` (1057 dòng), `src/engine/shopStock.ts` | ✅ Đạt |
| **C3: ROI từng nghề** | Hái thảo: ~36.3% (đã đo). Khảo sát bổ sung: Săn yêu thú ~48%, Luyện đan bán ~62%, Chạy vận tiêu ~28% | Phân tích tĩnh từ `items.ts`, `alchemy.ts`, `beasts.ts` | ✅ Đạt |

### Bảng cân đối ROI nghề nghiệp (khảo sát bổ sung — 100 chu kỳ/hồ sơ)

| Nghề | Thu nhập gộp/chu kỳ | Chi phí đầu tư | Rủi ro | ROI ròng |
|---|---:|:---:|:---:|:---:|
| Hái thảo (Rừng Sương Mù) | 60 Bạc | 44 Bạc | Thấp | **36.3%** |
| Săn yêu thú (Rừng Sương Mù) | 92 Bạc | 62 Bạc (thuốc + vũ khí) | Trung | **48.4%** |
| Luyện đan bán (Dược Viên) | 145 Bạc | 90 Bạc (thảo + lò + khí) | Trung | **61.1%** |
| Chạy vận tiêu (đường trường) | 74 Bạc | 58 Bạc (lương khô + phí) | Cao | **27.6%** |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p06 (Spreadsheet Player):
> *"Bảng tỷ giá tĩnh 100 Đồng = 1 Bạc là hợp lý trong 30 ngày đầu, không có lạm phát. Nhưng tôi phát hiện một lỗ hổng: Mua thảo dược ở Làng với giá 2 Bạc/bó, mang sang Phường Thị Tiên gia bán được 3.5 Bạc/bó. Chênh lệch 75% — nhưng vì túi đồ giới hạn 30 ô, người chơi có thể lạm dụng thành 'người vận chuyển bất hợp pháp'."*
* **Đề xuất tính năng:** Thêm cơ chế `Thuế Chợ Phiên (Market Toll)`: Bán hàng ở chợ khác vùng bị trừ 15% giá trị, buộc người chơi phải cân nhắc giữa lợi nhuận và công sức vận chuyển.

### 🗣️ p15 (Skeptic / Optimizer):
> *"Luyện đan bán là nghề lãi nhất (ROI 61%), nhưng đòi hỏi kỹ năng luyện đan cấp 2 trở lên và 20 ngày cày cuốc. Đây là mức thiết kế 'đầu tư cao, lợi nhuận cao' hoàn toàn hợp lý. Tôi thích!"*
* **Đềxuất tính năng:** Thêm bảng xếp hạng `Bảng Phong Thần Nghề Nghiệp` trong Codex, ghi danh người chơi đạt mốc lợi nhuận cao nhất ở từng nghề.

### 🗣️ p13 (Cartographer):
> *"Tôi đi từ Làng Thanh Mộc đến Hắc Phong Cốc mất 3 ngày in-game, tốn 12 Bạc tiền trọ và 8 Bạc lương khô. Chi phí di chuyển này khiến cho nghề chạy vận tiêu gần như không có lãi. Tôi muốn có một tuyến đường tắt đổi lấy rủi ro nguy hiểm."*
* **Đề xuất tính năng:** Mở `Đường Mòn Hiểm (Perilous Shortcut)`: Tuyến đường giữa hai vùng, tiết kiệm 50% thời gian nhưng có 40% tỷ lệ gặp cường đạo hoặc yêu thú cấp cao.

### 🗣️ p10 (Casual Mobile):
> *"Tôi không hiểu tại sao có 4 loại tiền. Tôi chỉ muốn mua cái bánh bao mà phải nhìn tới Đồng, Bạc, Vàng... Hơi rối với người chơi mới."*
* **Đề xuất tính năng:** Thêm nút `Tự động quy đổi tiền tệ` (Auto-Convert): Khi túi Đồng vượt 100, tự động đổi sang Bạc và thông báo nhẹ nhàng. Bật mặc định cho chế độ Story.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Thuế Chợ Phiên (Market Toll):** **CHẤP NHẬN (Ưu tiên Cao)** — Bịt lỗ hổng arbitrage 75%, giữ cân bằng kinh tế vĩ mô.
2. **Bảng Phong Thần Nghề Nghiệp:** **CÂN NHẮC (Giai đoạn sau)** — Tính năng mở rộng, chưa cấp thiết cho phiên bản Gold Master.
3. **Đường Mòn Hiểm (Perilous Shortcut):** **CHẤP NHẬN** — Tăng chiều sâu chiến lược cho nhóm Explorer, tận dụng hạ tầng `danger.ts` sẵn có.
4. **Tự động quy đổi tiền tệ:** **CHẤP NHẬN (Chỉ ở Story mode)** — Cải thiện Onboarding cho Casual, không ảnh hưởng người chơi kỳ cựu (họ có thể tắt).
