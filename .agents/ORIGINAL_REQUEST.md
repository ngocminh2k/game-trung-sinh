# Original User Request

## 2026-09-07T21:42:30Z

Tạo toàn bộ 121 UI icons đồ họa còn thiếu (gồm 60 icon NPC map pins, 23 icon Event pins, 9 icon Danger pins, 16 icon Exit pins, 6 icon LeftRail tabs, 4 icon Tứ Tượng Attrs, và 3 icon HUD bars) bằng công cụ AI image generation trực tiếp cho từng ảnh, sau đó xử lý xuất ra tệp định dạng chuẩn 128×128 PNG có nền trong suốt (alpha channel), phân bổ chính xác vào các thư mục tương ứng theo tài liệu đặc tả docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md.

Working directory: C:/Users/minhd/orca/workspaces/game-trung-sinh/redesign-game-UI
Integrity mode: development

Tài liệu đặc tả nguồn: docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md

## Requirements

### R1. Bộ Icon Ghim Bản Đồ (Map Pins: NPC, Event, Danger, Exit) — 108 files
- Dùng AI generation tạo 60 icon ghim NPC riêng biệt (elder-meihua.png, storyteller-ngo.png, ...) tại src/assets/art/pins/npc/ với concept biểu tượng theo nghề của từng NPC và điểm nhấn son đỏ oklch(48% 0.18 25).
- Tạo 23 icon ghim sự kiện (bamboo-rampart.png, old-house.png, ...) tại src/assets/art/pins/event/ với điểm nhấn ngọc lam oklch(56% 0.10 175).
- Tạo 9 icon ghim nguy hiểm (bee-nest.png, wolf-tracks.png, ...) tại src/assets/art/pins/danger/ với điểm nhấn huyết đỏ oklch(48% 0.18 25).
- Tạo 16 icon ghim lối ra theo vùng đến (village.png, market.png, ...) tại src/assets/art/pins/exit/ với điểm nhấn hoàng kim oklch(78% 0.13 85).

### R2. Bộ Icon Giao Diện (LeftRail Tabs, Tứ Tượng Attrs, HUD Bars) — 13 files
- Tạo 6 icon tab điều hướng (people.png, vital.png, items.png, market.png, path.png, system.png) tại src/assets/art/tabs/ thay thế các glyph chữ Hán.
- Tạo 4 icon Tứ Tượng (charm.png, mind.png, body.png, luck.png) tại src/assets/art/attrs/ thay thế glyph 神 心 脈 運 với điểm nhấn hoàng kim.
- Tạo 3 icon thanh trạng thái HUD (hp.png, qi.png, cultivation.png) tại src/assets/art/hud/.

### R3. Quy Chuẩn Đồ Họa & Kỹ Thuật (Asset Specification)
- Định dạng: Tệp PNG 128×128 pixels, nền trong suốt hoàn toàn (alpha channel = 0 ở phần nền).
- Phong cách thẩm mỹ: Mực tàu giấy bản (ink-wash) nét đậm mảnh màu oklch(18% 0.02 60) (gần đen mực), chủ thể căn giữa, chừa lề (padding) ~10%, không viền rác, không gradient hiện đại, không 3D, không emoji.
- Tên tệp: kebab-case tuyệt đối khớp với bảng danh mục trong docs/agent-work/asset-requests/ui-icon-shortfall-2026-09-08.md.

### R4. Kịch Bản Kiểm Tra Tự Động (Verification Script)
- Xây dựng một kịch bản kiểm tra tự động (e.g. scripts/verify-ui-icons.mjs) quét toàn bộ 121 đường dẫn tệp để kiểm tra:
  1. Tệp tồn tại đầy đủ.
  2. Kích thước chính xác 128×128 pixel.
  3. Có kênh alpha trong suốt (không bị nền trắng/nền đen đặc).

## Acceptance Criteria

### Tính Đầy Đủ & Cấu Trúc File
- [ ] Đúng 121 tệp ảnh PNG được tạo ra tại các thư mục đích tương ứng:
  - src/assets/art/pins/npc/: đủ 60 tệp
  - src/assets/art/pins/event/: đủ 23 tệp
  - src/assets/art/pins/danger/: đủ 9 tệp
  - src/assets/art/pins/exit/: đủ 16 tệp
  - src/assets/art/tabs/: đủ 6 tệp
  - src/assets/art/attrs/: đủ 4 tệp
  - src/assets/art/hud/: đủ 3 tệp
- [ ] Kịch bản kiểm tra tự động (node scripts/verify-ui-icons.mjs) chạy thành công, báo cáo 121/121 tệp đạt chuẩn kích thước 128×128 và có kênh alpha trong suốt.

### Tính Thẩm Mỹ & Khớp Đặc Tả
- [ ] Đúng phong cách tranh thủy mặc mực tàu giấy bản với các màu điểm xuyết chuẩn theo từng nhóm như đã mô tả trong tài liệu yêu cầu.
- [ ] Chủ thể căn giữa, padding hợp lý (~10%), hiển thị sắc nét khi co về kích thước hiển thị trên map (32px - 48px).
