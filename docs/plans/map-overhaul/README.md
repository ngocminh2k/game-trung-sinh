# Map Overhaul — Regional Map Redesign

> **Owner:** cline | **Wave:** Backlog (chạy sau system-layer, có thể song song)
> **Mục tiêu:** Bỏ hiệu ứng "mini-game/lưới ô" của map khu vực; thay bằng bản đồ kiểu RPG thực thụ: nền địa hình minh họa liền mạch, mỗi điểm có **ô icon đầy đủ** (ảnh hoặc placeholder), player marker rõ ràng, thông tin hover/focus hữu ích.

---

## 1. Khảo sát: Game RPG làm map như thế nào?

### 1.1 Overworld (JRPG cổ điển)
- **Octopath Traveler / Final Fantasy / Dragon Quest**: bản đồ là **bức minh họa vẽ liền mạch** (painted overworld). Địa hình (đồng cỏ, rừng, núi, biển) hòa vào nhau, **không có lưới ô hiện ra**.
- **Point of interest** là **biểu tượng / shrine đặt nổi trên nền** — nhận ra ngay, có **tên ghi cạnh** hoặc tên hiện khi hover.

### 1.2 Minimap open-world hiện đại
- **Skyrim / Witcher 3 / GTA**: không chia ô, dùng **terrain texture + màu phân vùng**; đường đi là **nét nối các node**; icon POI **màu theo loại** và quay theo hướng nhìn.
- **Etrian Odyssey**: mỗi ô **bật sáng khi bước vào** (fog-of-war), tự vẽ đường đã đi — bản đồ "sống" theo cảm giác khám phá.

### 1.3 Nguyên tắc áp dụng
1. **Terrain liền mạch, không lộ grid** — nền là cảnh quan, không phải bàn cờ.
2. **Mỗi node là một ô icon rõ ràng** — có nền (slot), icon bên trong.
3. **Phân loại bằng hình dạng + màu** nhưng đặt trong **ô chung thống nhất**.
4. **Player marker nổi bật** — halo + hướng, không lẫn với icon.
5. **Fog-of-war nhẹ** — vùng chưa đến mờ hơn.
6. **Hover/focus hiện thông tin** — tên, loại, hướng, khoảng cách.
7. **Đồ họa thống nhất** — parchment + mực + icon slot đồng bộ HUD.

---

## 2. Chẩn đoán code hiện tại

Xem `src/ui/GameScreen.tsx` (map-panel ~583–657) + `src/index.css`:

| Vấn đề | Vị trí | Biểu hiện |
|---|---|---|
| **Grid lộ như bàn cờ** | `--map-columns/rows` + `.map-grid-overlay` `gap:2px; border:1px` mỗi `.map-cell` | Nhìn thẳng ra lưới → cảm giác mini-game |
| Node là **chấm tròn 11–13px** | `.regional-map .map-node{width:11px;height:11px}` | Không đọc được là gì |
| Nhãn node **ẩn vĩnh viễn** | `.map-node-label{display:none}` | Không biết điểm đó là gì |
| **Nền 1 ảnh phủ** | `<img class="world-map-art" src={sceneBackdrop}>` (3.5MB) | Terrain không theo cell, phẳng |
| Exit icon PNG **nặng ~500–900KB/cái** | `locationIconFor(exitTo)` | 16 file chậm |
### 3.2 Hệ thống ô icon (Icon Slot System)
Mỗi node được render trong **ô icon thống nhất**:
- `.map-icon-slot { width:44px;height:44px;border-radius:10px;background:rgba(0,0,0,.35);border:1px solid rgba(245,235,190,.45);box-shadow; }`
- Icon bên trong theo kind:
  - **exit** → `locationIconFor(exitTo)` (PNG có sẵn) hoặc placeholder.
  - **npc** → ảnh/ký hiệu khuôn mặt placeholder.
  - **event** → ký hiệu dấu chấm than/quyển trục placeholder.
  - **danger** → ký hiệu đầu lâu/lửa placeholder.
- **Placeholder**: khi thiếu art, render `<span class="map-icon-placeholder">` với Unicode/SVG — luôn có ô, không trống.
- Icon exit giữ `src`, thêm `loading="lazy"` + `onError` fallback placeholder.

### 3.3 Player marker + fog-of-war nhẹ
- `.player-map-marker` nâng cấp: halo + mũi tên hướng theo action; giữ `data-testid="player-map-marker"`.
- Fog: cell chưa từng bước đến hiện opacity .45 (so `flags.visited_*` có sẵn) — **không đổi schema** (Phase A).

### 3.4 Hover / focus / legend
- Hover/focus ô icon → tooltip: tên node (VI/EN), loại, hướng; exit → tên vùng đến.
- Legend hiển thị icon slot mới (npc/event/exit/danger).
- Giữ aria-label, keyboard focus-visible.

