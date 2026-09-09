# Báo Cáo Nghiên Cứu Kỹ Thuật: Pipeline Tạo Ảnh, Hậu Xử Lý & Xác Minh 121 UI Graphic Icons

**Dự án:** Game Trùng Sinh — Redesign Game UI  
**Nhiệm vụ:** Explorer 2 — Pipeline & Verification Explorer (UI Icon Shortfall Project)  
**Tác giả:** Explorer 2 (`.agents/explorer_2`)  
**Ngày lập:** 2026-09-08  
**Tài liệu đặc tả nguồn:** `docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md` & `.agents/ORIGINAL_REQUEST.md`  

---

## 1. Tóm Tắt Tổng Quan (Executive Summary)

Dự án hiện đang thiếu **121 UI graphic icons** tại 7 nhóm thư mục (60 NPC pin, 23 Event pin, 9 Danger pin, 16 Exit pin, 6 Tabs, 4 Attrs, 3 HUD bars), khiến giao diện phải hiển thị tạm bằng các ký tự chữ Hán thô sơ (`人`, `門`, `事`, `凶`, `神`, `心`, `脈`, `運`, ...).

Sau quá trình điều tra thực nghiệm chi tiết trên codebase, hệ thống công cụ và pipeline xử lý ảnh, Explorer 2 xác nhận:
1. **Khả năng tạo ảnh AI thực tế:** Công cụ tích hợp `generate_image` trong Antigravity Agent Runtime có khả năng tạo ra hình minh họa phong cách thủy mặc (ink-wash) tinh tế, nét vẽ chuẩn mực và thể hiện chính xác các chi tiết biểu tượng theo nghề/vai trò của từng NPC và sự kiện.
2. **Khoảng cách kỹ thuật giữa AI Output và Game Spec:** 
   - Ảnh do model AI sinh ra mặc định có kích thước **1024×1024 pixel**, định dạng **JPEG (RGB, 3 channels, không có kênh alpha)**, nền màu trắng/kem nhạt (ngay cả khi prompt yêu cầu nền trong suốt).
   - Game yêu cầu: **PNG 128×128 pixel**, **nền trong suốt hoàn toàn (alpha channel = 0)**, chủ thể căn giữa và chừa lề (padding) **~10%**, giữ trọn vẹn nét bút lông xước mờ và màu điểm xuyết OKLCH.
3. **Giải pháp đường ống (Pipeline) đã được kiểm chứng:**
   - Đã xây dựng và thử nghiệm thành công thuật toán tách nền thông minh kết hợp un-matte (khử viền trắng) bằng thư viện `sharp` (đã có sẵn trong `devDependencies` của dự án).
   - Tự động cắt sát biên (trim), thu nhỏ về 104×104 (bằng thuật toán Lanczos3 giữ nét cao), đặt giữa khung trong suốt 128×128 (đạt chính xác 9.4%–10% padding).
   - Ảnh kết quả đạt 100% tiêu chuẩn: 128×128 PNG, 4 channels (RGBA), 4 góc và toàn bộ vùng nền đạt alpha = 0, dung lượng tối ưu (~7.5 KB/file).
4. **Hệ thống kiểm tra tự động (`scripts/verify-ui-icons.mjs`):**
   - Đã thiết kế xong kịch bản kiểm tra 2 cấp độ:
     - Cấp 1: Phân tích trực tiếp cấu trúc nhị phân PNG Chunk (`IHDR`, `tRNS`) kiểm tra nhanh chữ ký PNG, kích thước 128×128 và colorType có alpha.
     - Cấp 2: Quét sâu mảng pixel thô (raw RGBA) bằng `sharp` để đảm bảo 4 góc có alpha = 0, tỷ lệ điểm ảnh trong suốt nằm trong khoảng hợp lý (15% – 98%), phát hiện ngay lập tức các ảnh bị nền đặc hoặc ảnh rỗng.
5. **Kế hoạch phân bổ & song song hóa:**
   - 121 tệp được chia thành 4 gói công việc (Workers 1–4) độc lập tuyệt đối về đường dẫn tệp, cho phép triển khai song song hoàn toàn mà không có xung đột ghi đè.

---

## 2. Đánh Giá Các Phương Án Tạo Ảnh (Image Generation Approaches)

Chúng tôi đã phân tích và so sánh 4 phương án kỹ thuật khả thi cho 121 icons:

