# PLAYTEST RUBRIC — Phế Căn Ký (AI playtest, 2026-09-14)

Theory base = `C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown`. Paths abbreviated below:
- **Fullerton** = `5_Bo_50MB_OpenClaw/clean_docs/Game_Design_Workshop_Tracy_Fullerton.md`
- **Koster** = `1_Sach_Giao_Trinh/A_Theory_of_Fun..._Raph_Koster_FULL.md`
- **Bartle** = `1_Sach_Giao_Trinh/Bartle_Hearts_Clubs_Diamonds_Spades_PlayerTypes.md`
- **MDA** = `1_Sach_Giao_Trinh/MDA_Paper_Hunicke_LeBlanc_Zubek.md`
- **Schell** = `5_Bo_50MB_OpenClaw/clean_docs/The_Art_of_Game_Design_Jesse_Schell.md`
- **FB-Paradox** = `3_Phan_Tich/Medium_The_Feedback_Paradox_r.md`
- **SavaMeta** = `3_Phan_Tich/SavaMeta_80pct_Game_Mobile_That_Bai_Sau_30_Ngay.md`

This rubric is NOT a second framework. It produces behavioral evidence to **rescore the same 15
lenses already scored 1-10 in `F:/game-trung-sinh/docs/design-review-2026-09-10.md`** (§5).

---

## 1. Analysis dimensions (12)

Each dimension → theoretical source → exact question to ask of a playtest → what evidence answers it.
All telemetry lives in `docs/playtest-ai/telemetry/` and reports in `docs/playtest-ai/pNN.md`.

**D1 Onboarding / first-goal clarity** · *Schell Lens #18 Flow (l.6725); Juul Casual & Usability (design-review L8); SavaMeta 60s hook (l.40); SavaMeta core-loop l.70.*
Q: Can a fresh player make a *goal-directed* action in the first 60-90s, or are they clicking at random?
Evidence: wasted-action ratio before first deliberate menu/system nav; time-on-first-screen; SavaMeta "explain loop in 1 sentence" (l.170).

**D2 Core-loop & goal clarity** · *Fullerton Ch.9 postgame "objective" question (l.21819); Fullerton Ch.5 System Dynamics.*
Q: After 10 min, can the player state the objective in one sentence?
Evidence: immediate-recall probe (postgame Q21819); whether the four remaining night-deadline goals were discovered.

**D3 Sleeping/wired-system discovery** · *Koster Ch.3 possibility space (l.386-388: too-slow vs too-fast unveiling); MDA (Mechanics→Dynamics); design-review L12.*
Q: Does the player ever *discover* a cause→effect in skill-tree / weather / companion / shops (the documented "sleeping" wiring, design-review ¶1)?
Evidence: telemetry `systemId`s actually chosen + any player attempt to trigger a hidden system; count of unexplored systems = unexploited possibility space.

**D4 Decision quality / dominant object** · *Fullerton Ch.10 Dominant Objects & Strategies (l.632-633); Schell Lens #28 Expected Value (l.9171); Costikyan (design-review L6).*
Q: Do choices differ, or does the player bind to one optimal path? Is any single System/action read as "best forever"?
Evidence: action-distribution variance across Systems; repeated-identical-action runs = dominant strategy signal (Koster "bottom-feeding", l.880).

**D5 Time-pressure pacing** · *Fullerton Ch.10 Ticking Clock (l.638); Rogers Flow curve (L5); Schell Lens #18 (not-too-easy/not-too-hard, l.6740).*
Q: Does the night/turn deadline create felt tension without paralysis? When does pressure first register?
Evidence: hesitation gaps (thinking pauses) vs both dead-turns and rushed-spam turns; time-to-first-risk.

**D6 Feedback readability** · *Fullerton Ch.11 "Using Audio as Feedback" (l.700); design-review L10; FB-Paradox silent-majority (l.56).*
Q: For the 5 known-silent combat events (BOSS_HEAL, POISON_*, COMBO_*, QI_REGEN) + crit + achievement, does the player notice *anything changed*?
Evidence: think-aloud (Ch.9 l.21944) uttering cause→effect; whether combat results are explainable from UI alone; churn vs knowing-the-why.

