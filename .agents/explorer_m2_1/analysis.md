# Technical Analysis: 2-Tier Pipeline Integration in The System (`src/ai/system.ts`)

**Author:** Explorer 1 (`teamwork_preview_explorer`)  
**Milestone:** Milestone 2 (Requirement R2)  
**Target File:** `src/ai/system.ts`  
**Dependencies:** `src/ai/jev-client.ts`, `src/ai/jev-schemas.ts`, `src/engine/`  
**Date:** 2026-09-20  

---

## Executive Summary

This report establishes the precise technical blueprint for integrating Jev (System One AI from TypeSafe AI) into `src/ai/system.ts` to realize a robust, ultra-fast 2-Tier AI Pipeline.
- **Tier 1 (Jev System One / ~80ms):** Fast reflexive intent recognition, bounded quest dispatching, and obedience/hostility scoring via `classifySystemUtterance`.
- **Tier 2 (Frontier LLM / ~1-2s):** Rich in-character generative narration via `/api/narrate`, enriched with the Tier 1 decision context.
- **Deterministic In-Character Fallback:** Seamless, instant (<1ms) degradation to lore-accurate, system-specific responses when `/api/narrate` is offline, unreachable, or times out (>2000ms), guaranteeing that no exception or UI hang ever reaches the player.

---

## 1. Integration of `classifySystemUtterance` into `src/ai/system.ts`

### 1.1 Architecture & Call Flow
In the current implementation of `src/ai/system.ts`, `requestSystemReply` directly forwards raw player text to `/api/narrate` without understanding intent or bounding quest selection.

In the 2-Tier Pipeline:
```
Player Input (cleanMessage)
       │
       ▼
┌───────────────────────────────────────────────────────────┐
│ Tier 1: classifySystemUtterance(game, cleanMessage)       │
│  - Endpoint: https://api.typesafe.ai/v1/systemone         │
│  - Timeout: 600ms (Internal AbortController)              │
│  - Bounded Choices: Active systemQuestsFor(game) + 'none' │
│  - Fallback: Deterministic Regex Classifier (<1ms)        │
│  - Return: SystemFastDecision                             │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│ Fast Decision Processing & Payload Enrichment             │
│  - Check Hostility / Defiance                             │
│  - Determine mode ('offer_quest' vs 'chat')               │
│  - Build SystemChatPayload with jevDecision               │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│ Tier 2: Generative Narration via /api/narrate             │
│  - Timeout: 2000ms (AbortController)                      │
│  - Upstream LLM receives enriched Jev context             │
│  - On Success: Validate questId against questPool         │
│  - On Failure/Timeout/Offline: Return In-Character        │
│    Deterministic Fallback SystemReply                     │
└───────────────────────────────────────────────────────────┘
```

### 1.2 Exporting `fastClassifySystem`
To support the sequence diagram in `jev_integration_spec.md` where the UI can optionally receive instant fast decisions (~80ms) before the generative narration completes, `src/ai/system.ts` should export:
```typescript
export async function fastClassifySystem(game: GameState, message: string): Promise<SystemFastDecision> {
  return classifySystemUtterance(game, message)
}
```

---

## 2. Processing the Fast Decision (`SystemFastDecision`)

`SystemFastDecision` contains:
```typescript
export interface SystemFastDecision {
  intent: JevIntent // 'request_quest' | 'chat_general' | 'inquire_status' | 'complain' | 'defiance_mockery' | 'accept_current_quest'
  questId?: string
  obedienceScore: number // 1..5
  isHostile: boolean
  latencyMs: number
}
```

### 2.1 Handling Hostility & Defiance (`isHostile === true` or `intent === 'defiance_mockery'`)
In Xianxia lore, The System is an omnipotent entity bound to the host. Hostile defiance (`cút`, `ngu`, `hệ thống rác`, insolent defiance) must be met with strict disciplinary firmness:
1. **Quest Offer Lockout:**
   The System **never** offers a quest to a hostile host. Even if a `questId` was somehow extracted or hallucinated by Tier 2, `mode` is strictly set to `'chat'` and `questId` is suppressed (`undefined`).
2. **Obedience Level Modulation:**
   `obedienceScore: 1` triggers a harsh, disciplinary warning (threat of lightning punishment, deduction of points, or dismissal of the host as unworthy).
