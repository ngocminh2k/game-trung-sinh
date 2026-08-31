# T05 — weather (Thời tiết 16 trạng thái, deterministic)

- **Wave**: W1. **Phụ thuộc**: chỉ đọc `rng.ts` để hiểu pattern — KHÔNG sửa nó.
- **FILE ĐƯỢC SỬA (độc quyền)**: tạo mới `src/engine/weather.ts`, tạo mới `test/weather.test.ts`.
- **CẤM sửa**: rng.ts, reducer.ts, types.ts, schema.ts. Hiệu ứng gameplay do T12 nối.

## Quy tắc bất di bất dịch

Weather là **hàm thuần của (seed, day)** — KHÔNG dùng `state.rng`, KHÔNG đổi rng position,
KHÔNG `Math.random()`. Lý do: tránh phá determinism của các hành động khác.

## Việc cần làm

1. Tạo `src/engine/weather.ts`:
   ```ts
   export type Season = 'xuan' | 'ha' | 'thu' | 'dong'
   export type WeatherKind = 'quang' | 'mua' | 'suong' | 'bao'
   export interface WeatherState { season: Season; kind: WeatherKind; id: string }
   // id = `${season}_${kind}` — tổng 16 id, ví dụ 'xuan_mua'
   export function seasonFor(day: number): Season   // day 1-7 xuan, 8-14 ha, 15-21 thu, 22-28 dong, lặp chu kỳ 28
   export function weatherFor(seed: string, day: number): WeatherState
   ```
   `weatherFor` = hash chuỗi `${seed}:${day}` (FNV-1a hoặc cộng dồn char code — deterministic),
   rút ra `kind` theo bảng xác suất CỐ ĐỊNH: quang 55%, mua 20%, suong 15%, bao 10%
   (cùng hash phải luôn cho cùng kết quả — đây là điều test chốt).
2. Bảng hiệu ứng (data, trả về dưới dạng bảng tra, engine khác tự dùng ở T12):
   ```ts
   export const WEATHER_EFFECTS: Record<string, { herbPriceMod: number; bossPowerMod: number; travelCostMod: number; hiddenNpcChance: number }>
   // 16 entry. Gợi ý: quang 1/1/1/0; mua 0.8/1/1/0.1; suong 1/1.3/1.2/0.2; bao 1.2/1.5/1.5/0
   ```
3. `test/weather.test.ts`:
   - Cùng seed+day → cùng kết quả (chạy 2 lần so sánh).
   - Khác day → có xác suất khác nhau (thử 28 ngày của 1 seed, phải có ≥ 3 kind khác nhau).
   - `seasonFor(1) === 'xuan'`, `seasonFor(29) === 'xuan'` (chu kỳ).
   - 16 id đủ: union của bảng = 16 chuỗi.

## Tiêu chí nghiệm thu

`npx vitest run test/weather.test.ts` xanh; `npm run typecheck` xanh.

## Cấm

- Đụng rng stream, đặt weather vào GameState (T12 sẽ cache nếu cần), đổi ngày trong game.
