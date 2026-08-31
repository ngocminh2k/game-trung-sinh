# Kế hoạch mở rộng ×20 — Trùng Sinh Tu Tiên (`resurrection-tale`)

> **Trạng thái**: ĐÃ DUYỆT TOÀN BỘ (user, 2026-08-31) & ĐÃ CÔNG BẰNG PHẢN BIỆN (2 sub-agents: code-architect + architect).
> **Người viết**: Claude (session fix-day-neutral-walking-and-context-only-narrati-2)
> **Phạm vi**: ×20 khối lượng nội dung hiện tại. 8 map → 13 map. 30 NPC → 60 NPC. 25 quest → 150 quest. 5 endings → 12 endings (6 cơ chế lõi + epilogue).
> **Điều chỉnh kỹ thuật & thiết kế sau phản biện**:
> 1. Vị trí nhà Cụ Mai Hoa: Đặt tại ô `(2,3)` để tránh trùng ô `(3,3)` (Nhà cũ của ngươi). Hiên nhà giữ ở `(2,2)`.
> 2. Tỷ giá Linh Thạch: Sửa đúng chuẩn Tu Tiên: `1 Linh Thạch = 10 Vàng = 100 Bạc` (Linh Thạch là đồng năng lượng cao cấp nhất).
> 3. Cấu trúc File: Giữ nguyên file đơn (`npcs.ts`, `quests.ts`) với comment phân khu vực thay vì split file nhỏ, tránh vỡ O(1) lookup và validation schema.
> 4. Cắt tỉa hệ thống tinh gọn: Linh thú (6 loài đại diện buff passive), Thời tiết (4 mùa), Cửa hàng (8 chợ khu vực + NPC trao đổi quest).
> 5. An toàn Determinism & Save: Weather tính bằng `hashSeed(seed + day)`, không dùng `state.rng`; Bạc & Linh Thạch dùng `.default(0)` trong Zod schema; NPC Aliases kiểm tra unique tuyệt đối.
> **Nguyên tắc xuyên suốt** (từ user): game này mạnh về **cốt truyện, nhiệm vụ và văn bản** vì được làm bằng AI — nội dung phải là vua, hệ thống chỉ phục vụ truyện.

---

## 0. Bối cảnh và lý do

User đánh giá hiện trạng: **"thế giới game quá nhàm chán"**. Các vấn đề cụ thể user chỉ ra:

1. **Map lỗi thời, không hiện NPC** — node trong map không phản ánh đúng NPC đứng ở đó.
2. **Điểm trigger "Hiên nhà Cụ Mai Hoa" không phải nhà cụ Mai Hoa** — node `village-elder` chỉ là hiên (porch), quest chính lại yêu cầu "nói chuyện với cụ Mai Hoa" như thể đến nhà. Lỗi logic không gian.
3. **Mỗi NPC đều phải có nhiệm vụ, cửa hàng giao thương** — hiện tại 30 NPC chỉ có thoại, không ai có kinh tế riêng.
4. **Không có tiền/linh thạch đa lớp** — chỉ có vàng đơn nhất.
5. **Nhiệm vụ ít hơn cả game spam trên mạng** — yêu cầu nội dung gấp 20 lần.

Câu chốt của user: *"tưởng bảo là với trí tưởng tượng của AI sẽ xây được kịch bản khủng bố lắm. ai ngờ chỉ có thế này"*. Kế hoạch này trả lời câu đó.

---

## 1. Chủ đề cốt lõi (theme)

> **Một linh căn phế cố phi thăng không phải bằng thiên phú, mà bằng việc nhớ hết những tên người ta đã quên.**

Mọi hệ thống mới đều phục vụ theme này:
- Ký ức tên (Memory of Names) = cơ chế tiến hoá chính thay cho grind thuần.
- 200 cái tên bị xóa = nội dung chính của 13 map.
- 4 đường phân nhánh = 4 thái độ với ký ức: nhớ hết / đi tiếp / xóa sổ / quên mình.
- Linh thạch = "tiền ký ức" — vật chất hoá dư âm của người đã mất.

