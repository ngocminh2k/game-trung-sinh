# Campaign 2 — Vòng 10: Thẩm Định Hạ Tầng Kích Nạp & Lập Ranh Giới Đạo Đức (D1–D6, E-PLUS, E-MINUS)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2 — **ĐIỂM GIỮA CHIẾN DỊCH (MIDPOINT SUMMIT)**  
**Tiêu điểm Checklist:** [D1–D6] Hạ tầng kích nạp | [E-PLUS] Thủ thuật hợp lệ | [E-MINUS] Dark patterns bị từ chối  
**Toàn bộ 20 Persona tham gia bỏ phiếu & tranh luận.** 4 nhóm đại diện:
- `F2P (Free-to-Play)`: `p01`, `p03`, `p07`, `p11`, `p13`, `p16`, `p17` — Bảo vệ sự công bằng, phản đối Pay-to-Win.
- `Dolphin (Người chơi sẵn sàng trả vừa phải)`: `p05`, `p06`, `p08`, `p09`, `p12` — Muốn giá trị rõ ràng, tôn trọng tiền bạc.
- `Whale Potential (Người chơi sẵn sàng chi lớn)`: `p02`, `p04` — Muốn tiến độ nhanh và đồ độc quyền, nhưng ghét bị lừa.
- `Churn Risk / Casual`: `p10`, `p14`, `p15`, `p18`, `p19`, `p20` — Nhạy cảm với pop-up ép nạp, bỏ game ngay nếu thấy bẫy.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Monetization Audit)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **D1: Cổng thanh toán / IAP** | **0 dòng code**: Không có Stripe, Apple IAP, Google Play Billing, PayPal, VNPay | Quét toàn bộ `src/` | ❌ Chưa có |
| **D2: Gói khởi đầu / trả tiền** | **0 vật phẩm**: Toàn bộ 1025 dòng `items.ts` đều mua bằng tiền in-game (Đồng/Bạc/Vàng/Linh Thạch) | `src/content/items.ts` | ❌ Chưa có |
| **D3: Tiền tệ Premium** | Không có tiền tệ thứ 5 tách khỏi Linh Thạch | `src/engine/economy.ts` | ❌ Chưa có |
| **D6: Bảng tỷ lệ rơi minh bạch** | Không có lootbox trả tiền; xổ số in-game (`lottery.ts`) dùng tiền thường | `src/engine/lottery.ts` | ⚠️ Miễn trừ (chưa có gacha) |

---

## 2. Diễn Đàn Tranh Luận & Góp Ý Của 20 Personas Về Kích Nạp

### 🛡️ Tiếng nói từ nhóm F2P (`p03`, `p11`, `p17`):
> *"Chúng tôi đến với 'Phế Căn Ký' vì triết lý: Kẻ phế căn có thể tự lực nghịch thiên bằng ý chí. Nếu game bán một viên đan dược giá 50 nghìn VND giúp một bước lên Trúc Cơ mà không cần tu luyện, thì TOÀN BỘ Ý NGHĨA CỦA CỐT TRUYỆN SẼ SỤP ĐỔ! Người chơi F2P sẽ cảm thấy mình là công cụ mua vui cho kẻ có tiền."*
* **Lập trường:** Phản đối bán sức mạnh trực tiếp (Direct Power). Chấp nhận bán tiện ích (QoL) và ngoại trang (Cosmetics).

### 🐬 Tiếng nói từ nhóm Dolphin (`p06`, `p08`):
> *"Tôi đi làm, có thu nhập và không có 4 tiếng mỗi ngày để ngồi cày thảo dược. Tôi SẴN SÀNG trả 50k–100k mỗi tháng nếu game đem lại niềm vui. Tôi muốn: Thẻ Tháng Tu Tiên (mỗi ngày đăng nhập tặng một ít Linh Thạch để mua đồ linh tinh), hoặc Quỹ Trưởng Thành (mua 1 lần, lên cấp Luyện Khí nhận quà). Nhưng giá phải rõ ràng, không chiêu trò."*
* **Đề xuất tính năng:** 
  1. `Thẻ Tháng Tu Tiên (Monthly Cultivation Pass)`: Giá tương đương 1 ly cà phê (~49k VND), mỗi ngày đăng nhập tặng 10 Hạ Phẩm Linh Thạch + 1 lần bế quan nhân đôi.
  2. `Quỹ Trưởng Thành (Growth Fund)`: Trả 1 lần, mở khóa phần thưởng Linh Thạch khi đạt các mốc cảnh giới (Tầng 3, 6, 9, Trúc Cơ).

