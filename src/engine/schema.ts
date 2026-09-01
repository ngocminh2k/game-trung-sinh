import { z } from 'zod'
import { MAP_HEIGHT, MAP_WIDTH } from '../content/locations'
import { ATTRIBUTE_MAX, MAX_HP, MAX_QI, MAX_STAGE, MINOR_REALM_MAX, STAGE_THRESHOLDS } from './constants'
import { sanitizeRpgState } from './rpg-state'

export const GameStateSchema = z.object({
  version: z.literal(1),
  seed: z.string().min(1),
  rng: z.number().int().nonnegative(),
  day: z.number().int().min(1),
  player: z.object({
    hp: z.number().int().min(0).max(MAX_HP),
    qi: z.number().int().min(0).max(MAX_QI),
    gold: z.number().int().min(0),
    // Multi-tier currency: schema defaults keep pre-economy saves valid.
    silver: z.number().int().min(0).default(0),
    spiritStones: z.number().int().min(0).default(0),
    attrs: z.object({
      body: z.number().int().min(1).max(ATTRIBUTE_MAX),
      mind: z.number().int().min(1).max(ATTRIBUTE_MAX),
      charm: z.number().int().min(1).max(ATTRIBUTE_MAX),
      luck: z.number().int().min(1).max(ATTRIBUTE_MAX),
    }),
    stage: z.number().int().min(0).max(STAGE_THRESHOLDS.length - 1),
    realmLevel: z.number().int().min(1).max(MINOR_REALM_MAX).default(1),
    progress: z.number().int().min(0),
    pendingAttributePoints: z.number().int().min(0).default(0),
    posX: z.number().int().min(0).max(MAP_WIDTH - 1),
    posY: z.number().int().min(0).max(MAP_HEIGHT - 1),
    locationId: z.string().min(1),
    alive: z.boolean(),
    status: z
      .array(
        z.object({
          kind: z.enum(['poison', 'paralysis', 'burn', 'slow', 'drain']),
          turns: z.number().int().min(1).max(20),
          potency: z.number().int().min(1).max(99).optional(),
        }),
      )
      .default([]),
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
  quests: z.record(z.object({ status: z.enum(['available', 'active', 'completed']), step: z.number().int().min(0).optional() })),
  achievements: z.array(z.string()),
  // Expansion fields: older saves omit them and receive safe defaults on parse.
  rememberedNames: z.array(z.string()).default([]),
  companionId: z.string().min(1).nullable().default(null),
  systemQueue: z
    .array(
      z.object({
        id: z.string().min(1),
        vars: z.record(z.union([z.string(), z.number()])),
      }),
    )
    .default([]),
  systemId: z.string().min(1).nullable().default(null),
  difficulty: z.enum(['story', 'balanced', 'hard']).default('balanced'),
  // Pre-RPG v1 saves omitted these fields. They keep their existing inventory
  // and receive no retroactive gear/talent bonus; a basic attack remains so a
  // migrated save can enter combat without becoming unwinnable.
  talents: z.array(z.string()).default([]),
  techniques: z.record(z.number().int().min(1).max(9)).default({ basic_staff_form: 1 }),
  equipment: z
    .object({
      weapon: z.string().min(1).nullable(),
      robe: z.string().min(1).nullable(),
      accessory: z.string().min(1).nullable(),
    })
    .default({ weapon: null, robe: null, accessory: null }),
  encounter: z
    .object({
      enemyId: z.string().min(1),
      hp: z.number().int().min(1),
      maxHp: z.number().int().min(1),
      guard: z.number().int().min(0).max(99),
      statusEffects: z
        .array(
          z.object({
            kind: z.enum(['poison', 'paralysis', 'burn', 'slow', 'drain']),
            turns: z.number().int().min(1).max(20),
            potency: z.number().int().min(1).max(99).optional(),
          }),
        )
        .default([]),
    })
    .nullable()
    .default(null),
  lastLotteryDay: z.number().int().min(1).nullable(),
  corrections: z.number().int().min(0),
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
  equipmentSlot: z.enum(['weapon', 'robe', 'accessory']).optional(),
  teachesTechniqueId: z.string().min(1).optional(),
  requiredStage: z.number().int().min(0).optional(),
  buyPrice: z.number().int().min(0).nullable(),
  sellPrice: z.number().int().min(0).nullable(),
})

export const RefinementRecipeDefSchema = z.object({
  id: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  locationId: z.string().min(1),
  ingredients: z.record(z.number().int().min(1)),
  output: z.object({ itemId: z.string().min(1), qty: z.number().int().min(1) }),
})

export const TalentDefSchema = z.object({
  id: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  requiredStage: z.number().int().min(0),
  tier: z.number().int().min(0),
  selectable: z.boolean(),
  attackBonus: z.number().int().min(0),
  defenseBonus: z.number().int().min(0),
  trainingBonus: z.number().int().min(0),
})

export const TechniqueDefSchema = z.object({
  id: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  requiredStage: z.number().int().min(0),
  maxLevel: z.number().int().min(1).max(9),
  power: z.number().int().min(0),
  trainingBonus: z.number().int().min(0),
  sourceItemId: z.string().min(1).optional(),
  gatherQiDrain: z.number().int().min(0).optional(),
  sellPenalty: z.number().int().min(0).optional(),
  benefitVi: z.string().min(1).optional(),
  benefitEn: z.string().min(1).optional(),
  costVi: z.string().min(1).optional(),
  costEn: z.string().min(1).optional(),
})

export const EquipmentDefSchema = z.object({
  id: z.string().min(1),
  itemId: z.string().min(1),
  slot: z.enum(['weapon', 'robe', 'accessory']),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  attackBonus: z.number().int().min(0),
  defenseBonus: z.number().int().min(0),
  qiBonus: z.number().int().min(0),
})

export const EnemyDefSchema = z.object({
  id: z.string().min(1),
  locationId: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  maxHp: z.number().int().min(1),
  attack: z.number().int().min(1),
  rewardGold: z.number().int().min(0),
  rewardItems: z.record(z.number().int().min(1)),
  element: z.enum(['Mộc', 'Kim', 'Hỏa', 'Thủy', 'Thổ']).optional(),
  behaviorPattern: z
    .enum(['aggressive', 'defensive', 'ranged', 'poison', 'flee', 'counter', 'summon', 'heal_self', 'drain_qi'])
    .optional(),
  defense: z.number().int().min(0).max(99).optional(),
  requiredStage: z.number().int().min(0).max(MAX_STAGE).optional(),
  exp: z.number().int().min(0).optional(),
  statusOnHit: z.enum(['poison', 'paralysis', 'burn', 'slow', 'drain']).optional(),
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

const QuestStepSchema = z.object({
  id: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  completeItems: z.record(z.number().int().min(1)).optional(),
  completeFlags: z.array(z.string()).optional(),
  completeNpcTalk: z.string().min(1).optional(),
  completeNode: z.string().min(1).optional(),
  isTurnInStep: z.boolean(),
})

export const QuestDefSchema = z.object({
  id: z.string().min(1),
  giverNpcId: z.string().min(1).nullable(),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  descVi: z.string().min(1),
  descEn: z.string().min(1),
  steps: z.array(QuestStepSchema).min(1),
  requiredItems: z.record(z.number().int().min(1)),
  requiredFlags: z.array(z.string()),
  rewardGold: z.number().int().min(0),
  rewardItems: z.record(z.number().int().min(1)),
  aliases: z.array(z.string()),
  secret: z.boolean().optional(),
  deadlineDays: z.number().int().min(1).optional(),
  nextQuestId: z.string().min(1).optional(),
  storySceneNextId: z.string().min(1).optional(),
  requiredSystemId: z.string().min(1).optional(),
  difficulty: z.number().int().min(1).max(10).optional(),
  rewardSpiritStones: z.number().int().min(0).optional(),
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
  return sanitizeRpgState(GameStateSchema.parse(raw))
}
