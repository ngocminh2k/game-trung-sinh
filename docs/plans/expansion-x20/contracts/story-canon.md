# CONTRACT — Story canon: XUYÊN KHÔNG + HỆ THỐNG (đóng băng, ưu tiên cao nhất)

> **Quyết định của user 2026-08-31**: cốt truyện phải giống kịch bản video xuyên không —
> người hiện đại chết, sống lại trong thân xác người khác, có **Hệ Thống** hiện hình phát nhiệm vụ
> và thưởng. File gốc `expansion-x20.md` chỉ "chung chủ đề" — KHÔNG đạt. Canon này THẮNG mọi
> tài liệu khác khi xung đột phần truyện.

## 1. Tiền đề (mở game là thấy, không giấu)

- Nhân vật: người hiện đại (người chơi tự đặt tên cũ), chết vì tai nạn, mở mắt trong thân xác
  **Vệ Vô Danh** — thiếu niên 16 tuổi linh căn phế ở Làng Thanh Mộc, vừa "chết xỉn vì món nợ cờ bạc
  của cha" 3 ngày trước.
- **Hệ Thống kích hoạt ngay tại cảnh mở đầu** (Chương 0), trước cả khi gặp NPC nào:
  `【Hệ Thống】 Kích hoạt. Chào mừng ký chủ. Nhiệm vụ đầu tiên đã tải.` — đó là câu đầu tiên của game.
- Người chơi biết thể loại: cho phép 1 câu meta/chương tối đa ("Kiểu này thì ta xem rồi...").

## 2. Hệ Thống — quy tắc cứng (agent KHÔNG được phá)

1. Hệ Thống **KHÔNG phải NPC**: không id trong npc-registry, không đứng trên map, không `talk`.
   Nó là **lớp giao diện + lớp dữ liệu thông báo** (task T14).
2. Hệ Thống chỉ nói qua khung: `【Hệ Thống】 ...` — hiển thị trong panel thông báo + đệm thoại cảnh.
3. Khi nào nói: nhận/hoàn thành nhiệm vụ chính; trao thưởng (`Đinh!`); deadline sắp hết;
   mở khoá hệ thống mới; cảnh báo nguy hiểm. KHÔNG nói trong giao dịch thường, không spam.
4. **Hệ Thống không bao giờ nói sai con số** (nó hiển thị đúng state) — nhưng nó NÉ chi tiết
   về chính nó. Hỏi về nguồn gốc → trả lời lảng: `【Hệ Thống】 Dữ liệu không đủ để trả lời.`
5. Giọng: ngắn, máy móc, lạnh, thỉnh thoảng cà khịa ≤ 1 câu/thông báo. Mở thông báo thưởng
   bằng `Đinh!`. Không emoji, không kêu "chủ nhân à~".
6. Hệ Thống **phát nhiệm vụ chính** (12 quest main): phần thưởng main quest = Linh Thạch
   (nguồn gốc hợp lý của kinh tế 3 lớp — Hệ Thống là "nhà tài trợ"). `giverNpcId` trong QuestDef
   vẫn là NPC bàn giao (ràng buộc schema) — Hệ Thống chỉ accompanies bằng thông báo.

## 3. Twist lore (giữ nguyên toàn bộ nội dung đã kế hoạch)

- **200 cái tên bị xóa chính là nguyên liệu tạo ra Hệ Thống.** "Memory of Names" không còn là
  theme bề mặt — nó là bí mật của Hệ Thống, lộ dần từ Chương 6.
- Cái tên bị xóa cuối cùng trong 200 tên = tên thật của chủ nhân thân xác Vệ Vô Danh.
- Lựa chọn cuối (Chương 8): **giữ Hệ Thống** (phi thăng kèm nó) / **xóa Hệ Thống** (giải phóng
  200 tên, ending 'nameless_ascension' đổi tên hiển thị thành "Phi Thăng Vô Danh — và 200 linh hồn
  được gọi lại") / **hòa làm một** (người chơi trở thành Hệ Thống của kẻ xuyên không tiếp theo —
  mở New Game+).
- Nhánh rootless (GỐC) = **tắt Hệ Thống ngay Chương 0** ("Từ chối kích hoạt") — kết thúc sớm,
  đúng beat "từ chối vàng của hệ thống" trong video xuyên không.

## 4. Beat theo thể loại — ánh xạ 8 chương (dùng khi viết scene/quest/đoạn thoại)

| Chương | Beat xuyên không bắt buộc |
|---|---|
| C0 | Xuyên + hệ thống kích hoạt + nhiệm vụ đầu + người chơi nhận ra mình ở đâu |
| C1 | Bị coi thường (linh căn phế, con nợ); nhiệm vụ hệ thống chuộc danh dự; **vả mặt đầu tiên** |
| C2 | Thưởng Linh Thạch đầu tiên từ hệ thống; hệ thống giới thiệu "cửa hàng hệ thống" = chợ |
| C3 | Nhiệm vụ thời hạn có đếm ngược của hệ thống (đúng 4 ngày — Lạc Đà Vạn Thảo) |
| C4 | Hệ thống cảnh báo phiên xét xử; lựa chọn có hệ số thưởng/phạt |
| C5 | Nhiệm vụ thuần thú đầu tiên — hệ thống tặng mồi miễn phí 1 lần |
| C6 | Hệ thống **lỡ lời**: thông báo không khớp ký ức → người chơi nghi ngờ nguồn gốc |
| C7 | Bốn tiên nhân nhận ra Hệ Thống: "vật của bọn họ còn sống" |
| C8 | Reveal 200 tên + lựa chọn cuối (giữ / xóa / hòa làm một) |

## 5. Template thông báo (T14 dùng đúng định dạng, Vi/En)

```
Nhận nhiệm vụ:  【Hệ Thống】 Nhiệm vụ chính tải xong: {quest}. Hạn: {days} ngày.
                【System】 Main quest loaded: {quest}. Time limit: {days} days.
Hoàn thành:     【Hệ Thống】 Đinh! Nhiệm vụ hoàn tất. Thưởng: {reward}.
                【System】 Ding! Quest complete. Reward: {reward}.
Mở khoá:        【Hệ Thống】 Mở khoá: {feature}.
                【System】 Unlocked: {feature}.
Cảnh báo:       【Hệ Thống】 Cảnh báo: {danger}.
                【System】 Warning: {danger}.
Né câu hỏi:     【Hệ Thống】 Dữ liệu không đủ để trả lời.
                【System】 Insufficient data to answer.
```
