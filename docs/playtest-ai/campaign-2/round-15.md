# Campaign 2 — Vòng 15: Thẩm Định Hệ Thống Đồng Hành & Đạo Lữ Linh Hồ (B5, A5)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B5] Đồng hành & Tương tác đồng đội | [A5] Phân nhánh cốt truyện tình cảm & Đạo lữ  
**Nhóm Persona tham gia khảo sát:**
- `p09` (Club - Roleplayer): Trải nghiệm tuyến tình cảm và gắn kết nội tâm.
- `p12` (Club - Village Mayor): Tìm hiểu số phận và tương lai của đồng hành.
- `p11` (Club - Deep Story Reader): Đánh giá tính cách nhân vật NPC.
- `p02` (Spade - Min-maxer): Đo lường giá trị chiến đấu của Đồng Hành.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Companion Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B5: Hệ thống đồng hành** | Khai báo 3 đồng hành khả dụng: Tiểu Thảo (Dược Sĩ), Bạch Hồ Ly / Tuyết Nhi (Linh Thú/Đạo Lữ), Lôi Chấn (Kiếm Khách Phòng Thủ) | `src/engine/companion.ts`, `test/companion.test.ts` | ✅ Đạt |
| **B5: Kỹ năng đồng hành** | Đồng hành có 2 kỹ năng: 1 Kỹ năng Hỗ trợ (Hồi máu/Trợ khí) và 1 Kỹ năng Bị động (Tăng sản lượng thu thập) | `src/engine/companion.ts` (dòng 80–145) | ✅ Đạt |
| **A5: Tuyến Đạo Lữ** | Tuyến tình cảm Bạch Hồ Tuyết Nhi có 4 giai đoạn hảo cảm: Gặp gỡ → Cứu mạng → Kết giao → Hóa hình thành Đạo Lữ | `src/content/story.ts` (scenes 8, 12, 16) | ✅ Đạt |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p09 (Roleplayer):
> *"Cảnh Tuyết Nhi đỡ một nhát kiếm của Hắc Phong Ma Đầu cho tôi ở Tầng 7 khiến tôi thực sự xúc động. Khi nàng hóa hình thành thiếu nữ áo trắng và gọi tôi là 'Đạo hữu', đó là khoảnh khắc kỳ diệu nhất trong toàn bộ game. Nhưng tôi muốn có thêm nhiều cuộc trò chuyện thân mật khi bế quan cùng nhau."*
* **Đề xuất tính năng:** Bổ sung cơ chế `Song Tu Bế Quan (Dual Cultivation Dialogue)`: Khi mang theo Đạo Lữ bế quan, mở khóa các đoạn hội thoại tâm tình ngắn và nhận buff +10% hiệu suất tu luyện.

### 🗣️ p12 (Village Mayor):
> *"Tiểu Thảo là một cô bé rất dễ thương, luôn miệng lo lắng khi thấy tôi bị thương và tặng tôi Thảo Dược. Nhưng khi tôi di chuyển từ Thôn Trang lên Tông Môn, Tiểu Thảo vẫn đứng ở góc vườn thuốc cũ, không đi theo tôi."*
* **Đề xuất tính năng:** Cơ chế `Đón Đồng Hành Về Động Phủ (Invite to Abode)`: Khi người chơi xây dựng Động Phủ riêng, cho phép mời các NPC thân thiết về ở cùng để chăm sóc linh điền.

### 🗣️ p11 (Story Reader):
> *"Tính cách của Lôi Chấn rất cứng cỏi, là một kiếm tu chính trực. Tuy nhiên, các câu thoại của Lôi Chấn khi vào trận đánh nhau hơi đơn điệu (chỉ có 2 câu: 'Để ta lên trước!' và 'Coi chừng!')."*
* **Đề xuất tính năng:** Bổ sung kho `Thoại Chiến Đấu Theo Tình Huống (Contextual Battle Quotes)`: Đồng hành phản ứng riêng khi người chơi sắp hết máu, khi đánh trúng điểm yếu quái vật, hoặc khi boss xuất chiêu tối thượng.

### 🗣️ p02 (Min-maxer):
> *"Về mặt tối ưu hóa: Bạch Hồ Ly cung cấp buff né tránh +15% và hồi phục 20 HP mỗi hiệp. Đây là đồng hành bắt buộc phải có cho mọi build né tránh tốc độ cao. Tiểu Thảo hơi yếu về late-game vì lượng máu hồi cố định 30 HP không theo kịp lượng máu quái rút."*
* **Đề xuất tính năng:** **Cân bằng sức mạnh (Balance Ticket)**: Cho phép nâng cấp kỹ năng hồi máu của Tiểu Thảo theo phần trăm máu tối đa (% Max HP) thay vì số phẳng 30 HP.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Kỹ năng đồng hành hồi máu theo % Max HP:** **CHẤP NHẬN (Vé lỗi Balance - Cần làm ngay)** — Đảm bảo Tiểu Thảo không bị "phế thải" ở giai đoạn cuối game.
2. **Đón Đồng Hành Về Động Phủ:** **CHẤP NHẬN (Ưu tiên Cao)** — Tăng tính sở hữu và tình cảm gắn kết sâu sắc với thế giới.
3. **Hội thoại Song Tu Bế Quan:** **CHẤP NHẬN** — Phục vụ trúng đích nhu cầu nhập vai của nhóm Socializer/Roleplayer.
4. **Thoại chiến đấu phong phú theo tình huống:** **CHẤP NHẬN (Tăng Game Feel)** — Làm phong phú thêm trải nghiệm trận đánh.