### 🐳 Tiếng nói từ nhóm Whale (`p02`, `p04`):
> *"Tôi muốn sự khác biệt đẳng cấp, nhưng tôi khinh thường những game dùng pop-up đếm ngược 15 phút giả mạo để lừa tôi nạp tiền. Hãy cho tôi thứ xứng đáng: Trang phục nhân vật phong cách Thủy Mặc phát sáng, hiệu ứng xuất chiêu Kiếm Khí màu Bạch Kim, hoặc Động Phủ riêng được trang hoàng lộng lẫy."*
* **Đề xuất tính năng:**
  1. `Ngoại Trang Thủy Mặc Độc Quyền (Ink Art Skins)`: Thay đổi hình ảnh nhân vật và hiệu ứng chiêu thức, không cộng chỉ số chiến đấu (hoặc chỉ cộng điểm Hảo Cảm với NPC).
  2. `Gói Khởi Đầu Tân Thủ (First Purchase Starter Pack)`: Tặng 1 thanh kiếm tạo hình đẹp + 1 bộ áo trúc danh sĩ, giá tượng trưng (~20k VND).

### ⚠️ Tiếng nói từ nhóm Churn Risk (`p18`, `p20`):
> *"Tôi vừa đi làm về mệt mỏi, nếu mở game lên mà thấy 3 cái pop-up 'NẠP NGAY ƯU ĐÃI 999%' đập vào mặt thì tôi XÓA GAME NGAY LẬP TỨC trong 5 giây! Hãy để tôi chơi yên tĩnh. Khi nào tôi thích game tự tôi sẽ tìm chỗ ủng hộ tác giả."*
* **Lập trường:** Cấm tuyệt đối pop-up ép nạp khi khởi động game. Nút nạp tiền chỉ được nằm kín đáo trong góc Cửa Hàng.

---

## 3. Bản Biểu Quyết Triage: Ranh Giới Đạo Đức & Quy Chuẩn Kích Nạp

Hội nghị 20 Personas chính thức thông qua **Bộ Quy Chuẩn Kích Nạp 2.0**:

### ✅ NHÓM ĐƯỢC PHÉP THIẾT KẾ (E-PLUS ACCEPTED):
1. **[E1] Gói Khởi Đầu Tân Thủ (Starter Pack):** Giá minh bạch, hiển thị đúng vật phẩm nhận được, không dùng mác "giảm giá 90% ảo".
2. **[E2] Thẻ Tháng Tu Tiên (Monthly Pass):** Hoàn lại giá trị theo thời gian đăng nhập, không tạo áp lực.
3. **[E3] Quỹ Trưởng Thành (Growth Fund):** Gắn liền với tiến trình nỗ lực chơi game (đạt cảnh giới mới được nhận).
4. **[E4] Ngoại trang & Hiệu ứng Thủy Mặc (Cosmetics):** Không pay-to-win, thuần túy thẩm mỹ và danh dự.
5. **[E5] Cổng ủng hộ nhà phát triển (Tip Jar / Supporter Edition):** Người chơi mua để ghi danh vào Bia Đá Tri Ân trong game.

### 🚫 NHÓM BỊ TUYỆT ĐỐI BÁC BỎ & CẤM PHÁT TRIỂN (E-MINUS BANNED):
| Mã | Thủ Thuật | Tỷ lệ phản đối | Phán định |
|:---:|---|:---:|:---:|
| **X1** | Đồng hồ đếm ngược giả (reset khi tải lại trang) | **20/20 (100%)** | ❌ **BỊ CẤM VĨNH VIỄN** |
| **X2** | Vòng quay "sắp trúng rồi" (Near-miss manipulation) | **20/20 (100%)** | ❌ **BỊ CẤM VĨNH VIỄN** |
| **X3** | Giấu tỷ lệ rơi / Giả mạo tỷ lệ may rủi | **20/20 (100%)** | ❌ **BỊ CẤM VĨNH VIỄN** |
| **X4** | Khóa thể lực / Cạn năng lượng bắt mua bình hồi | **19/20 (95%)** | ❌ **BỊ CẤM VĨNH VIỄN** |
| **X5** | Nhồi nhét quảng cáo rồi bán gói gỡ quảng cáo | **20/20 (100%)** | ❌ **BỊ CẤM VĨNH VIỄN** |
| **X6** | Gacha ghép mảnh trùng lặp vô hạn (Pity trap) | **18/20 (90%)** | ❌ **BỊ CẤM VĨNH VIỄN** |
| **X7** | Khóa kết cục tốt / Chân tướng sau tường phí | **20/20 (100%)** | ❌ **BỊ CẤM VĨNH VIỄN** |

> **Cam kết cốt lõi:** Người chơi F2P có thể trải nghiệm 100% nội dung cốt truyện và đạt được mọi kết cục mà không cần nạp bất kỳ đồng nào. Tiền nạp chỉ giúp tiết kiệm thời gian hoặc làm đẹp nhân vật.