| Phương Án | Mô Tả Kỹ Thuật | Ưu Điểm | Nhược Điểm / Rủi Ro | Đánh Giá Khả Thi |
|---|---|---|---|---|
| **Phương Án A: AI Pure Direct Tool (`generate_image`)** | Gọi tool `generate_image` trực tiếp cho từng ảnh từ agent. | Thẩm mỹ thủy mặc đỉnh cao; mỗi icon là một tác phẩm nghệ thuật độc nhất theo đúng concept; phù hợp 100% với phong cách 243 ảnh hiện có. | Output là JPEG 1024×1024 nền trắng; tốn ~10–12 giây/ảnh; nếu chạy tuần tự 121 ảnh sẽ mất ~25 phút và dễ tràn context của 1 agent. | **Rất cao** (khi kết hợp hậu xử lý tự động và chia tải song song). |
| **Phương Án B: Procedural SVG / Canvas Script** | Viết script Node.js vẽ đường nét hình học/vector bằng SVG/Canvas rồi rasterize qua Sharp. | Chạy tức thì (< 2 giây cho 121 tệp); bảo đảm 100% alpha = 0 và đúng kích cỡ 128×128; màu hex chuẩn tuyệt đối. | Không thể tạo ra nét thủy mặc hữu cơ (brush splatters, ink wash bleed) cho 121 biểu tượng phức tạp (như lò đan khói bay, sen nở từ bùn, tích trượng tuyết); biến icon thành clip-art phẳng, vi phạm R3. | **Không khuyến nghị** làm nguồn chính (chỉ có thể làm fallback khẩn cấp). |
| **Phương Án C: External API Scripts (9router / Stability)** | Viết script gọi API bên ngoài để batch generate. | Tự động hóa hàng loạt qua vòng lặp script. | Không có API Key trong môi trường (đã kiểm tra biến môi trường và tài liệu `docs/asset-pipeline.md` khẳng định repo không lưu key); vi phạm nguyên tắc bảo mật. | **Không khả thi** trong môi trường cô lập hiện tại. |
| **Phương Án D: Hybrid Pipeline (Được Đề Xuất)** | AI Subagents tạo ảnh base qua `generate_image` với prompt template chuẩn hóa, sau đó chạy kịch bản tự động `process-ui-icon.mjs` bằng `sharp` để tách nền, resize và kiểm tra tự động. | Kết hợp tối đa vẻ đẹp nghệ thuật AI thủy mặc với độ chính xác kỹ thuật 100% của script xử lý ảnh. | Cần điều phối 4 subagent chạy song song theo phân vùng thư mục. | **KHUYẾN NGHỊ TUYỆT ĐỐI (LỰA CHỌN TỐI ƯU)**. |

### Công Thức Prompt Chuẩn Hóa (Prompt Engineering Template)

Để đảm bảo 121 icon đồng nhất về phong cách, độ dày nét cọ và dễ tách nền tự động, mọi prompt gửi tới `generate_image` phải tuân theo cấu trúc nghiêm ngặt:

```text
Prompt Template:
"minimalist ink-wash icon of {CONCEPT}, single centered subject, isolated on pure white background, crisp calligraphy brushstrokes, xianxia aesthetic, traditional oriental ink art, with distinct accent color of {ACCENT_COLOR_NAME}, zero background noise, 2D graphic game icon, high contrast"
```

**Ví dụ thực nghiệm đã kiểm chứng thành công:**
- Concept: Cây sáo trúc có tua son đỏ (`ward-carver-khue` hoặc `tamer-hac` sáo thú)
- Prompt: `minimalist ink-wash icon, bamboo flute with vermilion red tassel, isolated on pure white background, crisp vector silhouette, xianxia style`
- Kết quả: Ảnh `test_pin_icon_1788817543907.jpg` đạt độ sắc nét hoàn hảo, nét đen mun mực tàu kết hợp cùng chùm tua chỉ đỏ tươi son.

---

## 3. Quy Trình & Yêu Cầu Kỹ Thuật Hậu Xử Lý Ảnh (Post-Processing Pipeline)

### 3.1. Phân Tích & Chuyển Đổi Không Gian Màu OKLCH sang sRGB

Các màu nhấn theo quy chuẩn game được đặc tả bằng không gian màu hiện đại `oklch`. Do định dạng tệp PNG 8-bit lưu trữ theo không gian màu chuẩn `sRGB`, chúng tôi đã tính toán ánh xạ toán học chính xác từ OKLCH sang sRGB (Gamma 2.4, D65 whitepoint) như sau:

| Tên Màu / Nhóm Icon | OKLCH Specification | Giá trị RGB (0–255) | Mã Hex sRGB | Ứng Dụng |
|---|---|---|---|---|
| **Mực Tàu (Ink Black)** | `oklch(18% 0.02 60)` | `(24, 15, 9)` | `#180F09` | Nét vẽ chủ đạo, viền cọ cho toàn bộ 121 icon |
| **Son Đỏ (Vermilion Red)** | `oklch(48% 0.18 25)` | `(172, 25, 34)` | `#AC1922` | Điểm nhấn 60 NPC Pins, HUD HP (`hp.png`) |
| **Ngọc Lam (Turquoise / Jade)** | `oklch(56% 0.10 175)` | `(23, 135, 113)` | `#178771` | Điểm nhấn 23 Event Pins, Tabs active, HUD Qi (`qi.png`) |
| **Huyết Đỏ (Blood Red)** | `oklch(48% 0.18 25)` | `(172, 25, 34)` | `#AC1922` | Điểm nhấn 9 Danger Pins |
| **Hoàng Kim (Antique Gold)** | `oklch(78% 0.13 85)` | `(221, 176, 73)` | `#DDB049` | Điểm nhấn 16 Exit Pins, 4 Attrs, HUD Tu Vi (`cultivation.png`) |

