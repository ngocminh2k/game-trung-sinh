# Phế Căn Ký — Human Playtest Protocol

Based on **Tracy Fullerton, "Game Design Workshop" (Ch. 9: Playtesting)** and adapted for a deterministic, single-player cultivation RPG with an ink-and-jade aesthetic.

---

## 1. Purpose

Validate that the **first-time player experience** (a complete Scenario I run, ~45–90 min) delivers on the five design pillars:

1. **A world, not a form** — the regional map, nodes, and exits feel like a place
2. **Visible ambition, hidden rails** — free text and choices feel free; corrections are invisible
3. **Every outing has a trade-off** — HP/qi/time/gold/materials are legible and meaningful
4. **Cultivation is discovery** — talents, manuals, and equipment feel earned
5. **One focused play surface** — no outer scroll; keyboard-first; dock panels only scroll internally

The protocol yields:
- **Qualitative evidence** (5 structured questions + free-form observations)
- **Quantitative telemetry** (path, timings, resource curves, correction triggers, ending reached)
- **Post-run survey** (3 quick Likert + 1 open text) shown on the ending screen

---

## 2. Participant Profile

| Criterion | Target |
|-----------|--------|
| Prior xianxia / cultivation RPG exposure | Mixed (recruit both veterans and newcomers) |
| Platform | Desktop browser (Chrome / Firefox / Edge) |
| Language | VI or EN (participant chooses at start) |
| Session length | One sitting, no pause-resume |
| Compensation | N/A (internal / community) |

Recruit **8–12 participants** (4–6 per language) for the first protocol run.

---

## 3. Session Structure (≈ 75 min total)

| Phase | Time | Activity |
|-------|------|----------|
| **Briefing & consent** | 5 min | Read the one-page consent, choose VI/EN, confirm desktop + keyboard |
| **Guided onboarding (first 5 min)** | 5 min | Facilitator observes silently; participant plays the first region (Greenwood Village) |
| **Unmoderated play** | 45–75 min | Participant plays to a terminal ending; facilitator only intervenes on hard crash |
| **Post-run survey** | 3 min | In-game prompt on the ending screen (3 Likert + 1 open text) |
| **Semi-structured interview** | 10 min | Facilitator asks the 5 qualitative questions; notes verbatim |

**Do not** explain mechanics, lore, or optimal paths. The game must teach itself.

---

## 4. Qualitative Questions (Fullerton Ch. 9 — Core 5)

Ask **exactly these five** after the run, in order. Record verbatim. No leading follow-ups.

| # | Question | What It Probes |
|---|----------|----------------|
| **Q1 — Time pressure** | *"At any point did you feel rushed or pressured by the day counter / deadline? Describe the moment."* | Whether the 21-day soft deadline (night_forgotten) feels like fair tension vs. arbitrary stress. |
| **Q2 — Emotional state (linh căn phế)** | *"How did the 'broken root' premise make you feel during play? Did it shape your choices?"* | Whether the defective spirit root (0.5 efficiency) reads as **meaningful identity** vs. mere penalty. |
| **Q3 — Decision clarity** | *"When you chose between the three contextual actions or typed free text, how often did you understand what each would do? Give one clear and one unclear example."* | Whether sentence-selection + free text achieves **involvement + enjoyment** (CMU Façade finding) without opacity. |
| **Q4 — Learning curve** | *"What mechanic took you the longest to understand? Was there a moment you felt the game taught you vs. you discovering it?"* | Distinguish **tutorial gaps** from **intentional discovery** (pillar 4). |
| **Q5 — Narrative engagement** | *"Which NPC or story beat stayed with you? Did any flag/choice you made earlier come back in a way you noticed?"* | Whether lightweight flags (`helped_farmer_tu`, `insulted_guard_truong`) create **perceived reactivity** (Disco Elysium doctrine). |

**Optional probes** (only if participant volunteers):
- Accessibility: reduced motion, colour contrast, keyboard reachability
- Audio: BGM, SFX, stamp/breakthrough cues
- Art: region backdrops, NPC portraits, protagonist poses

---

## 5. Telemetry Schema (client-side JSON)

Implementation: `src/ui/playtest.ts` · storage key `phe-can-ky:playtest:v1`
(a JSON array, newest run last, capped at the 10 most recent runs).

```ts
interface PlaytestStep {
  t: number;      // ms since run start
  day: number;    // in-world day
  kind: string;   // action kind that produced this state ('move', 'story_choice', …)
  loc: string;    // locationId after the action
  hp: number;
  qi: number;
  gold: number;
}

interface PlaytestRun {
  version: 1;
  id: string;             // random per-run id (join key for the survey)
  seed: string;
  locale: 'vi' | 'en';
  difficulty: 'story' | 'balanced' | 'hard';
  startedAt: number;      // epoch ms
  endedAt: number | null; // null while the run is still live
  endingId: string | null;
  finalDay: number;
  corrections: number;         // forced-convergence counter at close
  nightForgotten: boolean;     // deadline flag fired before the ending
  steps: PlaytestStep[];  // capped at PLAYTEST_MAX_STEPS
}
```

