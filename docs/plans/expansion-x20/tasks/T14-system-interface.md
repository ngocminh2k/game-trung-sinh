# T14 — system-interface (Hệ Thống hiện hình: thông báo 【Hệ Thống】)

- **Wave**: W1 (song song). **Phụ thuộc**: đọc `contracts/story-canon.md` (BẮT BUỘC — quy tắc giọng).
- **FILE ĐƯỢC SỬA (độc quyền)**: tạo mới `src/content/system-messages.ts`, `src/engine/system.ts`, `test/system.test.ts`.
- **CẤM sửa**: schema/types (T02 khai báo `systemQueue`), reducer/UI (T12 nối), npcs.ts
  (Hệ Thống KHÔNG phải NPC), narrator.ts.

## Việc cần làm

1. `src/content/system-messages.ts` — data thuần:
   ```ts
   export type SystemKind = 'quest' | 'reward' | 'deadline' | 'unlock' | 'warning' | 'dodge' | 'snark'
   export interface SystemMessage {
     id: string            // sys_quest_loaded, sys_reward, sys_unlock, sys_warning, sys_deadline_near, sys_dodge, sys_snark_01..05
     kind: SystemKind
     templateVi: string    // dùng {token}: {quest}, {days}, {reward}, {feature}, {danger}
     templateEn: string
   }
   export const SYSTEM_MESSAGES: SystemMessage[]   // tối thiểu 11 bản ghi (5 kind chính + 5 snark + 1 dodge)
   export const SYSTEM_HEADER_VI = '【Hệ Thống】'
   export const SYSTEM_HEADER_EN = '【System】'
   ```
   Templates phủ đủ 5 mẫu trong story-canon.md §5 (y hệt wording, thêm 5 snark: cà khịa ≤ 1 câu,
   ví dụ snark về linh căn phế, về thói quen ngủ nướng của chủ xác... KHÔNG emoji).
2. `src/engine/system.ts` — pure, không rng, không state:
   ```ts
   import { SYSTEM_MESSAGES, SYSTEM_HEADER_VI, SYSTEM_HEADER_EN } from '../content/system-messages'
   export function formatSystemMessage(id: string, vars: Record<string, string | number>, locale: 'vi' | 'en'): string
   // = HEADER + template với {token} thay bằng vars; token thiếu → giữ nguyên {token} (đừng ném lỗi)
   export interface QueuedNotification { id: string; vars: Record<string, string | number> }
   export function queuePush(queue: QueuedNotification[], id: string, vars?: Record<string, string | number>): QueuedNotification[]
   export function queueDrain(queue: QueuedNotification[], max = 3): { visible: QueuedNotification[]; rest: QueuedNotification[] } // newest first
   ```
3. `test/system.test.ts`: format đúng header Vi/En; thay token đúng; token thiếu giữ nguyên;
   queueDrain newest-first, tối đa 3; SYSTEM_MESSAGES ≥ 11; mọi template Vi có cặp En và
   header đúng chuỗi `【Hệ Thống】` / `【System】`.

## Tiêu chí nghiệm thu

`npx vitest run test/system.test.ts` xanh; `npm run typecheck` xanh.

## Cấm

- Cho Hệ Thống vào npcs.ts, cho nó phá quy tắc §2 của story-canon (nói dối con số, emoji, thân mật).