---

## 2. Tổng quan số liệu (before → after)

| Mục | Hiện có | Sau mở rộng | Chênh |
|---|---|---|---|
| Map/vùng | 8 | **13** | +5 |
| NPC | 30 | **60** | +30 |
| Quest | 25 | **150** | +125 |
| Ending | 5 | **12** | +7 |
| Chiêu thức | ~9 | **18** (9 chính + 9 ẩn) | +9 |
| Đan dược | 8 | **20** (8 gốc + 12 lai) | +12 |
| Linh thú | 0 | **36** (12 loài × 3 con) | +36 |
| Loại tiền | 1 (vàng) | **3** (vàng/bạc/linh thạch) | +2 |
| Thời tiết | 0 | **16** (4 mùa × 4 thời tiết) | +16 |
| Nhánh chính | 1 trục (mercy) | **4 đường × 3 lớp** | +11 |

---

## 3. Cốt truyện chính — 8 chương

### Chương 0 — Tỉnh giấc ở Thanh Mộc (ngày 1)
Nhân vật tỉnh dậy sau một cơn sốt dài — linh căn phế. Ngô kể chuyện dẫn dắt vào thế giới; Mai Hoa đưa lá thư đầu tiên. Nhà ngươi là đích đến của điềm báo.
**3 nhánh mở**: chọn đi với Mai Hoa (`mercy`), đi tìm Ngô (`ngo`), đi một mình (`rootless`).

### Chương 1 — Làng Thanh Mộc (ngày 1–7)
- 6 NPC làng × 2 quest/người = 12 quest side
- 4 sự kiện đêm (đêm 1, 3, 5, 7) — mỗi đêm mất 1 cái tên khỏi sổ làng nếu ngươi không can thiệp
- **Phát hiện**: ruộng linh thảo "chảy máu" mỗi đêm 13. Ngô biết, không nói.

### Chương 2 — Chợ Vân Tập (ngày 5–12)
- 8 NPC chợ + 3 tiệm (lương/dược/khí) × 2–3 quest = 22 quest
- Phân nhánh phe phái: mua ủng hộ Bảo (thương nhân chính) → **phe vật chất**; mua ủng hộ Phụng (đầu bếp) → **phe nhân sinh**; đấu giá bí kíp với Tiêu → **phe tà**.
- Kinh tế: mở **Linh thạch** (spirit stone) — đơn vị tiền thứ ba, chỉ mua đan + trang bị hiếm.

### Chương 3 — Vạn Thảo Cốc (ngày 8–15) — MAP MỚI
- 6 NPC Vạn Thảo + ruộng ẩn có 12 loại thảo (mỗi loại chỉ xuất hiện 1 lần / mùa)
- **Hệ thống gieo trồng**: mua hạt giống → trồng 3 ngày → thu hoạch. Lai ghép hai loại thảo → tạo đan hiếm chỉ ngươi có.
- Quest nổi bật: Thuốc cho Mẹ Ghẻ (chain 5 phần), Hạt Giống Từ Trời, Lạc Đà Vạn Thảo (timed 4 ngày).

### Chương 4 — Tông môn Vân Ẩn + Thanh Vân Các (ngày 12–20) — THANH VÂN CÁC MAP MỚI
- 8 NPC tông môn × 2–3 quest = 20 quest
- Kho tàng 6 bộ bí kíp — đọc phải có 3 điều kiện (linh căn, danh tiếng, gia sản). Ngươi mang linh căn phế → không ai cho mượn → **lấy trộm hoặc mua chuộc** (2 nhánh con).
- Phiên xét xử thứ 8 (ngày 18) — quyết định ai giữ ấn phong ấn. **4 lựa chọn**: Võ giữ / Ngươi giữ / Chia ba bên / Phá đi.

### Chương 5 — Rừng Sương Mù + Linh Thú Lĩnh (ngày 14–22) — LINH THÚ LĨNH MAP MỚI
- 5 NPC rừng + 3 NPC Lĩnh × 2 quest = 16 quest
- **Hệ thống thuần hóa**: 12 loài linh thú (mỗi loại 1–3 con). Luck cao → dễ thuần. Thuần 1 con → buff hành động +1 slot "linh thú đồng hành" hiển thị trong HUD.