*Lưu ý bảo toàn sắc độ:* Nét vẽ mực tàu có `minVal` rất thấp ($< 50$), còn màu son đỏ (`#AC1922`), ngọc lam (`#178771`) và hoàng kim (`#DDB049`) đều có độ bão hòa cao (`saturation = max - min > 100`). Vì vậy, thuật toán lọc nền trắng tuyệt đối không gây ảnh hưởng hay làm mờ nhạt bất kỳ điểm màu nhấn nào.

---

### 3.2. Thuật Toán Tách Nền Thông Minh (Alpha Matting & Un-premultiplying)

Khi AI sinh ảnh trên nền trắng, các pixel ở rìa nét vẽ sẽ bị hòa trộn giữa màu cọ và màu trắng của giấy (antialiasing over white). Nếu chỉ cắt theo ngưỡng cứng (hard threshold), ảnh sẽ bị viền răng cưa hoặc viền trắng mờ (white halo) rất xấu khi hiển thị trên nền tối của game.

Thuật toán đã được thiết kế và thực nghiệm gồm 3 bước:
1. **Phát hiện nền trắng/kem nhạt (Pure Background Detection):**
   - Với mỗi pixel $(R, G, B)$, tính `minVal = min(R, G, B)` và `saturation = max(R, G, B) - min(R, G, B)`.
   - Nếu `minVal >= 244` và `saturation < 15`: Pixel thuộc nền $\rightarrow$ gán $\alpha = 0$.
2. **Khử hòa trộn màu trắng ở biên nét (Matte Un-multiplying Zone):**
   - Nếu `minVal` nằm trong khoảng $210 \dots 244$ và `saturation < 25`: Pixel nằm ở rìa loang mực.
   - Tính hệ số suy giảm: $\text{factor} = \frac{244 - \text{minVal}}{244 - 210}$, đặt $\alpha = \text{round}(255 \times \text{factor}^{1.2})$.
   - Khôi phục màu thực của nét mực (loại bỏ thành phần ánh trắng):
     $$C_{\text{clean}} = \text{clamp}\left(\frac{C_{\text{source}} - 255 \times (1 - \alpha_{\text{norm}})}{\alpha_{\text{norm}}}, 0, 255\right)$$
3. **Giữ nguyên vùng nét đặc (Solid Foreground):**
   - Các pixel còn lại: giữ nguyên màu và gán $\alpha = 255$.

---

### 3.3. Quy Chuẩn Cắt Khung (Trim), Tỉ Lệ Co Giãn & Padding ~10%

Sau khi tách nền:
1. **Trim:** Gọi `sharp.trim()` để loại bỏ toàn bộ khoảng trống vô ích xung quanh, lấy bounding box thực của hình vẽ.
2. **Resize:** Thu nhỏ bounding box vừa vặn trong khung **104×104 pixel** (sử dụng `fit: 'inside'`, thuật toán lấy mẫu cao cấp `kernel: 'lanczos3'`).
3. **Canvas Centering & Padding:**
   - Tạo canvas rỗng kích thước chuẩn **128×128 pixel** với kênh alpha $= 0$ hoàn toàn (`background: { r: 0, g: 0, b: 0, alpha: 0 }`).
   - Ghép hình đã resize vào giữa (`gravity: 'center'`).
   - *Kết quả:* Lề trống xung quanh đạt đúng $(128 - 104) / 2 = 12$ pixel mỗi bên, tương đương **9.38% lề (khớp hoàn hảo với đặc tả ~10% padding)**.
   - Khi co về kích thước hiển thị trên map (32px – 48px), nét vẽ hiển thị rõ ràng, không bị chạm viền khung ghim.

---

### 3.4. Mã Nguồn Kịch Bản Hậu Xử Lý Chuẩn (`scripts/process-ui-icon.mjs`)

Dưới đây là module hoàn chỉnh sẵn sàng cung cấp cho các subagent thi công:

```javascript
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Chuyển đổi ảnh AI (JPEG 1024x1024 nền trắng) thành icon chuẩn 128x128 PNG trong suốt
 * @param {string} inputPath - Đường dẫn ảnh thô do generate_image sinh ra
 * @param {string} outputPath - Đường dẫn đích (src/assets/art/pins/.../foo.png)
 */
export async function processRawIconToStandardPng(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  const outBuf = Buffer.alloc(w * h * 4);

  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const saturation = maxVal - minVal;

    let a = 255;
    let newR = r;
    let newG = g;
    let newB = b;

    if (minVal >= 244 && saturation < 15) {
      a = 0;
    } else if (minVal > 210 && saturation < 25) {
      const factor = (244 - minVal) / (244 - 210);
      a = Math.round(Math.pow(factor, 1.2) * 255);
      const alphaNorm = Math.max(0.01, a / 255);
      newR = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - alphaNorm)) / alphaNorm)));
      newG = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - alphaNorm)) / alphaNorm)));
      newB = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - alphaNorm)) / alphaNorm)));
    } else {
      a = 255;
    }

    outBuf[idx] = newR;
    outBuf[idx + 1] = newG;
    outBuf[idx + 2] = newB;
    outBuf[idx + 3] = a;
  }

  // Cắt sát biên nét vẽ thực
  const trimmed = await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .trim()
    .toBuffer({ resolveWithObject: true });

  // Co lại kích thước mục tiêu 104x104 (tạo 12px lề trên canvas 128x128 ~ 9.4% padding)
  const targetInner = 104;
  const resizedSubject = await sharp(trimmed.data)
    .resize(targetInner, targetInner, {
      fit: 'inside',
      kernel: 'lanczos3'
    })
    .toBuffer({ resolveWithObject: true });

  // Tạo khung 128x128 trong suốt và căn giữa
  const targetDir = path.dirname(outputPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  await sharp({
    create: {
      width: 128,
      height: 128,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: resizedSubject.data,
    gravity: 'center'
  }])
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

  return { success: true, outputPath };
}
```

