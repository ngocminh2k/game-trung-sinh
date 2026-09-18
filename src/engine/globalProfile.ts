import { z } from 'zod'

export const GLOBAL_PROFILE_VERSION = 1 as const

export interface BuriedRelic {
  itemId: string
  locationId: string
  x: number
  y: number
}

/** Device-local meta-progression. Deliberately separate from the 5 save slots:
 *  endings, achievements and the highest NG+ reached follow the *player*, not a
 *  single cultivator, and survive every slot being overwritten or deleted.
 *  Never holds credentials — ids and counters only. */
export interface GlobalProfile {
  version: 1
  /** Ending ids the player has ever reached. Stable-sorted + deduped. */
  unlockedEndingIds: string[]
  /** Achievement ids the player has ever earned. Stable-sorted + deduped. */
  unlockedAchievementIds: string[]
  /** Highest NG+ cycle ever started (0 = never reincarnated). */
  highestNgPlusLevel: number
  /** Number of runs that have reached a terminal state. */
  totalRuns: number
  /** Relic queued to carry into the next new run, or null. */
  inheritedRelicId: string | null
  /** Cumulative reincarnation karma earned across all completed lives (C3-02). */
  reincarnationPoints: number
  /** C3-13: Buried relic hidden at specific coordinates for future lives. */
  buriedRelic: BuriedRelic | null
}

export const DEFAULT_GLOBAL_PROFILE: GlobalProfile = {
  version: GLOBAL_PROFILE_VERSION,
  unlockedEndingIds: [],
  unlockedAchievementIds: [],
  highestNgPlusLevel: 0,
  totalRuns: 0,
  inheritedRelicId: null,
  reincarnationPoints: 0,
  buriedRelic: null,
}

const GlobalProfileSchema = z.object({
  version: z.literal(GLOBAL_PROFILE_VERSION).default(GLOBAL_PROFILE_VERSION),
  unlockedEndingIds: z.array(z.string().min(1)).default([]),
  unlockedAchievementIds: z.array(z.string().min(1)).default([]),
  highestNgPlusLevel: z.number().int().min(0).max(99).default(0),
  totalRuns: z.number().int().min(0).default(0),
  inheritedRelicId: z.string().min(1).nullable().default(null),
  reincarnationPoints: z.number().int().min(0).default(0),
  buriedRelic: z
    .object({
      itemId: z.string().min(1),
      locationId: z.string().min(1),
      x: z.number().int(),
      y: z.number().int(),
    })
    .nullable()
    .default(null),
})

/** Union + stable-sort + de-dupe. Keeps the profile deterministic so a
 *  re-merge of the same unlock is a no-op. */
function mergeIds(existing: readonly string[], incoming: readonly string[]): string[] {
  return [...new Set([...existing, ...incoming])].sort()
}

export function parseGlobalProfile(raw: unknown): GlobalProfile {
  const result = GlobalProfileSchema.safeParse(raw)
  if (!result.success) return { ...DEFAULT_GLOBAL_PROFILE }
  return {
    ...result.data,
    version: GLOBAL_PROFILE_VERSION,
    unlockedEndingIds: mergeIds([], result.data.unlockedEndingIds),
    unlockedAchievementIds: mergeIds([], result.data.unlockedAchievementIds),
    buriedRelic: result.data.buriedRelic ?? null,
  }
}

export interface ProfileDelta {
  endings?: readonly string[]
  achievements?: readonly string[]
  ngPlus?: number
  reincarnationPoints?: number
}

/** Fold a set of new unlocks into the profile immutably. */
export function mergeGlobalProfile(profile: GlobalProfile, delta: ProfileDelta): GlobalProfile {
  return {
    ...profile,
    unlockedEndingIds: mergeIds(profile.unlockedEndingIds, delta.endings ?? []),
    unlockedAchievementIds: mergeIds(profile.unlockedAchievementIds, delta.achievements ?? []),
    highestNgPlusLevel: Math.max(profile.highestNgPlusLevel, delta.ngPlus ?? 0),
    reincarnationPoints: profile.reincarnationPoints + Math.max(0, delta.reincarnationPoints ?? 0),
  }
}

/** Record that a run reached a terminal state. `endingId` may be null (death
 *  without a mapped ending still counts as a completed run). */
export function recordTerminal(
  profile: GlobalProfile,
  endingId: string | null,
  newAchievements: readonly string[],
  ngPlusLevel: number,
  inheritedRelicId?: string | null,
  earnedKarma: number = 0,
): GlobalProfile {
  const merged = mergeGlobalProfile(profile, {
    endings: endingId === null ? [] : [endingId],
    achievements: newAchievements,
    ngPlus: ngPlusLevel,
    reincarnationPoints: earnedKarma,
  })
  return {
    ...merged,
    totalRuns: profile.totalRuns + 1,
    ...(inheritedRelicId !== undefined ? { inheritedRelicId } : {}),
  }
}
