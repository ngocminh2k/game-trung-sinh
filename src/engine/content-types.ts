import type { ConcreteAction } from './types'

export interface ItemDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  aliases: string[]
  usable: boolean
  effects?: { hp?: number; qi?: number }
  equipmentSlot?: EquipmentSlot
  teachesTechniqueId?: string
  /** Market availability gate. Zero/undefined means immediately available. */
  requiredStage?: number
  buyPrice: number | null
  sellPrice: number | null
  /** Evidence records are abstract documents, not illustrated goods; they are
   * excluded from the shipped illustration manifest and fall back to still-life art. */
  illustrated?: boolean
}

/** A market exchange turns exploration or combat loot into a concrete
 * expedition tool. Raw materials can always be sold instead, so each recipe
 * represents a deliberate short-term tradeoff rather than a mandatory gate. */
export interface RefinementRecipeDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  locationId: string
  ingredients: Record<string, number>
  output: { itemId: string; qty: number }
}

export type EquipmentSlot = 'weapon' | 'robe' | 'accessory'

export interface TalentDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  requiredStage: number
  /** One optional talent may be chosen from each tier. */
  tier: number
  selectable: boolean
  attackBonus: number
  defenseBonus: number
  trainingBonus: number
}

export interface SkillNode {
  id: string
  branch: 'sword' | 'aura' | 'herbal' | 'shadow' | 'thunder'
  tier: number
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  /** Cost to unlock: skillPoints required, optional gold, optional item requirement */
  cost: { skillPoints: number; gold?: number; item?: string }
  /** Requirements: stage, level, required techniques, or flag */
  require: { stage: number; level?: number; techniques?: string[]; flag?: string }
  /** Effect when unlocked (passive or active) */
  effect: { kind: 'attack' | 'heal' | 'buff' | 'dodge' | 'aoe' | 'status' | 'utility'; value: number | string; [key: string]: unknown }
  /** Nodes that conflict with this one (mutually exclusive) */
  conflictsWith?: string[]
}

export interface TechniqueDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  requiredStage: number
  maxLevel: number
  power: number
  trainingBonus: number
  sourceItemId?: string
  // Phase 3 (design review 2026-08): every technique has two faces. The
  // benefit is the existing power/trainingBonus; the cost is a contextual
  // penalty applied by the reducer, so no single build is strictly optimal.
  /** Qi drained after each gather while this footwork is known (aggressive styles). */
  gatherQiDrain?: number
  /** Gold subtracted from every sale while this scholarly method is known. */
  sellPenalty?: number
  benefitVi?: string
  benefitEn?: string
  costVi?: string
  costEn?: string
  /** System Layer: only the player who chose this System may learn it. */
  requiredSystem?: string
}

/** A time-limited combat condition. `turns` decrements at the end of each
 *  affected actor's turn; when it reaches zero the status is removed.
 *  `potency` is the per-turn HP/qi magnitude applied at start of turn. */
export interface StatusEffect {
  kind: 'poison' | 'paralysis' | 'burn' | 'slow' | 'drain'
  turns: number
  potency?: number
}

export interface EquipmentDef {
  id: string
  itemId: string
  slot: EquipmentSlot
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  attackBonus: number
  defenseBonus: number
  qiBonus: number
}

/** Five-phase elemental cycle. The `counters` table is the production cycle:
 *  Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy. */
export type Element = 'Mộc' | 'Kim' | 'Hỏa' | 'Thủy' | 'Thổ'

/** Enemy combat posture. Each pattern maps to a deterministic reply in the
 *  reducer: defensive stances raise guard, poison stacks a status, etc.
 *  Behavior output is always pure and uses the encounter's rng position. */
export type BehaviorPattern =
  | 'aggressive'
  | 'defensive'
  | 'ranged'
  | 'poison'
  | 'flee'
  | 'counter'
  | 'summon'
  | 'heal_self'
  | 'drain_qi'

export interface EnemyDef {
  id: string
  locationId: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  maxHp: number
  attack: number
  rewardGold: number
  rewardItems: Record<string, number>
  /** Five-phase elemental affinity. Defaults to 'Mộc' so existing enemies
   *  (mist_boar, seal_wraith, rift_hound) keep their tone. */
  element?: Element
  /** How the enemy replies when its turn comes around. */
  behaviorPattern?: BehaviorPattern
  /** Combat 9+ behavior hook the reducer checks on the player turn:
   *  - poison: applies 2 poison stacks to player on enemy defeat
   *  - phase2: at <=50% HP, enemy gets +2 attack next turn
   *  - boss:   at <=33% HP, enemy fully heals once and gains +50% damage
   *  - aggressive (default): no extra rules
   */
  behavior?: 'aggressive' | 'poison' | 'phase2' | 'boss'
  /** Optional defense score the reducer subtracts from the player's strike.
   *  Most beasts have none — they dodge with their hides, not armor. */
  defense?: number
  /** Minimum player stage for the encounter to spawn. Defaults to 0. */
  requiredStage?: number
  /** Stage-related experience yield (used by endings, not by combat math). */
  exp?: number
  /** Optional status effect applied on the enemy's reply turn. The pattern
   *  drives the choice (poison → poison, ranged → slow, drain_qi → drain). */
  statusOnHit?: StatusEffect['kind']
}

