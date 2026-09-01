// T14 — System (Hệ Thống) message data. Pure declarative data only.
// Voice rules: contracts/story-canon.md §2/§5 + CONVENTIONS.md §8.
// Hệ Thống is NOT an NPC — it speaks only through the 【Hệ Thống】 frame.

export type SystemKind =
  | 'quest'
  | 'reward'
  | 'deadline'
  | 'unlock'
  | 'warning'
  | 'dodge'
  | 'snark'

export interface SystemMessage {
  /** id: sys_quest_loaded, sys_reward, sys_unlock, sys_warning, sys_deadline_near, sys_dodge, sys_snark_01..05 */
  id: string
  kind: SystemKind
  /** Template body (without the header). Tokens: {quest}, {days}, {objective}, {reward}, {feature}, {danger} */
  templateVi: string
  templateEn: string
}

export const SYSTEM_HEADER_VI = '【Hệ Thống】'
export const SYSTEM_HEADER_EN = '【System】'

export const SYSTEM_MESSAGES: SystemMessage[] = [
  {
    id: 'sys_quest_loaded',
    kind: 'quest',
    templateVi: 'Nhiệm vụ chính tải xong: {quest}. Hạn: {days} ngày. {objective}',
    templateEn: 'Main quest loaded: {quest}. Time limit: {days} days. {objective}',
  },
  {
    id: 'sys_reward',
    kind: 'reward',
    templateVi: 'Đinh! Nhiệm vụ hoàn tất. Thưởng: {reward}.',
    templateEn: 'Ding! Quest complete. Reward: {reward}.',
  },
  {
    id: 'sys_unlock',
    kind: 'unlock',
    templateVi: 'Mở khoá: {feature}.',
    templateEn: 'Unlocked: {feature}.',
  },
  {
    id: 'sys_warning',
    kind: 'warning',
    templateVi: 'Cảnh báo: {danger}.',
    templateEn: 'Warning: {danger}.',
  },
  {
    id: 'sys_deadline_near',
    kind: 'deadline',
    templateVi: 'Nhiệm vụ "{quest}" còn {days} ngày. Trễ hạn: hậu quả tự chịu.',
    templateEn: 'Quest "{quest}" expires in {days} days. Late: consequences are yours.',
  },
  {
    id: 'sys_dodge',
    kind: 'dodge',
    templateVi: 'Dữ liệu không đủ để trả lời.',
    templateEn: 'Insufficient data to answer.',
  },
  {
    id: 'sys_snark_01',
    kind: 'snark',
    templateVi: 'Linh căn phế vẫn là linh căn phế. Hệ Thống chỉ ghi nhận, không bình luận thêm.',
    templateEn: 'A trash spirit root stays a trash spirit root. The System merely records; no further comment.',
  },
  {
    id: 'sys_snark_02',
    kind: 'snark',
    templateVi: 'Chủ xác có thói quen ngủ nướng đến trưa. Ký chủ vẫn duy trì truyền thống tốt.',
    templateEn: 'The body\'s previous owner slept until noon. The host maintains the tradition admirably.',
  },
  {
    id: 'sys_snark_03',
    kind: 'snark',
    templateVi: 'Ba ngày say xỉn vì nợ cờ bạc trước khi tiếp nhận. Đã ghi vào hồ sơ hiệu suất.',
    templateEn: 'Three days of debt bingeing before arrival. Noted in the performance file.',
  },
  {
    id: 'sys_snark_04',
    kind: 'snark',
    templateVi: 'Nhiệm vụ thất bại không làm Hệ Thống buồn. Hệ Thống không có cảm xúc để buồn.',
    templateEn: 'Failed quests do not make the System sad. The System lacks the emotion required for sadness.',
  },
  {
    id: 'sys_snark_05',
    kind: 'snark',
    templateVi: 'Ký chủ hỏi về nguồn gốc của Hệ Thống lần thứ ba. Câu hỏi đã được lưu, không được trả lời.',
    templateEn: 'The host has asked about the System\'s origin for the third time. The question has been stored, not answered.',
  },
]