---

## 4. Giữ tương thích test (bắt buộc)

Giữ nguyên **testid/class** test đang dựa:

| Test | Selector giữ nguyên |
|---|---|
| `acceptance-visual.spec.ts` | `.map-exit-icon` (đếm, trong bounds) |
| `debug-map`, `game`, `npc-on-map` | `[data-testid^="event-node-"]`, `route-event-node`, `map-current-cell`, `event-node-village-elder-porch`… |
| `app.ui.test.tsx`, `game-screen-art.test.tsx` | `player-map-marker`, `map-current-cell`, `.map-node.node-exit`, `map-exit-icon`, `.map-node-label` |

> Lưu ý: `.map-node-label` đang `display:none`; plan **hiển thị nhãn khi hover/focus**. Test `game-screen-art` assert `count >= exits` — vẫn đúng nếu nhãn render (kể cả text-overflow), nhưng **phải kiểm tra snapshot/vị trí** không vỡ.

---

## 5. Nhiệm vụ (Wave)

| ID | Task | Scope | Deliverable | Verification |
|---|---|---|---|---|
| **MO-1** | Terrain layer + bỏ grid boundary | `GameScreen.tsx`, `index.css`, `regional-map.test.ts` | Terrain gradient + vignette, không grid border | vitest regional-map, typecheck |
| **MO-2** | Icon Slot System + placeholder | `locationArt.ts`, `GameScreen.tsx` | `<div class="map-icon-slot">` + icon/placeholder per node | vitest game-screen-art |
| **MO-3** | Player marker + hover tooltip + fog nhẹ | `GameScreen.tsx`, `index.css` | Halo marker, tooltip, fog opacity | vitest app.ui + game-screen-art |
| **MO-4** | Legend + a11y + i18n VI/EN | `GameScreen.tsx`, `i18n/vi.ts,en.ts` | Legend mới + aria | lint, i18n test |
| **MO-5** | Update tests + 5 gates | `test/**`, `e2e/**` | All green + screenshots 1280×800, 1600×900 | typecheck, lint, vitest, build, playwright |

---

## 6. Rủi ro & quyết định sản phẩm

- **R1** Bỏ background scene: performance tốt hơn (bỏ 3.5MB) nhưng kiểm tra `acceptance-visual` pass.
- **R2** Fog đụng save → Phase A dùng `flags.visited_*` có sẵn, không đổi schema (tránh xung đột system-layer).
- **R3** Nhãn hiện có thể che node → `pointer-events:none` + text-shadow + max-width.
- **R4** PNG nặng → `loading="lazy"` + `decoding="async"` + `onError` fallback.

---

## 7. Acceptance Criteria

1. Không còn grid boundary/`gap:2px` lộ; map đọc như bức tranh.
2. Mỗi node (npc/event/exit/danger) trong **ô icon ≥ 32px** với icon hoặc placeholder — **không trống chấm**.
3. Cả 4 kiểu placeholder hiển thị khi art thiếu.
4. Player marker có halo + hướng, không lẫn icon.
5. Hover/focus hiện tooltip tên + loại + hướng.
6. Legend dùng icon slot mới.
7. Test cũ vẫn xanh; thêm test mới cho icon slot + placeholder.
8. 5 cổng xanh: typecheck, lint, vitest, build, playwright.

---

## 8. Ngoài phạm vi (sau này)

- World map toàn thế giới nối các vùng.
- Mini-map góc màn hình khi exploration.
- Fog-of-war ghi vào save (Phase B).
- Quest marker overlay trên node.
| Thiếu icon **npc/event/danger** | Chỉ chấm màu | Cần ô icon riêng |
| **Không có placeholder** | — | Cần slot mặc định khi thiếu art |

**Kết luận:** không đổi engine/data (`regionMap.cells`, terrain, node kind giữ nguyên) — tái thiết lớp trình bày (render layer) thuần tuý.

---

## 3. Giải pháp — Thiết kế mới

### 3.1 Terrain liền mạch, icon tách khỏi nền
- Chuyển `.map-grid-overlay` từ "lưới có viền" → **lớp terrain minh họa theo cell** (CSS gradient theo terrain, hòa ranh giới bằng feather):
  - `plain`=cỏ xanh dịu, `forest`=xanh đậm, `mountain`=nâu/đá, `water`=xanh nước+gợn, `cave`=tối, `rift`=tím tối, `road`=nâu đường.
- Bỏ `<img class="world-map-art">` (hoặc opacity rất thấp), thay bằng gradient cell + vignette.
- Giữ khung parchment + mực (style RPG hiện có).