### Chương 6 — Khe Nứt + Cổ Tích Tro Xương (ngày 18–26) — TRO XƯƠNG MAP MỚI
- 5 NPC khe + 4 NPC cổ tích = 18 quest
- **Lộ bí ẩn**: khe nứt là vết thương của một vị tiên tử đã chết 200 năm. Ả Bạch (Relic Hunter) nhặt tro — biết tên 200 người đã bị xóa. Đi cùng bà → thu thập tên → mở chương cuối.

### Chương 7 — Đỉnh Mây + Hàn Băng Phong (ngày 22–30) — HÀN BĂNG PHONG MAP MỚI
- 3 NPC đỉnh mây + 4 NPC hàn băng = 14 quest
- Bốn vị tiên còn lại (không thấy tên trong sổ) đang chờ ở đỉnh — bản tương lai của những người ngươi đã gặp. Họ thử ngươi.

### Chương 8 — Phi Thăng (ngày 28–35)
- **4 ending gốc × 3 sublayer = 12 endings**. Mỗi ending có 2–3 epilogue 3 dòng tùy theo 4 trục: tên-bí-mật / vật-đã-giữ / người-đã-nhớ / lời-đã-hứa.

---

## 4. Bốn đường phân nhánh (4 đường × 3 lớp)

### Đường MINH (mercy) — nhớ tất cả
- Trả trâm → đi cùng Mai Hoa → phiên xét xử chọn giữ → phi thăng **"Vô Lượng Độ"**
- Kết thúc tốt nhất, nhưng yêu cầu thu thập 200 cái tên tro xương (chi phí thời gian lớn)

### Đường HÀNH (path) — đi một mình
- Bỏ làng → đi về Hàn Băng Phong → gặp bốn ẩn sĩ → học công pháp **"Băng Tâm"** → phi thăng lạnh
- Trung bình, nhanh, ít NPC gắn bó

### Đường SÁT (blade) — chém hết
- Đi theo Diệp → học kiếm → giết Cốc (lộ Phong Trảm) → cướp ấn → phi thăng cưỡng ép
- Kết thúc xấu, nhân vật cô đơn

### Đường GỐC (rootless) — quên đi
- Nhổ linh căn → mất hết → kết thúc sớm ngày 7 → **"Vô Căn Nhân"**
- Kết thúc tệ nhất, mở khóa **New Game+** với bonus

**Số ending = 4 đường × 3 sublayer = 12.** Sublayer quyết định bởi: số tên đã nhớ (0–200), vật đã giữ, người đã nhớ, lời đã hứa.

---

## 5. Kinh tế 3 lớp

| Đơn vị | Tỷ lệ | Dùng mua | Nguồn thu |
|---|---|---|---|
| **Vàng** | 1 | Đồ thường, ăn, nghỉ | Bán thảo, lương thực |
| **Bạc** | 1 vàng = 10 bạc | Đồ trung, vé số | Bán da thú, ngọc |
| **Linh thạch (LS)** | 1 LS = 10 Vàng = 100 Bạc | Đan hiếm, trang bị hiếm, thuê buff | Đánh boss, nhiệm vụ đặc biệt, giao thương phe tà |

- **Mỗi NPC có bảng mua–bán riêng** (10–15 món/người):
  - Bảo bán vũ khí · Phụng bán lương · Sâm bán đan · Đức bán rèn · Quyền bán ngọc-bùa · Liên bán vé số · Hạnh cho thuê giường · Ánh cho thuê kho · v.v.
- Tỷ giá chốt: **1 Linh thạch = 10 Vàng = 100 Bạc**.
- Charm (Mị) cho giảm giá trên mọi bảng giá; Luck cho bonus roll chất lượng hàng hiếm.

---

## 6. Sáu hệ thống lõi mới