export interface LocationDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  danger: number
}

export type Terrain = 'plain' | 'road' | 'water' | 'mountain' | 'forest' | 'cave' | 'rift'

export interface CellDef {
  x: number
  y: number
  terrain: Terrain
  locationId?: string
}

/** A labelled point on a local-area map.  Nodes are deliberately content data,
 * not a UI-only list: a player reaches them by moving onto their cell. */
export interface MapNodeDef {
  id: string
  nameVi: string
  nameEn: string
  kind: 'npc' | 'event' | 'exit' | 'danger'
}

export interface RegionCellDef extends CellDef {
  node?: MapNodeDef
  /** Stepping onto an exit changes region and uses that region's authored entry. */
  exitTo?: string
}

export interface RegionMapDef {
  locationId: string
  cells: RegionCellDef[]
  /** Safe default/arrival point.  Every regional map has one. */
  entry: { x: number; y: number }
  /** Arrival points keyed by the region the player came from. */
  arrivals: Record<string, { x: number; y: number }>
}

export interface NpcLine {
  when: {
    affMin?: number
    affMax?: number
    questDone?: string
    questActive?: string
    dayMin?: number
    flag?: string
    scene?: string
  }
  vi: string
  en: string
}

export interface NpcDef {
  id: string
  nameVi: string
  nameEn: string
  roleVi: string
  roleEn: string
  locationId: string
  greetVi: string
  greetEn: string
  aliases: string[]
  lines?: NpcLine[]
}

export interface ChapterDef {
  index: number
  nameVi: string
  nameEn: string
  taglineVi: string
  taglineEn: string
}

export interface EndingDef {
  id: string
  nameVi: string
  nameEn: string
  epitaphVi: string
  epitaphEn: string
}

export interface QuestStep {
  id: string
  descVi: string
  descEn: string
  /** Items needed for this step (optional - some steps use flags/npcTalk instead) */
  completeItems?: Record<string, number>
  /** Flags that must be set for this step to complete (optional) */
  completeFlags?: string[]
  /** NPC talk required for this step (optional) */
  completeNpcTalk?: string
  /** Node that must be reached (optional) */
  completeNode?: string
  /** Whether this is the final step (turn-in at NPC) */
  isTurnInStep: boolean
}

export interface QuestDef {
  id: string
  giverNpcId: string | null
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  steps: QuestStep[]
  /** For backwards compatibility - maps to first step's completeItems */
  requiredItems: Record<string, number>
  /** Flags that must be set before quest can be accepted */
  requiredFlags: string[]
  rewardGold: number
  rewardItems: Record<string, number>
  aliases: string[]
  /** If true, this quest does NOT appear in the quest list until opened. */
  secret?: boolean
  /** World quest: expires after this many days from acceptance. */
  deadlineDays?: number
  /** Optional follow-up quest, validated by the content registry. */
  nextQuestId?: string
  /** A main-quest turn-in moves the story to this authored scene. */
  storySceneNextId?: string
  /** System Layer: only the matching chosen System can accept/see this quest. */
  requiredSystemId?: string
  /** System Layer: 1–10 shown as quest difficulty. */
  difficulty?: number
  /** System Layer: paid by the turn-in helper on quest completion. */
  rewardSpiritStones?: number
}

export interface AchievementDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
}

export interface BeatDef {
  id: string
  chapter: number
  predicate: string
  titleVi: string
  titleEn: string
  textVi: string
  textEn: string
  suggested: ConcreteAction[]
}

/** A authored decision point. Effects are recorded in flags so saves remain
 * forward-compatible and the ending can read the player's whole history. */
export interface StoryChoiceDef {
  id: string
  labelVi: string
  labelEn: string
  consequenceVi: string
  consequenceEn: string
  nextSceneId: string | null
  effects?: Record<string, number | boolean | string>
  /** A concrete cost or boon makes a story stance felt before its ending. */
  playerDelta?: Partial<Record<'hp' | 'qi' | 'gold' | 'progress', number>>
  requires?: Record<string, number | boolean | string>
  final?: boolean
}

export interface StorySceneDef {
  id: string
  chapter: number
  titleVi: string
  titleEn: string
  textVi: string
  textEn: string
  choices: StoryChoiceDef[]
}

export interface RomanceEffect {
  aff?: number
  flag?: string
  hp?: number
  qi?: number
  gold?: number
}

export interface RomanceTrigger {
  dayMin?: number
  affMin?: number
  locationId?: string
  flags?: Record<string, number | boolean | string>
}

export interface RomanceChoiceDef {
  id: string
  labelVi: string
  labelEn: string
  effect: RomanceEffect
  next?: string
}

export interface RomanceNode {
  id: string
  trigger: RomanceTrigger
  requires?: string[]
  titleVi: string
  titleEn: string
  textVi: string
  textEn: string
  choices: RomanceChoiceDef[]
  effects: RomanceEffect
}

export interface RomanceTrack {
  npcId: string
  nodes: RomanceNode[]
}
