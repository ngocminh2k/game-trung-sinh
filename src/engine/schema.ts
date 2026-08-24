import { z } from 'zod'
import { MAP_HEIGHT, MAP_WIDTH } from '../content/locations'
import { MAX_HP, MAX_QI, STAGE_THRESHOLDS } from './constants'

export const GameStateSchema = z.object({
  version: z.literal(1),
  seed: z.string().min(1),
  rng: z.number().int().nonnegative(),
  day: z.number().int().min(1),
  player: z.object({
    hp: z.number().int().min(0).max(MAX_HP),
    qi: z.number().int().min(0).max(MAX_QI),
    gold: z.number().int().min(0),
    attrs: z.object({
      body: z.number().int().min(1).max(10),
      mind: z.number().int().min(1).max(10),
      charm: z.number().int().min(1).max(10),
      luck: z.number().int().min(1).max(10),
    }),
    stage: z.number().int().min(0).max(STAGE_THRESHOLDS.length - 1),
    progress: z.number().int().min(0),
    posX: z.number().int().min(0).max(MAP_WIDTH - 1),
    posY: z.number().int().min(0).max(MAP_HEIGHT - 1),
    locationId: z.string().min(1),
    alive: z.boolean(),
  }),
  spiritRoot: z.object({
    kind: z.literal('defective'),
    elementVi: z.string().min(1),
    elementEn: z.string().min(1),
    efficiency: z.number().positive(),
  }),
  inventory: z.record(z.number().int().min(0)),
  storage: z.record(z.number().int().min(0)),
  flags: z.record(z.union([z.number(), z.boolean(), z.string()])),
  quests: z.record(z.object({ status: z.enum(['available', 'active', 'completed']) })),
  achievements: z.array(z.string()),
  lastLotteryDay: z.number().int().min(1).nullable(),
  corrections: z.number().int().min(0),
  convergenceCount: z.number().int().min(0),
  terminal: z.boolean(),
  endingId: z.string().nullable(),
})

export const ItemDefSchema = z.object({
  id: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  aliases: z.array(z.string()),
  usable: z.boolean(),
  effects: z
    .object({ hp: z.number().int().optional(), qi: z.number().int().optional() })
    .optional(),
  buyPrice: z.number().int().min(0).nullable(),
  sellPrice: z.number().int().min(0).nullable(),
})

export const LocationDefSchema = z.object({
  id: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  danger: z.number().int().min(0).max(3),
})

export const CellDefSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  terrain: z.enum(['plain', 'road', 'water', 'mountain', 'forest', 'cave', 'rift']),
  locationId: z.string().optional(),
})

export const NpcDefSchema = z.object({
  id: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  roleVi: z.string().min(1),
  roleEn: z.string().min(1),
  locationId: z.string().min(1),
  greetVi: z.string().min(1),
  greetEn: z.string().min(1),
  aliases: z.array(z.string()),
})

export const ChapterDefSchema = z.object({
  index: z.number().int().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  taglineVi: z.string().min(1),
  taglineEn: z.string().min(1),
})

export const EndingDefSchema = z.object({
  id: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  epitaphVi: z.string().min(1),
  epitaphEn: z.string().min(1),
})

export const QuestDefSchema = z.object({
  id: z.string().min(1),
  giverNpcId: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  requiredItems: z.record(z.number().int().min(1)),
  requiredFlags: z.array(z.string()),
  rewardGold: z.number().int().min(0),
  rewardItems: z.record(z.number().int().min(1)),
  aliases: z.array(z.string()),
})

export const AchievementDefSchema = z.object({
  id: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
})

const ActionSpecSchema = z.object({ kind: z.string().min(1) }).passthrough()

export const BeatDefSchema = z.object({
  id: z.string().min(1),
  chapter: z.number().int().min(1).max(5),
  predicate: z.string().min(1),
  titleVi: z.string().min(1),
  titleEn: z.string().min(1),
  textVi: z.string().min(1),
  textEn: z.string().min(1),
  suggested: z.array(ActionSpecSchema).length(3),
})

export function parseGameState(raw: unknown) {
  return GameStateSchema.parse(raw)
}
