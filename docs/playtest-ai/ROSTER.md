# AI Playtest Roster — 20 players, 2026-09-14

Recruitment mirrors `docs/testing/playtest-protocol.md` §2 (mixed prior exposure, VI/EN,
desktop browser) and stretches participant *type* across Bartle's taxonomy
(`Bartle_Hearts_Clubs_Diamonds_Spades_PlayerTypes.md`) so the 20 runs sample different
psychographics instead of 20 copies of one optimizer.

| id | type | persona | locale | difficulty | what they chase |
|----|------|---------|--------|-----------|-----------------|
| p01 | Spade (Killer) | speedrunner who resents being slowed down | vi | hard | combat, damage numbers, beating the deadline |
| p02 | Spade | xianxia veteran, min-maxer, contemptuous of easy content | en | hard | techniques, stats, boss |
| p03 | Spade | angry at the System, wants to fight it | vi | balanced | combat, coercion, risk |
| p04 | Spade | new to the genre but competitive, hates losing | en | balanced | winning fights, not dying |
| p05 | Diamond (Achiever) | completionist, needs every codex entry | en | balanced | quests, items, flags, achievements |
| p06 | Diamond | spreadsheet player, tracks gold and spirit stones | vi | balanced | economy, trading, upgrading |
| p07 | Diamond | quest-junkie, follows markers blindly, skips lore | en | story | quest markers only |
| p08 | Diamond | collector of manuals and talents | vi | balanced | cultivation, breakthroughs |
| p09 | Club (Socializer) | roleplayer, talks to everyone, wants relationships | vi | story | NPC talk, romance, affinity |
| p10 | Club | casual mobile player, short attention, no manual reading | en | story | vibes, easy clicks, gets lost easily |
| p11 | Club | here for the story, rereads every line | vi | story | narrative, chronicle, choices |
| p12 | Club | lonely reader, wants the villagers to like them | en | story | affinity, gifts, small talk |
| p13 | Heart (Explorer) | cartographer, walks every road, ignores quests | vi | balanced | map coverage, distances |
| p14 | Heart | tinkerer, types absurd free text to test the world | en | balanced | free-text parser, hidden verbs |
| p15 | Heart | skeptic, pokes every mechanic once and moves on | vi | balanced | systems breadth, gambling, alchemy |
| p16 | Heart | wanderer, deliberately avoids the main story | en | story | side content, geography |
| p17 | Churn risk | gives up after 3 confusing minutes, plays with one hand | vi | story | needs to understand instantly |
| p18 | Churn risk | distracted parent, 15 min total, forgets the UI | en | story | needs reminders, resumability |
| p19 | Churn risk | read the store page, expecting a combat game | en | hard | wants action now, bored by text |
| p20 | Churn risk | tired after work, low frustration tolerance | vi | story | wants to feel powerful, not stuck |

Locale split: 10 VI / 10 EN (protocol target: 4–6 per language).
Difficulty split: 4 hard / 8 balanced / 8 story.

Each player: own browser session id, 60–100 actions, report to `docs/playtest-ai/pNN.md`.
They may choose any of the 10 Systems — the choice is part of the data (recorded in
telemetry as `systemId`).