### 6.1 Ký ức tên (Memory of Names)
- Mỗi tên người nhớ được = +1 điểm **"Thiện căn"**.
- Thiện căn > 50 → mở lớp kết cuối. HUD hiển thị: `Đã nhớ: 73/200`.
- 200 tên phân bổ: 100 trong quest/trace, 60 trong đám tro xương, 40 trong 4 sự kiện đêm.

### 6.2 Quan hệ mở rộng (Affinity Chain)
- Mỗi NPC có 3 quest aff-chain (mở ở aff ≥ 3, ≥ 6, ≥ 9).
- Aff 9 → trở thành **đệ tử / người yêu / đối thủ** tùy NPC.

### 6.3 Lai ghép đan (Alchemy)
- 8 loại đan cơ bản + 12 đan lai = **20 công thức**.
- Sâm giữ công thức gốc; Bạch (Tro Xương) cho công thức tà.

### 6.4 Kỹ thuật 18 chiêu (Tech Tree)
- 5 nhánh tu: Tâm / Phong / Hỏa / Thủy / Thổ — mỗi nhánh 3–4 chiêu.
- 9 chiêu chính + 9 chiêu ẩn. Luyện đủ 9 → mở **Phi Phong Trảm** ("chém để chứng minh").

### 6.5 Linh thú đồng hành (Companion)
- 12 loài × 3 con = **36 linh thú**.
- Thuần 1 con → thêm slot "linh thú" vào HUD, mỗi trận đánh thêm 1 lượt hành động.
- Thuần theo Luck + đúng mồi nuôi.

### 6.6 Thời tiết (Weather)
- 4 mùa × 4 thời tiết = **16 trạng thái**.
- Mưa → linh thảo rẻ, dễ kiếm. Sương → boss mạnh hơn.
- Thay đổi theo ngày (deterministic từ RNG seed).

---

## 7. Phân bổ 60 NPC theo khu vực

| Khu vực | NPC | Số lượng | Vai trò | Shop |
|---|---|---|---|---|
| Village (Thanh Mộc) | Mai Hoa, Ngô, Trường, Bồng, Tư, Hạnh, Tiểu Bảo, +3 trẻ mồ côi | 10 | Trưởng làng + 4 trade | Lương, tin đồn |
| Market (Vân Tập) | Bảo, Phụng, Đức, Quyền, Liên, Yến, Minh, Ma, Phong | 9 | 4 trade | Vũ khí, đan, rèn, ngọc |
| Herb field + Vạn Thảo Cốc | Đàn, Huệ, Hiền, Lưu Ly, +3 tiều phụ | 7 | 3 trade | Hạt giống, đan thảo |
| Sect + Thanh Vân Các | Võ, Khoa, Lan, Ánh, Thiện, Sâm, +2 giáo hữu | 8 | 3 trade | Sách, đan, kỹ thuật |
| Forest + Linh Thú Lĩnh | Sơn, Nhất, Bồng, Lê, +2 thợ săn | 6 | 2 trade | Da thú, nanh |
| Sealed Cave | Cốc, Hà, +1 vong hồn khác | 3 | 1 trade | Linh thạch |
| Cursed Rift + Tro Xương | Bá, Diễm, Bạch, +2 lữ khách | 5 | 2 trade | Đan tà, bản đồ cổ |
| Cloud Peak + Hàn Băng Phong | Tiên Hạc, Như, +2 ẩn sĩ | 4 | 1 trade | Khí cụ, ký ức |
| wandering_market + dunes | Tiêu, Diệp, +1 nhóm lữ khách | 3 | 2 trade | Tin đồn, bản đồ |
| **Tổng** | | **~60** | | |

Mỗi NPC ≥ 3 dòng thoại (cấp aff 1/3/6/9), NPC chính ≥ 6 dòng.

---

## 8. Phân bổ 150 nhiệm vụ

