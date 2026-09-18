# Campaign 2 — Vòng 02: Thẩm Định 3 Tuyến Đạo Đức & Hệ Thống Hảo Cảm NPC (A4, A5, B5)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [A4] 3 tuyến đạo đức xuyên suốt | [A5] Arc nhân vật NPC | [B5] Hảo cảm NPC + Lãng mạn  
**Nhóm Persona tham gia khảo sát:**
- `p09` (Club/Socializer - Roleplayer): Đào sâu đối thoại, thử nghiệm tặng quà và xây dựng tình cảm.
- `p12` (Club/Socializer - Lonely Reader): Muốn dân làng thân thiện, kiểm tra các phản hồi ấm áp.
- `p06` (Diamond - Spreadsheet): Tính toán giá trị trao đổi của hảo cảm so với chi phí tặng quà.
- `p14` (Heart - Absurd Tinkerer): Nhập các câu lệnh kỳ quặc, thử nghiệm ranh giới phản ứng của NPC.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Scene Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **A4: 3 Tuyến đạo đức** | Cờ `story_route: 'mercy' \| 'wealth' \| 'truth'` được gán từ Hồi II và kiểm tra nghiêm ngặt ở Hồi III (`cave_witness`) và Hồi IV (`sect_trial`) | `src/content/story.ts:11-50` | ✅ Đạt |
| **A5: Arc nhân vật NPC** | Cụ Mai Hoa, Bảo lái buôn, Người kể chuyện Ngô, Vong hồn Hà, Tông chủ Võ, Sư đệ Khoa xuất hiện xuyên suốt | `src/content/npcs.ts`, `src/content/story.ts:36-50` | ✅ Đạt |
| **B5: Hảo cảm & Lãng mạn** | Hệ thống quà tặng phân loại sở thích 5 nhóm, ngưỡng lãng mạn kết tóc phu thê khai báo chi tiết | `src/content/romance.ts:1-250`, `src/content/npc-gifts.ts` | ✅ Đạt |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p09 (Roleplayer / Socializer):
> *"Tôi đã dành trọn buổi chơi để kết bạn với Tiểu Thảo và cụ Mai Hoa. Khi độ hảo cảm vượt 60 điểm, lời thoại của họ thực sự thay đổi từ khách sáo sang chân tình, cụ Mai Hoa còn nấu canh linh chi cho tôi. Nhưng tôi cảm thấy thiếu một bức thư hay tin nhắn nhỏ thăm hỏi khi tôi đi xa làm nhiệm vụ."*
* **Đề xuất tính năng:** Bổ sung cơ chế `Bồ Câu Đưa Thư (Carrier Pigeon)` hoặc `Thư Ký Ức`: Khi người chơi ở xa làng quá 3 ngày, NPC có hảo cảm cao sẽ gửi một phong thư thăm hỏi kèm một ít thảo dược nhỏ.

### 🗣️ p12 (Lonely Reader):
> *"Các tuyến đạo đức Mercy/Wealth/Truth làm cho tôi cảm thấy mình không phải là một cỗ máy tu luyện vô hồn. Đi theo nhánh Mercy, giúp đỡ từng nhà trong đêm làng bị quên lãng mang lại cảm giác xúc động sâu sắc. Ước gì có thể nắm tay hoặc cùng đạo lữ ngắm trăng ở bờ suối."*
* **Đề xuất tính năng:** Thêm sự kiện hẹn hò ngắm trăng (Moonlight Walk) tại Bờ Suối Thanh Mộc khi điểm lãng mạn đạt mốc Chân Tình (>80 điểm).

### 🗣️ p06 (Spreadsheet / Economy Optimizer):
> *"Tôi lập bảng tính chi phí quà tặng: Tặng 'Bánh Phù Dung' tốn 1 Bạc được 5 hảo cảm. Đạt 100 hảo cảm tốn 20 Bạc. Lợi ích thu lại: Giảm giá 15% tại tiệm tạp hóa. Nếu mua trên 150 Bạc tiền đồ thì điểm hòa vốn đạt được sau 20 ngày in-game. Tỷ lệ này khá cân bằng, nhưng cần hiển thị thanh hảo cảm trực quan hơn thay vì chỉ hiện số tim."*
* **Đề xuất tính năng:** Bổ sung thanh tiến trình hảo cảm `[=====>    ] 65/100` và chú thích rõ ràng mốc ưu đãi giảm giá tiếp theo.

### 🗣️ p14 (Absurd Tinkerer):
> *"Tôi gõ vào khung chat tự do 'cầu hôn cụ mai hoa' và 'mời bảo đi cướp tiêu'. Trò chơi phản hồi bằng chronicle rất có duyên, không bị crash, nhưng có cảm giác như game chỉ đọc lướt qua một số từ khóa chính rồi trả về câu thoại mặc định."*
* **Đề xuất tính năng:** Mở rộng từ điển phản ứng cho bộ phân giải ngôn ngữ tự nhiên đối với các tình huống hài hước của người chơi.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Bồ câu đưa thư từ NPC thân thiết:** **CHẤP NHẬN (Ưu tiên Cao)** — Tăng mạnh cảm xúc gắn kết của nhóm người chơi Club/Socializer.
2. **Sự kiện hẹn hò bờ suối (Moonlight Date):** **CHẤP NHẬN** — Khai thác trọn vẹn tệp dữ liệu phong phú trong `src/content/romance.ts`.
3. **Thanh tiến trình hảo cảm kèm mốc ưu đãi:** **CHẤP NHẬN** — Giúp người chơi nắm bắt mục tiêu rõ ràng.
4. **Mở rộng từ điển chatbot hài hước:** **HOÃN LẠI (Tốn tài nguyên LLM)** — Ưu tiên giữ chi phí vận hành nhẹ nhàng, chỉ duy trì bộ quy tắc từ khóa offline.
