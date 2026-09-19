import { z } from 'zod'

export const JevIntentSchema = z.enum([
  'request_quest',
  'chat_general',
  'inquire_status',
  'complain',
  'defiance_mockery',
  'accept_current_quest',
])
export type JevIntent = z.infer<typeof JevIntentSchema>

export const JevResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  latencyMs: z.number().optional(),
  answers: z.object({
    intent: z.object({
      value: JevIntentSchema,
      confidence: z.number().min(0).max(1),
    }),
    selectedQuestId: z.object({
      value: z.string(),
      confidence: z.number().min(0).max(1),
    }),
    obedienceScore: z.object({
      value: z.number().min(1).max(5),
      confidence: z.number().min(0).max(1).optional(),
    }),
    isHostile: z.object({
      value: z.boolean(),
      probability: z.number().min(0).max(1).optional(),
    }),
  }),
})
export type JevResponse = z.infer<typeof JevResponseSchema>

export interface SystemFastDecision {
  intent: JevIntent
  questId?: string
  obedienceScore: number
  isHostile: boolean
  latencyMs: number
}