| Loại | Số lượng | Tỷ lệ | Ghi chú |
|---|---|---|---|
| Main story | 12 | 8% | 8 chương × 1.5 quest |
| Side quest (mỗi NPC ≥ 1) | 60 | 40% | Trải đều 60 NPC |
| Secret quest (cờ ẩn) | 20 | 13% | `requiredFlags` như hiện tại |
| World timed quest | 18 | 12% | 1–3 ngày deadline |
| World exploration (tìm NPC ẩn) | 25 | 17% | Không hiện trên map cho đến khi gặp |
| Affinity chain (mỗi NPC 1 chuỗi 3) | 15 | 10% | Gắn aff-threshold |
| **Tổng** | **150** | 100% | |

---

## 9. Sửa lỗi map (user chỉ đích danh)

### 9.1 Tách hiên / nhà Mai Hoa
Node hiện tại: `node('village-elder', 'Hiên nhà Cụ Mai Hoa', 'npc')` — chỉ là hiên.

**Sửa**:
1. `village-elder-porch` (2,2) — "Hiên nhà Cụ Mai Hoa" — thoại thường, mua tin đồn.
2. `village-elder-home` (2,3) — "Cửa nhà Cụ Mai Hoa" — quest chính, giao nhiệm vụ lá thư, chuyện gia đình (tránh đè vào (3,3) là Nhà cũ của ngươi).
3. Mai Hoa di chuyển giữa hai ô theo giờ (sáng ở hiên, chiều ở nhà).
4. Thêm NPC mới: **"Cụ ông Thìn"** — chồng quá cố của Mai Hoa (chỉ xuất hiện trong thoại/flashback, chết 12 năm trước) — mở chuỗi ký ức.

### 9.2 Làm NPC hiện trên map
- Audit toàn bộ node loại `npc`: đảm bảo NPC `locationId` khớp node đang render.
- Mỗi node `npc` phải gắn được tối thiểu 1 NPC thật (không để node NPC rỗng).

---

## 10. Kế hoạch triển khai từng bước

| Bước | Nội dung | File | Ước lượng |
|---|---|---|---|
| 1 | Sửa map village: tách hiên/nhà Mai Hoa, thêm NPC quá cố dạng flag | `locations.ts`, `npcs.ts` | 30 phút |
| 2 | Thêm 5 map mới + ô chức năng + NPC | `locations.ts`, `npcs.ts` | 4 giờ |
| 3 | Mở rộng 30 → 60 NPC | `npcs.ts` | 5 giờ |
| 4 | 25 → 150 quest | `quests.ts` | 7 giờ |
| 5 | Hệ thống Linh thạch + 3 lớp tiền + shop-per-NPC | `constants.ts`, `shop.ts` | 4 giờ |
| 6 | Hệ thống Ký ức tên + Thiện căn HUD | `engine/stats.ts`, `GameScreen.tsx` | 2 giờ |
| 7 | Hệ thống Linh thú đồng hành + 12 loài | `engine/` mới, `npcs.ts`, `GameScreen.tsx` | 4 giờ |
| 8 | Hệ thống Alchemy lai ghép 20 công thức | `engine/alchemy.ts` mới | 5 giờ |
| 9 | Hệ thống Tech Tree 18 chiêu | `engine/techniques.ts` mới, `quests.ts` | 6 giờ |
| 10 | Hệ thống Thời tiết 16 trạng thái | `engine/weather.ts` mới | 3 giờ |
| 11 | Phân nhánh 4 đường × 3 lớp + 12 endings | `endings.ts`, `story.ts`, `quests.ts` | 8 giờ |
| 12 | Ảnh minh họa NPC mới (skill image 9router) | `npcArt.ts`, 60 ảnh | 2 giờ |
| 13 | Test + typecheck + e2e mở rộng | `test/` | 5 giờ |
| **Tổng** | | | **~55 giờ** |

Thứ tự ưu tiên nếu cắt giảm: giữ nguyên 1→4 (nội dung), gộp 10→sau cùng (thời tiết), 12 có thể làm song song.

---

## 11. Tiêu chí nghiệm thu (acceptance)