**D7 Economy comprehension** · *design-review L15 (Economy 4.0); Schell Lens #28 Expected Value; MDA dynamic models (Monopoly l.322-344).*
Q: Does the player correctly predict buy/sell/conversion outcomes? Is the 3-tier currency legible?
Evidence: doBuy/doSell error-and-undo rate; mispricing guesses in think-aloud; lottery bet decisions made with or without expected-value awareness.

**D8 Narrative & emotional arc** · *MDA aesthetics taxonomy, esp. Narrative & Fantasy (l.242); Schell Lens #4 Curiosity (l.2383); design-review L7.*
Q: Does the player volunteer "what happens next?" (Curiosity), and do chapters 7-8's absence (design-review ¶8) surface as felt incompleteness?
Evidence: curiosity questions logged; whether chronicle was read (p11 reads every line); timeline of normed emotional-involvement graph (Fullerton postgame l.21841).

**D9 Per-persona fit** · *Bartle taxonomy; Koster Ch.6 (l.751: different fun for different folks); MDA (aesthetics set tone).*
Q: Did the features that LIGHT each persona up get the systems that persona chases? A finding only matters if the persona that hit it wanted the feature (§4).
Evidence: roster §4 mapping; persona "what they chase" column vs delivered sensation.

**D10 Endgame / closure / churn** · *design-review L14 (Retention & Churn 5.5); Fullerton Ch.10 "The End" (l.684); SavaMeta D1/D7 thresholds (l.72, 130-131).*
Q: Does the session end with a desire to continue (or restart for NG+)? Is `terminal:true` closure felt as earned or as wall?
Evidence: post-session "want to keep playing"; drops at terminal screen; for churn cohort p17-20, exact action where they abandoned (D1-loss moment).

**D11 Challenge honesty / boss telegraph** · *Crawford (design-review L2); Schell Lens #28; Koster "failure must have a cost" (l.909).*
Q: When the boss resurrects/rages (design-review ¶2, "gotcha"), is the player shocked-but-able-to-react, or unfairly killed?
Evidence: surprise-with-fairness vs surprise-with-despair distinction in think-aloud; whether the fatal loss was avoidable with known info.

**D12 Comprehension ≠ art clarity** · *design-review L13 (Art Direction 6.0); Schell Lens #7 Elemental Tetrad.*
Q: Do 3 inconsistent art styles (design-review ¶7) confuse *meaning* (icon/click-target legibility), or only aesthetics?
Evidence: click-error on UI targets; misreading of affordances; the 42px-vs-1672px asset mismatch only matters if a target is missed.

---

## 2. Fullerton Ch.9 compliance — reading complaints without over-reacting

Source: Fullerton Ch.9 (playtest methods l.21209-21271; "Don't Follow These Rules" l.21287-21637; Taking Notes l.21741; Do Not Lead l.21935; Think Aloud l.21944; Quantitative l.21957).

**Feedback paradox (FB-Paradox l.56, l.78):** there is *no universal "player feedback"* — only constituencies. A complaint is data about *that persona's* desire, not a verdict on the game. Consolatory game ≠ good evidence; silent players are the baseline (roughly 70% silent, l.56).

**Group, then triangulate.** Rule: **a single player's observation is a lead, never a pattern.** Only promote an observation to a finding when **≥3 players** report it independently, OR **telemetry across the roster** corroborates it (Fullerton's "repeated across testers" basis + Wixon Metrics l.21989-21993: feedback cannot substitute for testing with intended audience). Churn cohort (p17-20) counts as one voice each exactly like the rest.

**What NOT to do (over-reaction guards):**
- Do not lead / answer a question with a question (l.21935, l.20920): player asking what a button does = confusion signal, not a design opinion. Don't rescue them — the pause is the finding (N. "Notice Everything," l.21469).
- Blame yourself, not the tester (G., l.21402); hunger for failure (R., l.21527); cruelly-honest stance (V., l.21608).
- One reason at a time: when comparing variants change only one element (D., l.21374), else you can't attribute cause.