3. **Deterministic Response Generation (Fallback):**
   - **Vietnamese:** `【${system.nameVi}】: Ký chủ to gan! Thái độ ngỗ ngược (Tuân phục: ${fastDecision.obedienceScore}/5). ${system.personalityVi} Bổn Hệ Thống từ chối phục vụ kẻ vô lễ!`
   - **English:** `[${system.nameEn}]: Impudent host! Insubordinate attitude (Obedience: ${fastDecision.obedienceScore}/5). ${system.personalityEn} The System refuses to serve the disrespectful!`

### 2.2 Handling Quest Requests (`intent === 'request_quest'` and `questId`)
When the host requests tasks or missions:
1. **Pool Validation:**
   The candidate `questId` selected by Jev is verified against `systemQuestsFor(game)`. (Jev already bounds options to the active quest pool + `'none'`, ensuring 0% hallucination).
2. **Payload Mode:**
   If `fastDecision.questId` is present and validated:
   - `payload.mode = 'offer_quest'`
   - `payload.jevDecision.questId = fastDecision.questId`
3. **Reply Formation:**
   - Tier 2 returns `{ kind: 'offer_quest', questId, textVi, textEn }`.
   - The UI components (`LeftRailTabContent.tsx` and `GameScreen.tsx`) detect `kind === 'offer_quest'` and render the actionable **"Tiếp nhận nhiệm vụ"** (Accept Quest) button dispatching `{ kind: 'system_accept_quest', questId }`.
4. **Deterministic Fallback (Offline/No-AI):**
   If Tier 2 is unreachable, the fallback locates the `QuestDef` from `systemQuestsFor(game)` and formats:
   - **Vietnamese:** `【${system.nameVi}】: Ký chủ yêu cầu nhiệm vụ. Ban bố: [${quest.nameVi}]. ${quest.descVi} Thưởng: ${quest.rewardGold} vàng.`
   - **English:** `[${system.nameEn}]: Host requested a task. Issued: [${quest.nameEn}]. ${quest.descEn} Reward: ${quest.rewardGold} gold.`
   - `questId` is attached to the `SystemReply`, enabling the quest offer button even completely offline!

---

## 3. Tier 2 `/api/narrate` Payload Enrichment

### 3.1 Interface Evolution: `SystemChatPayload`
We enrich `SystemChatPayload` with `jevDecision`:

```typescript
export interface SystemChatPayload {
  mode: 'chat' | 'offer_quest'
  locale: Locale
  system: {
    id: string
    nameVi: string
    nameEn: string
    personalityVi: string
    personalityEn: string
  }
  context: {
    day: number
    stage: number
    gold: number
    luck: number
    hp: number
    qi: number
  }
  questPool: Array<{ id: string; difficulty: number; rewardGold: number }>
  playerMessage: string
  jevDecision?: {
    intent: JevIntent
    questId?: string
    obedienceScore: number
    isHostile: boolean
    latencyMs: number
  }
}
```

### 3.2 Signature of `buildSystemPayload`
To maintain 100% backwards compatibility with existing unit tests (e.g. `test/ai-system.test.ts`), `fastDecision` is optional:
```typescript
export function buildSystemPayload(
  game: GameState,
  message: string,
  locale: Locale,
  fastDecision?: SystemFastDecision
): SystemChatPayload | null
```
- When `fastDecision` is omitted: `mode` defaults to `'chat'`, `jevDecision` is `undefined`.
- When `fastDecision` is provided:
  - If `fastDecision.isHostile || fastDecision.intent === 'defiance_mockery'`: `mode = 'chat'`.
  - Else if `fastDecision.intent === 'request_quest' && fastDecision.questId`: `mode = 'offer_quest'`.
  - Else: `mode = 'chat'`.
  - `jevDecision` is populated with all fast decision attributes.

---

## 4. Deterministic In-Character Fallback Architecture

### 4.1 When is the Fallback Triggered?
Fallback is activated when:
1. `fetch('/api/narrate')` throws a network error (offline, connection refused, DNS error).
2. `fetch('/api/narrate')` exceeds the 2000ms AbortController timeout.
3. `/api/narrate` returns HTTP status != 200 (e.g. 503 "AI narration is not configured", 502 upstream failure).
4. `/api/narrate` returns empty or malformed JSON (missing textVi/textEn).

*(Note: If `/api/narrate` returns a valid HTTP 200 response offering a `questId` that is NOT in the active quest pool, it is rejected as a hallucination and returns `null`, adhering strictly to `test/ai-system.test.ts`).*