1. **Đếm được**: `NPCS.length ≥ 60`, `QUESTS.length ≥ 150`, map 13 vùng, `ENDINGS.length ≥ 12`.
2. **Mỗi NPC có quest riêng** — grep qua 60 NPC, không NPC nào thiếu quest.
3. **Mỗi NPC có shop riêng** (trừ NPC "giữ chuyện" được liệt kê trắng).
4. **Mai Hoa có 2 ô riêng** (hiên + nhà) và di chuyển theo giờ — test được bằng engine state.
5. **NPC hiện trên map** đúng node `npc` — test bằng Playwright click từng node.
6. **Kinh tế 3 lớp chạy end-to-end**: kiếm LS từ boss → mua đan hiếm → buff HUD đúng.
7. **4 đường phân nhánh đều đi được đến ending** — 4 e2e journey riêng.
8. **Không phá现有 save**: schema version vẫn 1, old save load về default an toàn.
9. **Toàn bộ test xanh**: `npm run typecheck`, `npm run lint`, `npx vitest run`, `npm run build`, `npx playwright test`.

---

## 12. Rủi ro và biện pháp

| Rủi ro | Mức | Biện pháp |
|---|---|---|
| Khối lượng nội dung làm vỡ file `quests.ts`/`npcs.ts` | Cao | Tách `quests/` và `npcs/` thành thư mục theo vùng (village.ts, market.ts, ...) |
| Làm hỏng determinism RNG (weather, thuần thú) | Cao | Mọi roll đi qua `state.rng` duy nhất — cấm `Math.random()` |
| Save cũ chết khi thêm field | Trung | Defaults trong `schema.ts`, giữ `version: 1` |
| Map mới phá route/exit hiện hữu | Trung | Test regional-map mở rộng ngay sau bước 2 |
| Ảnh 60 NPC làm bundle phình | Thấp | Lazy-load, chỉ ship ảnh NPC đã gặp |

---

## Phụ lục A — Phân chia quest theo chương (chi tiết)

- **C0**: 3 quest nhánh mở (mỗi nhánh 1)
- **C1 Village**: 12 side + 4 đêm = 16
- **C2 Market**: 22 side/phe + 2 đấu giá = 24
- **C3 Vạn Thảo Cốc**: 14 side + 1 chain 5 phần + 1 timed = 20
- **C4 Sect/Pavilion**: 20 side + 2 nhánh trộm/mua = 22
- **C5 Forest/Ridge**: 16 side + 2 timed thuần = 18
- **C6 Rift/Ruins**: 18 side + 2 secret = 20
- **C7 Peak/Frozen**: 14 side + 2 secret = 16
- **C8 Ascension**: 4 quest ending + 8 quest điều kiện sublayer = 12
- **Tổng đếm tay**: 3+16+24+20+22+18+20+16+12 = **151** (~150 mục tiêu, chênh 1 chấp nhận được)

## Phụ lục B — 12 loại linh thảo mới (Vạn Thảo Cốc)

Tơ Hồng / Tâm Băng / Huyết Sâm / Vân Lộ / Nguyệt Toại / Hỏa Liên / Bạch Kỳ / Thanh Đằng / Tử Cúc / Địa Tủy / Phong Trúc / Hư Trúc — mỗi loại 1 mùa xuất hiện + 1 công thức lai riêng (góp 12 công thức lai cho hệ 6.3).

## Phụ lục C — 12 loài linh thú

Bạch Hổ / Yêu Lang / Hạc Linh / Hồ Ly / Long Xà / Kỳ Lân Con / Trư Nha Sương / Liệt Khuyển / Ong Hoàng / Đào Tinh / Quy Thủy Quái / Vũ Điểu — mỗi loài 3 con (thường/đặc biệt/boss), mỗi con 1 mồi riêng.

## Phụ lục D — 16 trạng thái thời tiết

4 mùa: Xuân / Hạ / Thu / Đông × 4 trạng thái: Quang / Mưa / Sương / Bão. Mỗi cặp mùa×trạng thái có 1 hiệu ứng gameplay (giá thảo, sức mạnh boss, tốc độ di chuyển, xác suất gặp NPC ẩn).