**How to read a complaint:** a complaint is a *symptom located at a person*, not a fix instruction — the player's proposed "fix" is often wrong; their *frustration point* is the truth (Q., l.21519; keep the project ahead of the theory, I., l.21422). Record verbatim, file by persona, then aggregate.

---

## 3. Koster filter — was the pattern taught too early or too late?

Source: Koster Ch.2 (chunking l.233-241; noise = pattern we don't understand, l.259); Ch.3 boredom triggers l.381-392; Ch.4 (Mastery Problem l.908, failure must have a cost l.909); Ch.7 (bottom-feeding l.880; games doom to boredom l.882).

Fun = learning. There is only **one** boring: the player stops learning. Diagnose *which* of the six failure modes (l.383-389) a chronicle exit matches:

| Koster signal in chronicle/actions | Means | Action |
|---|---|---|
| "too easy / repetitive" early; all systems mastered by day 3 | Pattern grokked too early (l.383/386) | Problem: taught less than it holds — surface the sleeping systems (D3) |
| Action repertoire narrows to one exploit | Bottom-feeding (l.880) / dominant strategy | Mastery Problem (l.908): easy encounters give too much, so mastery is unrewarded |
| "too hard too fast," massive retry loops at same wall | Variations unveiled too quickly → noise (l.387) | D5 pacing; telegraph more (D11) |
| Player *finds* the hidden system via brute-typing | Correct discovery timing | Positive: pattern unveiled exactly as reachable; weight is as expected |
| Repertoire stays wide across nights AND keeps growing | Healthy learning curve | Koster-pass: fun is present |

Operator rule: **if the action-set size stops growing while win-rate is high, the game taught its patterns too early (churn = boredom). If the action-set is large but the win-rate is dying, it taught too late (churn = frustration).** Both are "boredom" to Koster (l.392) and both must score L12 as FAILING regardless of direction — but the *fix* differs, so record which.

---

## 4. Bartle mapping — a finding only matters if the persona wanted that feature

Source: Bartle taxonomy (Abstract l.10; achiever/explorer/socialiser/killer profiles l.10). Roster: `docs/playtest-ai/ROSTER.md`.

Note the roster's **suit labels ≠ Bartle-canonical suits**: the roster walked `ROSTER.md` as Spade/Diamond/Club/Heart = Killer/Achiever/Socializer/Explorer-chasing pitch, which **swaps Bartle's canonical suits** (canon: Killers=Clubs, Explorers=Spades, Socializers=Hearts, Achievers=Diamonds). **Map by the `what they chase` column, not the suit word.**

| Roster segment | Chase (ROSTER.md) | Feature that serves them | Dimensions that are load-bearing for them |
|---|---|---|---|
| p01-04 "Spade" = **Killer** | combat, damage, beating the deadline, risk | D5 (time), D11 (honest boss), any combat telegraphed | p01-04 findings on combat pacing are decisive; combat-boredom here is lethal |
| p05-08 "Diamond" = **Achiever** | quests, economy, upgrades, completion | D7 economy, D4 dominant path, system breadth | Achievement/collection gaps (design-review lame thresholds) land here |
| p09-12 "Club" = **Socializer** | NPC relationships, story, affinity | D2 goal, D8 narrative | A socializer quitting on an empty-village is expected, NOT a bug |
| p13-16 "Heart" = **Explorer** | map coverage, free text, hidden systems | D3 sleeping systems, D14-free-text parser | Their discoveries are the ONLY evidence D3 can be scored on |
| p17-20 **Churn** | understand instantly, power fast, low tolerance | D1, D10 | The only voice that can diagnose a D1-drop; their flat-out is a finding in itself |

Rule: rank findings **within** a segment first. A D7-economy complaint from p05 rises; from p10 (which never touches economy) it is noise. Conversely, a D8-empty-village complaint from p12 is core, but from p01 (combat chaser) it is ignorable. Koster Ch.6 (l.785): one game cannot fit all brains — the persona must be the unit of analysis, and the roster's spread is deliberately one-short-per-type.

---

## 5. Scoring rule — rescore the SAME 15 lenses, evidence-gated

Anchored to `docs/design-review-2026-09-10.md`. Do **not** invent new dimensions for scoring; the 12 analysis dimensions above feed into these 15 lens rows. **Rescore a lens ONLY when behavioral evidence exists** for it. Otherwise mark **"no playtest data"** — its prior score stays but is flagged unconfirmed.

| # | Lens (DESIGN-REVIEW l.9-25) | prior score | playtest evidence source | rescor e gate |
|---|---|---|---|---|
| 1 | Fullerton Formal Systems & Playtest | 8.5 | §2 protocol compliance | Confirms protocol methodology, not a feature |
| 2 | Crawford Challenge/Fantasy/Exp | 8.5 | D11, D12 | Confirms honest-game readability |
| 3 | Schell Elemental Tetrad | 8.0 | D8, D12 | Confirm mechanics/story/art coherence live |
| 4 | MDA | 7.5 | D3, D6 (Dynamics position) | Confirm player experiences intended dynamics |
| 5 | Flow & Difficulty Curve | 7.5 | D1, D5 | Pace & onboarding live evidence |
| 6 | Costikyan Decisions & Systems | 7.5 | D4 | Choice-weightedness evidence |
| 7 | Narrative Architecture & Pacing | 7.5 | D8 (ch7-8 gap) | Curiosity + felt-incompleteness |
| 8 | Juul Casual & Usability | 7.2 | D1, D2 | First-goals clarity |
| 9 | Bartle Player Types | 7.0 | §4 mapping | Per-persona fit |
| 10 | Feedback Loops | 7.0 | D6 (5 silent events, crit) | Noticed-cause-effect |
| 11 | Technical Arch & Determinism | 7.0 | (determinism robust unless telemetry shows drift) | mostly no new data |
| 12 | Fun = Learning (Koster) | 6.5 | §3 filter, D3 | action-repertoire growth |
| 13 | Art Direction | 6.0 | D12 | click-target legibility |
| 14 | Retention & Churn | 5.5 | D10, p17-20 | endgame + D1-loss |
| 15 | Economy & Resource Sinks | 4.0 | D7 | buy/sell comprehension |

**Scale (1-10, anchored to prior score):**
- **1-3** = behavioral evidence *reproves* a prior neutral/good score is actually broken in live play.
- **4-5** = live evidence shows the feature does not function as designed (matches design-review's sub-5 rows).
- **6-8** = live evidence is consistent with, or modestly improves, the prior mid-5 through mid-8 scores.
- **9-10** = live evidence *independently validates* a strength (multiple players + telemetry both positive, per §2 triangulation).
- **no playtest data** = cannot be scored in this pass; retain prior score with a flag.

Every scored row must quote ≥3 unobstructed pieces of behavioral evidence (player quotes + telemetry counters) or be downgraded to "no playtest data". Scoring output: a single table mirroring §9-25 of the design review, so the two evaluations are directly comparable.

---

## 6. Theories FLAGGED not directly applicable to Phế Căn Ký

- **Bartle's *population dynamics* (changing the MUD player mix, balancing types, stability-points l.10 end)** — applies to *recurring-player bases of live multiplayer*, not a single-playthrough SP window. Use only the *taxonomy* (the 4 profiles), not the dynamics; Killer-typing is also weak for an SP game (no other players to impose on — p01-04 hence chase *the System*, not people, see ROSTER l.10-13): scores against "Killer" should be read as "competitor/dominator", not griefing.
- **SavaMeta / Juul retention thresholds (D1≥30%, D7≥12%, 60s hook, l.72/130/40)** — those are *consumer mobile* benchmarks for monetized F2P, not a night-deadline SP narrative prototype. Borrow only the *qualitative* signals (early-win, hook-in-60s, friction-kills, l.40/70/160). Do NOT fail the game for missing a D1 number that was never a goal.
- **MDA's *tuning* loop (spreadsheet re-tuning over many sessions, l.429-448)** — assumes repeated play; this playtest is one session each. Use MDA for *aesthetics→dynamics decomposition* (l.160-171) only.
- **Fullerton's Play Matrix (Ch.9 l.21584)** — a positioning/discussion tool, not a scoring axis here.