**Deliberation time (thời gian cân nhắc)** is *derived, not stored*: it is the
`t` gap between consecutive steps. Storing absolute timestamps keeps the log
append-only and halves the payload versus a per-step duration field. The
`day`/`hp`/`qi`/`gold` snapshot per step reconstructs the resource curve, and
the `loc`/`kind` sequence is the đường đi (path).

Two further derived reads answer Q1 and the analysis table directly:
`min(hp)`, `min(qi)` over steps, and the final `day` versus the deadline flag.

### Implementation notes

- One step per dispatched action. A step whose `day`/`loc`/`hp` snapshot is
  identical to the previous step was a rejected attempt — that is itself a
  useful signal (the player reached for something the world refused).
- The run closes on `game.terminal` (ending screen, including death).
- No PII and no AI keys. The participant can clear it from DevTools, and
  deleting a save slot leaves telemetry untouched by design (it is run data,
  not player data).

---

## 6. Post-Run Survey (In-Game, 3 Likert + 1 Open)

Shown **on the ending screen** (below the epitaph / epilogue) as a dismissible card.

```ts
interface PlaytestSurvey {
  version: 1;
  runId: string;    // matches PlaytestRun.id
  day: number;      // in-world day at submission (context for the reader)
  endingId: string | null;
  // 1–5 Likert (1 = strongly disagree, 5 = strongly agree)
  clarity: number;  // "I understood what my choices would do."
  agency: number;   // "My decisions felt like they mattered."
  pressure: number; // "The deadline pressured me." (Q1's quantitative twin)
  // Open text (optional, max 280 chars)
  note: string;
}
```

Stored under `phe-can-ky:playtest-feedback:v1` as an array (newest last, capped).
`rootless-star` (the emotional low point) and `broken root` identity are covered
by the interview instead, so the card stays at three sliders.

**Keys for i18n** (add to `src/i18n/vi.ts` and `en.ts` under `ui.playtest`):

```json
"playtest": {
  "title": "Hành trình của ngươi đã khép lại. Có thể chia sẻ một chút không?",
  "clarity": "Tôi hiểu những lựa chọn của mình sẽ dẫn đến đâu.",
  "agency": "Quyết định của tôi cảm thấy có trọng lượng.",
  "pressure": "Hạn đêm thứ mười hai khiến tôi căng thẳng.",
  "freeTextLabel": "Điều gì còn sót lại trong lòng? (Tùy chọn)",
  "submit": "Gửi ấn tượng",
  "skip": "Bỏ qua",
  "thanks": "Tạ ơn đạo hữu. Kiếp sau gặp lại."
}
```

The card **does not block** restart/dismiss; it is purely optional.

---

## 7. Facilitator Checklist (Print One Per Session)

```
[ ] Consent signed / recorded
[ ] Language chosen: VI / EN
[ ] Seed recorded: ________________
[ ] Difficulty: story / balanced / hard
[ ] Started at: _______ (hh:mm)
[ ] Ended at: _______ (hh:mm)
[ ] Ending reached: ________________
[ ] Q1 notes: ___________________________________________________
[ ] Q2 notes: ___________________________________________________
[ ] Q3 notes: ___________________________________________________
[ ] Q4 notes: ___________________________________________________
[ ] Q5 notes: ___________________________________________________
[ ] Survey submitted: Y / N
[ ] Telemetry file present in localStorage: Y / N
[ ] Observations (crashes, freezes, confusion, delights):
_________________________________________________________________
_________________________________________________________________
```

---

## 8. Analysis Template (Post-Session)

| Metric | Target (First Protocol Run) |
|--------|------------------------------|
| **Completion rate** | ≥ 75% reach a terminal ending |
| **Median playtime** | 45–90 min (Scenario I scope) |
| **Corrections used** | Median ≤ 1 (free text mostly understood) |
| **Night forgotten rate** | ≤ 15% (deadline is fair) |
| **Q1 (time pressure)** | ≤ 25% report "rushed/pressured" |
| **Q2 (broken root identity)** | ≥ 60% say it shaped choices positively |
| **Q3 (decision clarity)** | ≥ 80% give a clear example; unclear examples point to specific beats |
| **Q4 (learning curve)** | No single mechanic > 30% "longest to understand" |
| **Q5 (narrative engagement)** | ≥ 2 distinct NPCs/beats named per participant |
| **Survey qClarity** | Median ≥ 4 |
| **Survey qAgency** | Median ≥ 4 |
| **Survey qPressure** | Median ≥ 4 |

**Pass gate**: All targets met → protocol validated for wider recruitment.  
**Fail gate**: Any target missed → diagnose, patch, re-run protocol.

---

## 9. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-09-10 | Claude Code (ngocminh2k) | Initial protocol per issue #20 / Fullerton Ch. 9 |

---

*This document is the authoritative playtest protocol. Update it when the acceptance criteria in issue #20 change.*