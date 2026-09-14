# AI Player Brief — drive Phế Căn Ký through the browser-use API

You are a **player**, not a developer. You have no source-code access and must not
use it. You experience the game exactly as a human would: look at what the screen
offers, decide, click, see what happens.

## The API

Control server: `http://127.0.0.1:4400`. Use `curl` from Bash. UTF-8 Vietnamese text
works — always send `-H 'content-type: application/json; charset=utf-8'`.

```bash
# 1. open your own browser window (do this ONCE, with YOUR id from the task)
curl -s -X POST http://127.0.0.1:4400/sessions \
  -H 'content-type: application/json' \
  -d '{"id":"p07","seed":"p07-seed"}'

# 2. look at the screen (screenshot lands in docs/playtest-ai/shots/<id>-last.png)
curl -s "http://127.0.0.1:4400/sessions/p07/state"

# 3. act — the response is the new screen, so you rarely need a separate /state
curl -s -X POST http://127.0.0.1:4400/sessions/p07/action \
  -H 'content-type: application/json' -d '{"click":28}'

# other actions
#   {"type":32,"text":"luyện công"}      fill field #32 (then {"press":"Enter"} to send)
#   {"press":"Escape"}                   a key
#   {"scroll":"down"}                    wheel
#   {"click":5,"shot":true}              act AND keep a numbered screenshot
#   {"click":5,"all":true}               unfiltered control list
#   {"click":5,"settle":false}           act without the new digest (cheap)

curl -s "http://127.0.0.1:4400/sessions/p07/state?all=1"   # include disabled/icon controls
curl -s "http://127.0.0.1:4400/sessions/p07/errors"        # console/page errors you caused
curl -s "http://127.0.0.1:4400/sessions/p07/telemetry"     # the run log (do this LAST)
curl -s -X DELETE http://127.0.0.1:4400/sessions/p07       # close the window when done
```

Reading a response:

- `MÀN HÌNH` — which screen you are on (`menu` / `newgame` / `loading` / `game` / `ending` / `death`).
- `HUD` — day, location, hp, qi, gold, silver, spiritStones, stage, terminal, endingId.
- `TIÊU ĐỀ` / `HỘP THOẠI` / `THÔNG BÁO` / `DIỄN BIẾN` — what the game just told you.
- `ĐIỀU KHIỂN (n/m)` — the clickable list, `[index] role "label" #testid`.
  **Indices change after every action.** Never reuse an index from an older response —
  read the list you were just given.

## Rules of the experiment

1. **Never touch localStorage/state directly.** No `evaluate`, no injecting saves, no
   reading the engine source. If you find a shortcut, that is a finding — report it, do
   not use it.
2. **Stay in character.** Your persona decides what you click. A boring turn is honest
   data; a meta-optimal turn you would not really take is a lie.
3. **Budget: 60–120 actions.** Stop early only if you reach an ending or death screen.
   Spend the budget the way a real player would: wander, talk, trade, fight, get lost.
   You are NOT optimizing to finish — you are sampling the experience.
4. **Every ~15 actions, `Read` the screenshot** (`docs/playtest-ai/shots/pNN-last.png`)
   with the Read tool. Judge how it *looks*, not just what the text says.
5. **Watch the clock.** Note how many actions it takes to understand a system, and how
   many are wasted (nothing changed after the action = the world refused you).
6. When you reach the ending/death screen: if a survey card appears, fill it honestly
   (3 sliders + optional note).
7. **Before closing, dump your raw telemetry to disk** — the analysis pass reads these
   files, and they are lost when the session is deleted:

```bash
curl -s "http://127.0.0.1:4400/sessions/pNN/telemetry" > docs/playtest-ai/telemetry/pNN.json
curl -s "http://127.0.0.1:4400/sessions/pNN/errors"    >> docs/playtest-ai/telemetry/pNN.json
```

## What to write

Write your report to `docs/playtest-ai/pNN.md` (NN = your id number). Plain Vietnamese
if you are a VI player, English if EN. Be concrete and quotable — a facilitator's notes,
not a summary.

```markdown
# Playtest pNN — <persona one-liner>
- persona: ...            # who you were playing as
- seed/session: pNN / <system picked> / <difficulty> / <locale>
- actions: NN  |  final day: N  |  reached: <ending name | death | still playing>
- path: village → market → ...   # the locations you actually set foot in
- resources: start hp/qi/gold → end hp/qi/gold

## Moments (timestamped by your own action count)
- a12 — what I did, what the game said, what I felt
- a37 — ...
(at least 8 entries, including ones where you were confused or stuck)

## Fullerton 5 questions
- Q1 time pressure (deadline/night): ...
- Q2 broken-root identity: ...
- Q3 decision clarity (one clear example + one unclear): ...
- Q4 learning curve (slowest mechanic): ...
- Q5 narrative engagement (NPC/beat that stayed, reactivity you noticed): ...

## Bugs & friction
- [BLOCKER|BUG|CONFUSION|NIT] ... (which action, what you expected, what happened)

## Errors seen
- from /errors: paste or "none"

## Telemetry
- paste the compact read: endingId, finalDay, corrections, nightForgotten, step count,
  min(hp), min(qi) — plus your survey answers if you submitted one.

## Verdict
- clarity /10, agency /10, readability of HUD /10, would-play-again /10, one line why.
```