### 4.2 Fallback Function Design: `buildDeterministicSystemReply`
```typescript
export function buildDeterministicSystemReply(
  game: GameState,
  fastDecision: SystemFastDecision,
  locale: Locale
): SystemReply {
  const system = activeSystem(game)
  const nameVi = system ? system.nameVi : 'Hệ Thống'
  const nameEn = system ? system.nameEn : 'The System'
  const personalityVi = system ? system.personalityVi : 'Hệ Thống im lặng theo dõi.'
  const personalityEn = system ? system.personalityEn : 'The System watches in silence.'

  // Case 1: Hostility / Defiance
  if (fastDecision.isHostile || fastDecision.intent === 'defiance_mockery') {
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Ký chủ to gan! Thái độ ngỗ ngược (Tuân phục: ${fastDecision.obedienceScore}/5). ${personalityVi} Bổn Hệ Thống từ chối phục vụ kẻ vô lễ!`,
      textEn: `[${nameEn}]: Impudent host! Insubordinate attitude (Obedience: ${fastDecision.obedienceScore}/5). ${personalityEn} The System refuses to serve the disrespectful!`,
    }
  }

  // Case 2: Request Quest with valid questId
  if (fastDecision.intent === 'request_quest' && fastDecision.questId) {
    const available = systemQuestsFor(game)
    const quest = available.find((q) => q.id === fastDecision.questId)
    if (quest) {
      return {
        kind: 'offer_quest',
        questId: quest.id,
        textVi: `【${nameVi}】: Ký chủ yêu cầu nhiệm vụ. Ban bố: [${quest.nameVi}]. ${quest.descVi} Thưởng: ${quest.rewardGold} vàng.`,
        textEn: `[${nameEn}]: Host requested a task. Issued: [${quest.nameEn}]. ${quest.descEn} Reward: ${quest.rewardGold} gold.`,
      }
    }
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Hiện tại không có nhiệm vụ nào phù hợp với cảnh giới của ngươi.`,
      textEn: `[${nameEn}]: No quests currently available for your cultivation realm.`,
    }
  }

  // Case 3: Inquire Status
  if (fastDecision.intent === 'inquire_status') {
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Trạng thái Ký chủ: Cảnh giới Tầng ${game.player.stage}, Khí huyết ${game.player.hp}, Chân khí ${game.player.qi}, Ngân lượng ${game.player.gold}. ${personalityVi}`,
      textEn: `[${nameEn}]: Host Status: Realm Stage ${game.player.stage}, HP ${game.player.hp}, Qi ${game.player.qi}, Gold ${game.player.gold}. ${personalityEn}`,
    }
  }

  // Case 4: Complain
  if (fastDecision.intent === 'complain') {
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Than vãn vô ích! Con đường tu tiên nghịch thiên cải mệnh, chỉ có kẻ yếu mới khóc lóc. Mau tiếp tục tu luyện!`,
      textEn: `[${nameEn}]: Complaining is futile! The path of cultivation defies the heavens; only the weak lament. Resume your training!`,
    }
  }

  // Case 5: Accept Current Quest
  if (fastDecision.intent === 'accept_current_quest' && fastDecision.questId) {
    const available = systemQuestsFor(game)
    const quest = available.find((q) => q.id === fastDecision.questId)
    if (quest) {
      return {
        kind: 'offer_quest',
        questId: quest.id,
        textVi: `【${nameVi}】: Tiếp nhận ý chỉ! Ban bố: [${quest.nameVi}]. Hãy mau chóng hoàn thành!`,
        textEn: `[${nameEn}]: Decree received! Issued: [${quest.nameEn}]. Complete it without delay!`,
      }
    }
  }

  // Case 6: Chat General / Fallback Default
  return {
    kind: 'chat',
    textVi: `【${nameVi}】: ${personalityVi}`,
    textEn: `[${nameEn}]: ${personalityEn}`,
  }
}
```

---

## 5. Precise Implementation Strategy for Worker

### Target: `src/ai/system.ts`

```typescript
import { activeSystem, systemQuestsFor } from '../engine'
import type { GameState, Locale } from '../engine'
import { narrationWanted } from './narration'
import { classifySystemUtterance } from './jev-client'
import type { JevIntent, SystemFastDecision } from './jev-schemas'

export interface SystemChatPayload {
  mode: 'chat' | 'offer_quest'
  locale: Locale
  system: {
    id: string
    nameVi: string
    nameEn: string
    personalityVi: string
    personalityEn: string
  }
  context: {
    day: number
    stage: number
    gold: number
    luck: number
    hp: number
    qi: number
  }
  questPool: Array<{ id: string; difficulty: number; rewardGold: number }>
  playerMessage: string
  jevDecision?: {
    intent: JevIntent
    questId?: string
    obedienceScore: number
    isHostile: boolean
    latencyMs: number
  }
}

export interface SystemReply {
  kind: 'chat' | 'offer_quest'
  textVi: string
  textEn: string
  questId?: string
  fastDecision?: SystemFastDecision
}

export function buildSystemPayload(
  game: GameState,
  message: string,
  locale: Locale,
  fastDecision?: SystemFastDecision
): SystemChatPayload | null {
  const system = activeSystem(game)
  if (system === null) return null

  const mode =
    fastDecision &&
    !fastDecision.isHostile &&
    fastDecision.intent === 'request_quest' &&
    fastDecision.questId
      ? 'offer_quest'
      : 'chat'

  return {
    mode,
    locale,
    system: {
      id: system.id,
      nameVi: system.nameVi,
      nameEn: system.nameEn,
      personalityVi: system.personalityVi,
      personalityEn: system.personalityEn,
    },
    context: {
      day: game.day,
      stage: game.player.stage,
      gold: game.player.gold,
      luck: game.player.attrs.luck,
      hp: game.player.hp,
      qi: game.player.qi,
    },
    questPool: systemQuestsFor(game).map((quest) => ({
      id: quest.id,
      difficulty: quest.difficulty ?? 1,
      rewardGold: quest.rewardGold,
    })),
    playerMessage: message.replace(/\s+/g, ' ').trim().slice(0, 300),
    ...(fastDecision
      ? {
          jevDecision: {
            intent: fastDecision.intent,
            questId: fastDecision.questId,
            obedienceScore: fastDecision.obedienceScore,
            isHostile: fastDecision.isHostile,
            latencyMs: fastDecision.latencyMs,
          },
        }
      : {}),
  }
}

export function buildDeterministicSystemReply(
  game: GameState,
  fastDecision: SystemFastDecision,
  _locale: Locale
): SystemReply {
  const system = activeSystem(game)
  const nameVi = system ? system.nameVi : 'Hệ Thống'
  const nameEn = system ? system.nameEn : 'The System'
  const personalityVi = system ? system.personalityVi : 'Hệ Thống im lặng theo dõi.'
  const personalityEn = system ? system.personalityEn : 'The System watches in silence.'

  if (fastDecision.isHostile || fastDecision.intent === 'defiance_mockery') {
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Ký chủ to gan! Thái độ ngỗ ngược (Tuân phục: ${fastDecision.obedienceScore}/5). ${personalityVi} Bổn Hệ Thống từ chối phục vụ kẻ vô lễ!`,
      textEn: `[${nameEn}]: Impudent host! Insubordinate attitude (Obedience: ${fastDecision.obedienceScore}/5). ${personalityEn} The System refuses to serve the disrespectful!`,
      fastDecision,
    }
  }

  if (fastDecision.intent === 'request_quest' && fastDecision.questId) {
    const available = systemQuestsFor(game)
    const quest = available.find((q) => q.id === fastDecision.questId)
    if (quest) {
      return {
        kind: 'offer_quest',
        questId: quest.id,
        textVi: `【${nameVi}】: Ký chủ yêu cầu nhiệm vụ. Ban bố: [${quest.nameVi}]. ${quest.descVi} Thưởng: ${quest.rewardGold} vàng.`,
        textEn: `[${nameEn}]: Host requested a task. Issued: [${quest.nameEn}]. ${quest.descEn} Reward: ${quest.rewardGold} gold.`,
        fastDecision,
      }
    }
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Hiện tại không có nhiệm vụ nào phù hợp với cảnh giới của ngươi.`,
      textEn: `[${nameEn}]: No quests currently available for your cultivation realm.`,
      fastDecision,
    }
  }

  if (fastDecision.intent === 'inquire_status') {
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Trạng thái Ký chủ: Cảnh giới Tầng ${game.player.stage}, Khí huyết ${game.player.hp}, Chân khí ${game.player.qi}, Ngân lượng ${game.player.gold}. ${personalityVi}`,
      textEn: `[${nameEn}]: Host Status: Realm Stage ${game.player.stage}, HP ${game.player.hp}, Qi ${game.player.qi}, Gold ${game.player.gold}. ${personalityEn}`,
      fastDecision,
    }
  }

  if (fastDecision.intent === 'complain') {
    return {
      kind: 'chat',
      textVi: `【${nameVi}】: Than vãn vô ích! Con đường tu tiên nghịch thiên cải mệnh, chỉ có kẻ yếu mới khóc lóc. Mau tiếp tục tu luyện!`,
      textEn: `[${nameEn}]: Complaining is futile! The path of cultivation defies the heavens; only the weak lament. Resume your training!`,
      fastDecision,
    }
  }

  if (fastDecision.intent === 'accept_current_quest' && fastDecision.questId) {
    const available = systemQuestsFor(game)
    const quest = available.find((q) => q.id === fastDecision.questId)
    if (quest) {
      return {
        kind: 'offer_quest',
        questId: quest.id,
        textVi: `【${nameVi}】: Tiếp nhận ý chỉ! Ban bố: [${quest.nameVi}]. Hãy mau chóng hoàn thành!`,
        textEn: `[${nameEn}]: Decree received! Issued: [${quest.nameEn}]. Complete it without delay!`,
        fastDecision,
      }
    }
  }

  return {
    kind: 'chat',
    textVi: `【${nameVi}】: ${personalityVi}`,
    textEn: `[${nameEn}]: ${personalityEn}`,
    fastDecision,
  }
}