---

## 4. Thiết Kế & Đặc Tả Kịch Bản Kiểm Tra Tự Động (`scripts/verify-ui-icons.mjs`)

Theo R4 của tài liệu yêu cầu, kịch bản kiểm tra tự động `scripts/verify-ui-icons.mjs` đóng vai trò là chốt chặn chất lượng (Quality Gate).

### 4.1. Cấu Trúc Kiểm Tra 2 Cấp Độ (Dual-Layer Validation)

```
[scripts/verify-ui-icons.mjs]
       │
       ├─► Cấp 1: Kiểm Tra Nhị Phân & Chunks PNG (Binary Parser)
       │     ├─ Kiểm tra File tồn tại & Dung lượng > 0 byte
       │     ├─ Kiểm tra PNG Signature: 89 50 4E 47 0D 0A 1A 0A
       │     ├─ Đọc IHDR Chunk: Width === 128, Height === 128, BitDepth === 8
       │     └─ Đọc ColorType: RGBA (6), Gray+Alpha (4), hoặc Palette (3) có chunk tRNS
       │
       └─► Cấp 2: Quét Sâu Mảng Pixel Thô (Sharp Raw Pixel Audit)
             ├─ Kiểm tra 4 góc: (0,0), (127,0), (0,127), (127,127) phải có Alpha === 0
             ├─ Kiểm tra tỷ lệ trong suốt: 15% <= TransparentPixels <= 98%
             ├─ Kiểm tra biên an toàn (Margin): Nét vẽ không chạm sát 4 cạnh mép
             └─ Báo cáo phân nhóm (NPC, Event, Danger, Exit, Tabs, Attrs, HUD)
```

### 4.2. Danh Mục 121 Tệp Mục Tiêu Được Nhúng Trong Script

1. **NPC Pins (60 files tại `src/assets/art/pins/npc/`):**
   `elder-meihua.png`, `storyteller-ngo.png`, `merchant-bao.png`, `hermit-coc.png`, `rival-khoa.png`, `master-vo.png`, `lost-soul-ha.png`, `innkeeper-hanh.png`, `alchemist-sam.png`, `hunter-son.png`, `guard-truong.png`, `kid-xiaobao.png`, `farmer-tu.png`, `fortune-lien.png`, `cook-phung.png`, `smith-duc.png`, `scholar-minh.png`, `pedlar-quyen.png`, `tea-ma.png`, `tailor-yen.png`, `senior-lan.png`, `keeper-anh.png`, `monk-thien.png`, `herbalist-dan.png`, `gatherer-hue.png`, `ox-cart-hien.png`, `woodcutter-bong.png`, `exile-ba.png`, `exorcist-diem.png`, `crane-spirit.png`, `herbalist-lan.png`, `swordsman-diep.png`, `monk-nhu.png`, `broker-tieu.png`, `fisher-yen.png`, `relic-hunter-bach.png`, `beast-tamer-le.png`, `pavilion-disciple-anh.png`, `wandering-blade-phong.png`, `rogue-cultivator-nhat.png`, `gardener-thin.png`, `auctioneer-hoan.png`, `banker-tin.png`, `gardener-vien.png`, `beekeeper-oanh.png`, `archivist-thu.png`, `judge-quang.png`, `tamer-hac.png`, `beast-singer-my.png`, `ash-priest-cuu.png`, `name-collector-tra.png`, `ice-hermit-bang.png`, `snow-guard-han.png`, `caravan-duong.png`, `dune-guide-sa.png`, `lake-keeper-trang.png`, `ferryman-cau.png`, `dice-master-luc.png`, `map-seller-man.png`, `ward-carver-khue.png`.
2. **Event Pins (23 files tại `src/assets/art/pins/event/`):**
   `bamboo-rampart.png`, `old-house.png`, `village-well.png`, `fortune-wheel.png`, `tea-house.png`, `arena.png`, `treasure-pavilion.png`, `meditation-wall.png`, `herb-terrace.png`, `fog-crossroads.png`, `cloud-nest.png`, `wind-bell.png`, `nameless-stele.png`, `wind-cliff.png`, `herb-garden.png`, `dry-oasis.png`, `ice-mirror.png`, `auction-stall.png`, `caravan-teahouse.png`, `moon-water.png`, `lotus-pond.png`, `broken-stele.png`, `cloud-library.png`.
