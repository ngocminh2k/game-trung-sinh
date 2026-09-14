# Game Design Evaluation — 2026-09-10

15 lăng kính lý thuyết, mỗi lăng kính do một sub-agent đánh giá dựa trên bộ tài liệu `GameDesign_TaiLieu_Markdown` và source thực tế `F:/game-trung-sinh/src`.

**Điểm trung bình: 7.01 / 10**

## Ma trận điểm số (cao → thấp)

| Điểm | Lăng kính | Lý thuyết |
|------|-----------|-----------|
| 8.5 | Fullerton — Formal Systems & Playtest | Formal systems, core loop |
| 8.5 | Crawford — Challenge/Fantasy/Experience | Honest game, readability |
| 8.0 | Schell — Elemental Tetrad | Mechanics/Story/Aesthetics/Technology |
| 7.5 | MDA | Mechanics→Dynamics→Aesthetics |
| 7.5 | Flow & Difficulty Curve | Rogers flow |
| 7.5 | Costikyan — Decisions & Systems | Counterpoint, struggle |
| 7.5 | Narrative Architecture & Pacing | 3-act, ludonarrative |
| 7.2 | Juul — Casual & Usability | Interruptibility |
| 7.0 | Bartle Player Types | Explorer/Achiever/Killer/Socializer |
| 7.0 | Feedback Loops | Juice, readable reward |
| 7.0 | Technical Architecture & Determinism | Purity, migration |
| 6.5 | Fun = Learning (Koster) | Possibility space |
| 6.0 | Art Direction | Coherence, asset weight |
| 5.5 | Retention & Churn | NG+, meta-progression |
| 4.0 | Economy & Resource Sinks | 3-tier currency |

## Lỗ hổng cốt lõi (tổng hợp chéo 15 lăng kính)

Các lỗ hổng **lặp lại** ở nhiều lăng kính là ưu tiên hàng đầu. Xếp theo tần suất xuất hiện + mức độ nặng:

1. **Hệ thống "ngủ quên" — viết rồi nhưng không nối vào runtime** _(MDA, Fun=Learning, Economy, Tech — 4 lăng kính)_
   - `skill-tree.ts` 100 node công phu bị cô lập khỏi `reducer.ts`.
   - `weather.ts` (4 mùa + price/damage modifier) không được import.
   - `companion.ts` (companion buff) bị bỏ quên ngoài reducer.
   - `shops.ts` 250 dòng `priceGold/priceSilver/priceLS` + `shopForNpc` không nối vào `doBuy/doSell`.
   - `migrate()` là dead code — save v0 fail `z.literal(1)` và bị lặng lẽ vứt.
   → Đây là lỗ hổng tốn chi phí nhất: **dữ liệu/độ sâu đã có sẵn, chỉ thiếu vài dòng wiring.**

2. **Boss "gotcha" — máy ăn gian, không telegraph** _(Crawford, Costikyan)_
   - Boss hồi 100% HP ở ≤33% + cuồng nộ x1.5 mà không báo trước → vi phạm Illusion of Winnability.

3. **Kết thúc cứng / không NG+** _(Retention 5.5, Flow, Juul)_
   - `terminal: true` đóng băng phiên; `restart()` reset trắng; không meta-progression, không di vật.

4. **Chết bất công khi tu luyện** _(Flow)_
   - `INSUFFICIENT_HP` bỏ qua `oscillationRange` (x2 ban đêm) → tẩu hỏa nhập ma chết oan khi đang farm an toàn.

5. **Kinh tế đứt mạch + lottery in tiền** _(Economy 4.0)_
   - Bạc/Linh Thạch không lưu thông; `doConvertCurrency` một chiều; lottery EV=+20/ngày.

6. **Feedback câm** _(Feedback Loops)_
   - 5 event combat (`BOSS_HEAL`, `POISON_*`, `COMBO_TRIGGERED`, `QI_REGEN`) rơi vào FALLBACK "Chuyện gì đó đã xảy ra"; crit x2 vô hình; achievement phát tay (≥1 là unlock).

7. **Art 472MB + mảnh ghép rời rạc** _(Art Direction 6)_
   - PNG 1024-1672px chỉ hiện ở 42-68px; 3 phong cách vẽ không thống nhất.

8. **Narrative đứt ở chương 7-8** _(Narrative)_
   - `story.ts` kết thúc ở chương 6, bỏ 4 cảnh chương 7, không có chương 8; `nameless_ascension` mồ côi.

## Đề xuất cải tiến (Impact vs Effort)

Mỗi đề xuất kèm: [Impact] [Effort] và lăng kính nguồn.

| # | Đề xuất | Impact | Effort | Nguồn |
|---|---------|--------|--------|-------|
| P1 | Nối `skill-tree.ts` vào reducer qua `unlock_skill` + `skillPoints` | **Cao** — mở không gian khả năng lớn nhất | Trung | Fun=Learning, MDA |
| P2 | Wiring đồng loạt hệ "ngủ quên": weather + companion + shopForNpc + migrate | **Cao** | Thấp (dữ liệu có sẵn) | MDA, Economy, Tech |
| P3 | Telegraph boss heal/rage 1 lượt trước khi kích hoạt | Trung-Cao | Thấp | Crawford, Costikyan |
| P4 | NG+ / Di vật truyền thừa / Global Profile Lua Hồi | **Cao** (churn) | Trung | Retention, Flow, Juul |
| P5 | Sửa ngưỡng an toàn tu luyện (`hpCost + oscillationRange + 1`) | Cao | Thấp (1 dòng) | Flow |
| P6 | Sửa EV lottery về âm + nối LS hai chiều + sink late-game | Trung | Thấp-Trung | Economy |
| P7 | Thêm narrator template cho 5 event combat + emit `COMBAT_CRIT` | Trung | Thấp | Feedback |
| P8 | Nén art 472MB→WebP (42-256px) + Art Bible thống nhất phong cách | Trung | Trung (batch) | Art Direction |
| P9 | Nối mạch chương 7-8 + ending `nameless_ascension` | Trung | Trung | Narrative |
| P10 | Bỏ `min-width:1060px` + progressive disclosure + legacy hint | Trung | Thấp | Juul |
| P11 | Lôi Đài (Sect Arena) + uy hiếp NPC cho nhóm Killer | Trung | Cao | Bartle |
| P12 | Human playtest protocol (Fullerton Ch.9) + telemetry | Trung | Thấp | Fullerton |
| P13 | Ngưỡng achievement thật (hái 10, không phải hái 1) | Thấp | Thấp | Feedback |

## Ưu tiên triển khai

Nhóm A (cao impact, thấp effort — làm ngay): P2, P5, P3, P7, P13
Nhóm B (cao impact, trung effort): P1, P4, P6, P8
Nhóm C (dài hạn/điều kiện): P9, P10, P11, P12

Chi tiết từng báo cáo đầy đủ nằm trong thư mục tạm transcript sub-agent (đã chốt đủ 15/15).