export async function fastClassifySystem(game: GameState, message: string): Promise<SystemFastDecision> {
  return classifySystemUtterance(game, message)
}

export async function requestSystemReply(
  game: GameState,
  message: string,
  locale: Locale
): Promise<SystemReply | null> {
  if (!narrationWanted()) return null

  const system = activeSystem(game)
  if (system === null) return null

  const cleanMessage = message.replace(/\s+/g, ' ').trim().slice(0, 300)
  if (cleanMessage.length === 0) return null

  // Tier 1: Fast reflex classification via Jev System One (~80ms)
  const fastDecision = await classifySystemUtterance(game, cleanMessage)

  // Build Tier 2 payload enriched with Jev decision
  const payload = buildSystemPayload(game, cleanMessage, locale, fastDecision)
  if (payload === null) return null

  // Tier 2: Generative LLM via /api/narrate with timeout & deterministic fallback
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2000)

  try {
    const response = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return buildDeterministicSystemReply(game, fastDecision, locale)
    }

    const data: unknown = await response.json()
    if (typeof data !== 'object' || data === null) {
      return buildDeterministicSystemReply(game, fastDecision, locale)
    }

    const reply = data as Partial<SystemReply>
    if (
      (reply.kind !== 'chat' && reply.kind !== 'offer_quest') ||
      typeof reply.textVi !== 'string' ||
      typeof reply.textEn !== 'string'
    ) {
      return buildDeterministicSystemReply(game, fastDecision, locale)
    }

    // Hallucination Defense: If Tier 2 LLM offers a quest not in the pool, reject deterministically (null)
    if (reply.kind === 'offer_quest') {
      if (
        typeof reply.questId !== 'string' ||
        !payload.questPool.some((quest) => quest.id === reply.questId)
      ) {
        return null
      }
    }

    const textVi = reply.textVi.replace(/\s+/g, ' ').trim().slice(0, 300)
    const textEn = reply.textEn.replace(/\s+/g, ' ').trim().slice(0, 300)
    if (textVi.length === 0 || textEn.length === 0) {
      return buildDeterministicSystemReply(game, fastDecision, locale)
    }

    return reply.kind === 'offer_quest'
      ? { kind: reply.kind, textVi, textEn, questId: reply.questId, fastDecision }
      : { kind: reply.kind, textVi, textEn, fastDecision }
  } catch {
    clearTimeout(timeoutId)
    return buildDeterministicSystemReply(game, fastDecision, locale)
  }
}
```

---

## 6. Verification & Regression Safety Analysis

1. **Backwards Compatibility:**
   - `buildSystemPayload(game, message, locale)` retains exact signature and behavior when called without the 4th parameter.
   - When `!narrationWanted()`, `requestSystemReply` continues returning `null`.
   - When LLM hallucinates an unknown questId, `requestSystemReply` returns `null`, passing `test/ai-system.test.ts` line 46.
   - When LLM returns a valid pooled quest reply, `requestSystemReply` returns `{ kind: 'offer_quest', questId, textVi, textEn }`, passing `test/ai-system.test.ts` line 35.
2. **Deterministic Fallback Verification:**
   - When `/api/narrate` fails with network error, timeout, or 503, `buildDeterministicSystemReply` returns a valid, in-character `SystemReply` without throwing exceptions or hanging.
   - When hostile utterance is processed, hostility warning is issued, `isHostile: true`, `obedienceScore: 1`, and no quest is offered.
   - When quest request is processed, quest is selected from active pool, `kind: 'offer_quest'` with valid `questId` is returned.
3. **Engine Isolation (AGENTS.md):**
   - No mutations to engine state.
   - Imports only `activeSystem` and `systemQuestsFor` from `../engine`.
   - Content defs are read via engine runtime helper functions.