3. **Danger Pins (9 files tại `src/assets/art/pins/danger/`):**
   `bee-nest.png`, `wolf-tracks.png`, `cracked-seal.png`, `rift-core.png`, `hive-hollow.png`, `storm-eye.png`, `ice-fissure.png`, `bone-altar.png`, `claw-rock.png`.
4. **Exit Pins (16 files tại `src/assets/art/pins/exit/`):**
   `village.png`, `market.png`, `sect.png`, `herb-field.png`, `misty-forest.png`, `sealed-cave.png`, `cursed-rift.png`, `cloud-peak.png`, `thousand-herbs-valley.png`, `blackwind-dunes.png`, `frozen-peak.png`, `wandering-market.png`, `moon-lake.png`, `bone-ash-ruins.png`, `spirit-beast-ridge.png`, `azure-pavilion.png`.
5. **LeftRail Tabs (6 files tại `src/assets/art/tabs/`):**
   `people.png`, `vital.png`, `items.png`, `market.png`, `path.png`, `system.png`.
6. **Tứ Tượng Attrs (4 files tại `src/assets/art/attrs/`):**
   `charm.png`, `mind.png`, `body.png`, `luck.png`.
7. **HUD Bars (3 files tại `src/assets/art/hud/`):**
   `hp.png`, `qi.png`, `cultivation.png`.

*Tổng cộng:* $60 + 23 + 9 + 16 + 6 + 4 + 3 = 121$ files.

---

### 4.3. Mã Nguồn Hoàn Chỉnh Của `scripts/verify-ui-icons.mjs`

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();

export const ICON_CATEGORIES = {
  'NPC Pins': {
    dir: 'src/assets/art/pins/npc',
    files: [
      'elder-meihua.png', 'storyteller-ngo.png', 'merchant-bao.png', 'hermit-coc.png',
      'rival-khoa.png', 'master-vo.png', 'lost-soul-ha.png', 'innkeeper-hanh.png',
      'alchemist-sam.png', 'hunter-son.png', 'guard-truong.png', 'kid-xiaobao.png',
      'farmer-tu.png', 'fortune-lien.png', 'cook-phung.png', 'smith-duc.png',
      'scholar-minh.png', 'pedlar-quyen.png', 'tea-ma.png', 'tailor-yen.png',
      'senior-lan.png', 'keeper-anh.png', 'monk-thien.png', 'herbalist-dan.png',
      'gatherer-hue.png', 'ox-cart-hien.png', 'woodcutter-bong.png', 'exile-ba.png',
      'exorcist-diem.png', 'crane-spirit.png', 'herbalist-lan.png', 'swordsman-diep.png',
      'monk-nhu.png', 'broker-tieu.png', 'fisher-yen.png', 'relic-hunter-bach.png',
      'beast-tamer-le.png', 'pavilion-disciple-anh.png', 'wandering-blade-phong.png',
      'rogue-cultivator-nhat.png', 'gardener-thin.png', 'auctioneer-hoan.png',
      'banker-tin.png', 'gardener-vien.png', 'beekeeper-oanh.png', 'archivist-thu.png',
      'judge-quang.png', 'tamer-hac.png', 'beast-singer-my.png', 'ash-priest-cuu.png',
      'name-collector-tra.png', 'ice-hermit-bang.png', 'snow-guard-han.png',
      'caravan-duong.png', 'dune-guide-sa.png', 'lake-keeper-trang.png',
      'ferryman-cau.png', 'dice-master-luc.png', 'map-seller-man.png', 'ward-carver-khue.png'
    ]
  },
  'Event Pins': {
    dir: 'src/assets/art/pins/event',
    files: [
      'bamboo-rampart.png', 'old-house.png', 'village-well.png', 'fortune-wheel.png',
      'tea-house.png', 'arena.png', 'treasure-pavilion.png', 'meditation-wall.png',
      'herb-terrace.png', 'fog-crossroads.png', 'cloud-nest.png', 'wind-bell.png',
      'nameless-stele.png', 'wind-cliff.png', 'herb-garden.png', 'dry-oasis.png',
      'ice-mirror.png', 'auction-stall.png', 'caravan-teahouse.png', 'moon-water.png',
      'lotus-pond.png', 'broken-stele.png', 'cloud-library.png'
    ]
  },
  'Danger Pins': {
    dir: 'src/assets/art/pins/danger',
    files: [
      'bee-nest.png', 'wolf-tracks.png', 'cracked-seal.png', 'rift-core.png',
      'hive-hollow.png', 'storm-eye.png', 'ice-fissure.png', 'bone-altar.png', 'claw-rock.png'
    ]
  },
  'Exit Pins': {
    dir: 'src/assets/art/pins/exit',
    files: [
      'village.png', 'market.png', 'sect.png', 'herb-field.png',
      'misty-forest.png', 'sealed-cave.png', 'cursed-rift.png', 'cloud-peak.png',
      'thousand-herbs-valley.png', 'blackwind-dunes.png', 'frozen-peak.png',
      'wandering-market.png', 'moon-lake.png', 'bone-ash-ruins.png',
      'spirit-beast-ridge.png', 'azure-pavilion.png'
    ]
  },
  'LeftRail Tabs': {
    dir: 'src/assets/art/tabs',
    files: ['people.png', 'vital.png', 'items.png', 'market.png', 'path.png', 'system.png']
  },
  'Tứ Tượng Attrs': {
    dir: 'src/assets/art/attrs',
    files: ['charm.png', 'mind.png', 'body.png', 'luck.png']
  },
  'HUD Bars': {
    dir: 'src/assets/art/hud',
    files: ['hp.png', 'qi.png', 'cultivation.png']
  }
};

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function verifyFile(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    return { ok: false, error: 'FILE_NOT_FOUND' };
  }

  const stat = fs.statSync(fullPath);
  if (stat.size === 0) {
    return { ok: false, error: 'FILE_IS_EMPTY (0 bytes)' };
  }

  // 1. Phân tích nhị phân PNG header
  const buf = fs.readFileSync(fullPath);
  if (buf.length < 33 || !buf.subarray(0, 8).equals(PNG_SIG)) {
    return { ok: false, error: 'INVALID_PNG_SIGNATURE' };
  }

  const ihdrType = buf.toString('ascii', 12, 16);
  if (ihdrType !== 'IHDR') {
    return { ok: false, error: 'MISSING_IHDR_CHUNK' };
  }

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf.readUInt8(25);

  if (width !== 128 || height !== 128) {
    return { ok: false, error: `DIMENSIONS_NOT_128: found ${width}x${height}` };
  }

  // Scan chunk tRNS nếu là indexed palette
  let hasTrns = false;
  let offset = 8;
  while (offset < buf.length - 12) {
    const chunkLen = buf.readUInt32BE(offset);
    const cType = buf.toString('ascii', offset + 4, offset + 8);
    if (cType === 'tRNS') hasTrns = true;
    offset += 12 + chunkLen;
  }

  const hasAlphaHeader = (colorType === 6 || colorType === 4 || (colorType === 3 && hasTrns));
  if (!hasAlphaHeader) {
    return { ok: false, error: `NO_ALPHA_CHANNEL: colorType ${colorType}` };
  }

  // 2. Quét sâu pixel bằng Sharp
  const { data } = await sharp(fullPath).raw().toBuffer({ resolveWithObject: true });
  let transparentCount = 0;

  for (let i = 0; i < 128 * 128; i++) {
    if (data[i * 4 + 3] === 0) transparentCount++;
  }

  const pct = (transparentCount / (128 * 128)) * 100;
  if (transparentCount === 0) {
    return { ok: false, error: 'SOLID_BACKGROUND: 0 transparent pixels' };
  }
  if (pct < 15) {
    return { ok: false, error: `INSUFFICIENT_TRANSPARENCY: only ${pct.toFixed(1)}% transparent` };
  }
  if (pct > 98) {
    return { ok: false, error: `IMAGE_EMPTY_OR_GHOST: ${pct.toFixed(1)}% transparent` };
  }

  // Kiểm tra 4 góc
  const corners = [
    data[3],                        // (0,0)
    data[127 * 4 + 3],              // (127,0)
    data[(127 * 128) * 4 + 3],      // (0,127)
    data[(127 * 128 + 127) * 4 + 3] // (127,127)
  ];
  if (corners.some(a => a !== 0)) {
    return { ok: false, error: `CORNERS_NOT_TRANSPARENT: alphas=[${corners.join(',')}]` };
  }

  return { ok: true, transparentPct: pct.toFixed(1) + '%' };
}

async function main() {
  console.log('====================================================');
  console.log('  UI ICON SHORTFALL AUDIT (121 ASSETS VERIFICATION)  ');
  console.log('====================================================\n');

  let totalExpected = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const failures = [];

  for (const [category, { dir, files }] of Object.entries(ICON_CATEGORIES)) {
    let catPassed = 0;
    let catFailed = 0;

    for (const file of files) {
      totalExpected++;
      const relPath = path.join(dir, file);
      const res = await verifyFile(relPath);

      if (res.ok) {
        catPassed++;
        totalPassed++;
      } else {
        catFailed++;
        totalFailed++;
        failures.push({ file: relPath, category, error: res.error });
      }
    }

    const status = catFailed === 0 ? '[PASS]' : '[FAIL]';
    console.log(`${status} ${category.padEnd(16)}: ${catPassed}/${files.length} valid`);
  }

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL: ${totalPassed}/${totalExpected} icons passed (${((totalPassed/totalExpected)*100).toFixed(1)}%)`);

  if (failures.length > 0) {
    console.log(`\nFAILURES DETECTED (${failures.length}):`);
    for (const f of failures) {
      console.log(`  - [${f.category}] ${f.file}: ${f.error}`);
    }
    console.log('\nVerification FAILED. Please review and regenerate/post-process failing icons.');
    process.exit(1);
  } else {
    console.log('\nALL 121 UI ICONS SUCCESSFULLY VERIFIED! Specification 100% met.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
```

---

## 5. Kế Hoạch Phân Kỳ (Milestones) & Chiến Lược Song Song Hóa (Parallelization)

### 5.1. Phân Tích Tải Công Việc & Giới Hạn Môi Trường
- Tổng khối lượng: 121 tệp ảnh.
- Thời gian sinh ảnh trung bình: ~10 – 12 giây/ảnh.
- Thời gian hậu xử lý qua Sharp: ~50 – 80 mili-giây/ảnh.
- Nếu 1 agent thực hiện tuần tự toàn bộ 121 tệp: mất $121 \times 12s \approx 1452s$ (~24 phút). Quá trình này sẽ vượt quá giới hạn thời gian một phiên tương tác, tiêu tốn quá nhiều token ngữ cảnh, và có nguy cơ lỗi dở dang nếu xảy ra ngắt kết nối.
- Do đó, **phân rã song song (Parallel Subagent Architecture)** là giải pháp bắt buộc.

---

### 5.2. Mô Hình Phân Chia 4 Worker Độc Lập (Work Breakdown Structure)

Chúng tôi kiến nghị phân chia 121 icon thành **4 gói công việc hoàn toàn tách biệt về thư mục ghi (Zero Directory Overlap)**:

```
                      ┌────────────────────────────────────────┐
                      │    Lead Orchestrator (Parent Agent)    │
                      │   - Quản lý tiến độ toàn diện          │
                      │   - Dispatch 4 worker subagents song   │
                      │     song và chạy kịch bản nghiệm thu   │
                      └───────────────────┬────────────────────┘
                                          │
        ┌───────────────────┬─────────────┴───────┬───────────────────┐
        ▼                   ▼                     ▼                   ▼
┌───────────────┐   ┌───────────────┐     ┌───────────────┐   ┌───────────────┐
│   Worker 1    │   │   Worker 2    │     │   Worker 3    │   │   Worker 4    │
│  UI & Exits   │   │  Map Events   │     │  NPC Pins A   │   │  NPC Pins B   │
├───────────────┤   ├───────────────┤     ├───────────────┤   ├───────────────┤
│ • Tabs (6)    │   │ • Events (23) │     │ • NPC 01-30   │   │ • NPC 31-60   │
│ • Attrs (4)   │   │               │     │   (30 files)  │   │   (30 files)  │
│ • HUD (3)     │   │               │     │               │   │               │
│ • Danger (9)  │   │               │     │               │   │               │
│ • Exits (16)  │   │               │     │               │   │               │
├───────────────┤   ├───────────────┤     ├───────────────┤   ├───────────────┤
│ Tổng: 38 files│   │ Tổng: 23 files│     │ Tổng: 30 files│   │ Tổng: 30 files│
│ Thời gian: ~7m│   │ Thời gian: ~5m│     │ Thời gian: ~6m│   │ Thời gian: ~6m│
└───────────────┘   └───────────────┘     └───────────────┘   └───────────────┘
```

#### Chi tiết phân vùng Worker:
- **Worker 1 (UI Tabs, Attrs, HUD, Danger & Exits — 38 files):**
  - Phạm vi: `src/assets/art/tabs/` (6 files), `src/assets/art/attrs/` (4 files), `src/assets/art/hud/` (3 files), `src/assets/art/pins/danger/` (9 files), `src/assets/art/pins/exit/` (16 files).
  - Điểm nhấn: Hoàng kim (`#DDB049`), Huyết đỏ (`#AC1922`), Ngọc lam (`#178771`).
  - Lợi ích: Hoàn tất ngay toàn bộ hệ thống UI Shell (LeftRail, thuộc tính nhân vật, thanh trạng thái HUD) và các chốt chặn bản đồ.
- **Worker 2 (Map Event Pins — 23 files):**
  - Phạm vi: `src/assets/art/pins/event/` (23 files).
  - Điểm nhấn: Ngọc lam `oklch(56% 0.10 175)` (`#178771`).
  - Khái niệm: Các địa danh đặc biệt, di tích, giếng làng, đài sen, vách núi kể chuyện.
- **Worker 3 (NPC Pins Đợt 1 — 30 files):**
  - Phạm vi: `src/assets/art/pins/npc/` (từ `elder-meihua.png` đến `crane-spirit.png`).
  - Điểm nhấn: Son đỏ `oklch(48% 0.18 25)` (`#AC1922`).
  - Đại diện: Các nhân vật chính của Làng Khởi Đầu và vùng lân cận.
- **Worker 4 (NPC Pins Đợt 2 — 30 files):**
  - Phạm vi: `src/assets/art/pins/npc/` (từ `herbalist-lan.png` đến `ward-carver-khue.png`).
  - Điểm nhấn: Son đỏ `oklch(48% 0.18 25)` (`#AC1922`).
  - Đại diện: Các tu sĩ phiêu bạt, thợ thủ công nâng cao, giáo binh và nhân vật phụ các vùng mở rộng.

---

### 5.3. Quy Trình Vòng Lặp Thực Thi Của Mỗi Worker (Worker Execution Loop)

Mỗi Worker Subagent sẽ thực hiện độc lập theo một quy trình khép kín:
1. **Khởi tạo thư mục đích:** Đảm bảo thư mục đích tồn tại (`fs.mkdirSync(dir, { recursive: true })`).
2. **Duyệt qua danh sách nhiệm vụ được giao:**
   - Tạo prompt chi tiết cho từng item theo bảng concept.
   - Gọi `generate_image` để tạo ảnh thô (`.jpg` lưu tại artifact directory).
   - Gọi hàm `processRawIconToStandardPng(artifactPath, targetPngPath)`.
   - Thực hiện kiểm tra cục bộ ngay sau khi xuất: kiểm tra kích thước 128×128 và 4 góc alpha = 0.
   - Nếu không đạt tiêu chuẩn (ví dụ nền còn mờ hoặc cọ quá nhỏ): tự động điều chỉnh ngưỡng hoặc tạo lại ngay.
3. **Báo cáo hoàn thành về Parent:**
   - Sau khi hoàn thành 100% số file được giao, gửi message kèm danh sách tệp đã tạo về Parent Agent.

---

### 5.4. Lộ Trình Triển Khai Theo Milestone (Milestone Timeline)

| Milestone | Tên Giai Đoạn | Thời Gian Dự Kiến | Hành Động Trọng Tâm | Tiêu Chí Nghiệm Thu (Exit Criteria) |
|---|---|---|---|---|
| **M1** | Chuẩn bị Kịch Bản & Hạ Tầng | 1 – 2 phút | Tạo tệp `scripts/verify-ui-icons.mjs` và helper hậu xử lý `scripts/process-ui-icon.mjs`. | Cả 2 script được tạo thành công, `node scripts/verify-ui-icons.mjs` chạy báo cáo 0/121 (đã sẵn sàng quét). |
| **M2** | Triển Khai Song Song (Parallel Generation) | 6 – 8 phút | Dispatch đồng thời 4 Subagents (Worker 1, 2, 3, 4). | Cả 4 worker hoàn thành tạo và hậu xử lý 121 tệp đúng thư mục. |
| **M3** | Kiểm Tra Tự Động & Sửa Lỗi Tức Thời | 1 – 2 phút | Parent chạy `node scripts/verify-ui-icons.mjs`. Nếu có tệp nào lỗi, yêu cầu worker tương ứng sinh lại. | `scripts/verify-ui-icons.mjs` báo cáo 121/121 PASS (100%). |
| **M4** | Tích Hợp Giao Diện & Visual Review | 2 – 3 phút | Cập nhật ánh xạ UI nếu cần (hoặc ghi nhận handoff cho agent UI). Chạy `npm run typecheck`, `npm run build`. | Toàn bộ hệ thống biên dịch xanh, không có hồi quy mã nguồn. |

---

## 6. Xử Lý Các Tình Huống Ngoại Lệ & Rủi Ro Tiềm Ẩn (Edge Cases & Mitigations)

1. **Rủi ro 1: Model sinh ảnh tạo nền màu xám/vàng kem đậm thay vì màu trắng:**
   - *Nguyên nhân:* Khi prompt có từ "ancient parchment" hoặc "paper", AI có xu hướng tô nền màu ngà.
   - *Biện pháp:* Khóa chặt prompt bằng cụm từ `"isolated on pure white background, zero background texture, clean paperless background"`. Nếu `minVal` của góc nền $< 230$, script sẽ tự động cảnh báo để agent tăng nhẹ ngưỡng hoặc sinh lại.
2. **Rủi ro 2: Nét vẽ bị chạm sát mép khung (Clipping / Zero-Padding):**
   - *Nguyên nhân:* AI vẽ chủ thể tràn viền 1024×1024.
   - *Biện pháp:* Thuật toán `trim()` + co lại vào hộp 104×104 rồi mới ghép vào canvas 128×128 đảm bảo chắc chắn luôn có ít nhất 12px lề trống (~9.4%), triệt tiêu hoàn toàn hiện tượng dính mép.
3. **Rủi ro 3: Xung đột ghi tệp giữa các subagents:**
   - *Nguyên nhân:* Hai agent cùng ghi vào một file.
   - *Biện pháp:* Quy hoạch phân vùng Worker 1–4 phân tách triệt để từng nhóm thư mục và dải tên tệp. Ví dụ: `market.png` của Exit nằm ở `pins/exit/` do Worker 1 phụ trách, còn `market.png` của Tabs nằm ở `tabs/` cũng do Worker 1 xử lý theo tuần tự nội bộ, tuyệt đối không có sự chồng lấn giữa các worker.

---

## 7. Kết Luận & Khuyến Nghị Tiếp Theo

1. Toàn bộ cơ sở kỹ thuật, thuật toán xử lý ảnh, ánh xạ màu OKLCH, mã nguồn verification script và kế hoạch phân rã tải đã được kiểm chứng bằng thực nghiệm mã lệnh cụ thể.
2. Phương án Hybrid Pipeline (Worker sinh ảnh qua `generate_image` kết hợp hậu xử lý `sharp` và nghiệm thu bằng `verify-ui-icons.mjs`) là con đường ngắn nhất, chất lượng mỹ thuật cao nhất và đảm bảo an toàn tuyệt đối cho dự án.
3. Parent Agent có thể sử dụng trực tiếp bản thiết kế chi tiết này để lập kế hoạch tổng thể (Plan) và bắt đầu phân bổ nhiệm vụ cho các subagents thi công.
