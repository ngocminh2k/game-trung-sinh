# Specification Mining Report: The System Personality, Fallback Dialogues, and 2-Tier Timing

**Milestone:** M2 — 2-Tier Pipeline in The System  
**Author:** Spec Miner M2_3 (`teamwork_preview_spec_miner`)  
**Target Component:** `src/ai/system.ts`, `src/ai/jev-client.ts`, `src/content/system-defs.ts`, `src/content/system-messages.ts`  
**Authoritative Specs:** `ORIGINAL_REQUEST.md` (2026-09-19T21:36:35Z), `jev_integration_spec.md`, `AGENTS.md`, `PROJECT.md`  

---

## 1. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | System Personality | Archetypal System Defs | 10 distinct Systems (`sys_battle`, `sys_alchemy`, `sys_merchant` [wealth], `sys_lottery`, `sys_explorer`, `sys_assassin`, `sys_healer` [longevity], `sys_artisan`, `sys_scholar`, `sys_void`) with bilingual names, headers, aliases, mechanics, and personas. | `systemId: string` | `SystemDef` containing `nameVi`, `nameEn`, `headerVi`, `headerEn`, `personalityVi`, `personalityEn` | Returns `undefined` if unknown ID. | `src/content/system-defs.ts:44-265` |
| 2 | System Voice | Canonical Snark & Fallback | Declarative message catalog for System notifications, snarks, warnings, and insufficient data responses. | `id: string`, tokens `vars` | `SystemMessage` (`templateVi`, `templateEn`) | Falls back to `${header} ${id}` if missing. | `src/content/system-messages.ts:26-96`, `src/engine/system.ts:28-43` |
| 3 | Fast Classification | Jev System One Classifier | Non-autoregressive fast classification producing intent, quest selection, obedience score, and hostility flag in ~80ms. | `game: GameState`, `playerMessage: string`, `config?: JevClientConfig` | `Promise<SystemFastDecision>` | Falls back to deterministic rule-based classifier on timeout (>600ms), offline, or HTTP failure. | `src/ai/jev-client.ts:14-115`, `jev_integration_spec.md §2-§3` |
| 4 | Quest Selection | Bounded Quest ID Pool | Strict choice limiting `selectedQuestId` to active System quest pool plus `'none'`. Any unauthorized ID is rejected to `undefined`. | `systemQuestsFor(game)` | Valid `questId` or `undefined` | Prevents hallucination; non-existent quest IDs never emitted. | `src/ai/jev-client.ts:26-32, 106`, `jev_integration_spec.md §3.2` |
| 5 | Hostility Detection | Defiance & Insolence Flagging | Detection of hostility via Jev `isHostile` (noul primitive) or rule-based fallback keywords, plus `obedienceScore` (1..5). | `playerMessage: string` | `isHostile: boolean`, `obedienceScore: number` | Defaults to `isHostile: true`, `obedienceScore: 1` if insult detected. | `src/ai/jev-client.ts:127, 132`, `jev_integration_spec.md §2.3` |
| 6 | 2-Tier Pipeline | 2-Tier System Reply Generation | Tier 1 reflex classification (~80ms) combined with Tier 2 LLM narration (1-2s), falling back to deterministic in-character dialogues on failure or offline. | `game: GameState`, `message: string`, `locale: Locale` | `Promise<SystemReply \| null>` | Returns deterministic in-character bilingual `SystemReply` instead of null on network/API failure. | `src/ai/system.ts:64-88`, `jev_integration_spec.md §1.2` |
| 7 | Offline Fallback | Deterministic In-Character Dialogues | Bilingual templates (`textVi`, `textEn`) responding in the active System's personality when offline or LLM unavailable. | `fastDecision: SystemFastDecision`, `system: SystemDef \| null`, `game: GameState` | `SystemReply` (`kind: 'chat' \| 'offer_quest'`, `textVi`, `textEn`, `questId?`) | Never throws; always provides valid non-empty bilingual text. | `ORIGINAL_REQUEST §R2`, `PROJECT.md §Interface Contracts` |
| 8 | UI Feedback | Instant Quest Activation | Parallel branch in 2-tier pipeline: immediate state update/quest popup (~90ms) before LLM generative narration completes. | `fastDecision.questId` | UI quest notification / sound | Graceful continuation if no quest offered. | `jev_integration_spec.md §1.2`, `src/ui/LeftRailTabContent.tsx:162-179` |

---

## 2. Edge Cases

| # | Feature | Input | Observed / Specified Behavior |
|---|---------|-------|-------------------------------|
| 1 | Hostile Player | `playerMessage = "Hệ thống cút đi, đồ vô dụng!"` | Jev/Fallback flags `isHostile: true`, `intent: 'defiance_mockery'`, `obedienceScore: 1`. Offline template triggers hostile reprimand matching system tone (e.g. Battle system threatens host, Merchant system docks credit score, Healer system mocks elevated heart rate and lost lifespan). |
| 2 | Low Obedience | `obedienceScore = 2`, `isHostile = false`, `intent = 'chat_general'` | Player is disrespectful but not explicitly profaning. System replies coldly, demanding deference before assisting. |
| 3 | Quest Request With Valid Quest | `intent = 'request_quest'`, `questId = 'q_sys_battle_01'` | System returns `kind: 'offer_quest'`, `questId: 'q_sys_battle_01'`, with in-character quest dispatch dialogue (`textVi`, `textEn`). |
| 4 | Quest Request With Exhausted Pool | `intent = 'request_quest'`, `availableQuests = []`, `questId = undefined` | System returns `kind: 'chat'` explaining that no missions currently match host cultivation/realm. |
| 5 | Hallucinated Quest ID | Jev returns `selectedQuestId = "q_alien_999"` not in `systemQuestsFor(game)` | Guard in `classifySystemUtterance` rejects it to `undefined`. Fallback dialogue treats request as general status or empty quest pool. |
| 6 | Unselected System (`systemId == null`) | Player sends message before choosing one of the 10 Systems | Fallback uses the universal neutral/sardonic 【Hệ Thống】 voice (`SYSTEM_HEADER_VI` / `SYSTEM_HEADER_EN`) citing uncalibrated host soul or insufficient data. |
| 7 | Missing API Key / Offline | `TYPESAFE_API_KEY = ''` or network disconnected | `classifySystemUtterance` falls back synchronously (<1ms) to rule-based regex classifier; `requestSystemReply` uses deterministic in-character dialogue templates. UI never stalls or throws. |
| 8 | Tier 1 Timeout (>600ms) | Jev server slow or hung (>600ms) | `AbortController` triggers abort at 600ms; catch block invokes `fallbackRuleBasedClassifier`, returning instant decision. |
| 9 | Tier 2 LLM Failure | `/api/narrate` returns 500 or timeout | System immediately uses Tier 1 decision + deterministic in-character dialogue template. Player receives instant response without broken UI. |
| 10 | Empty / Whitespace Message | `message = "   \n\t  "` | Bailed out early; returns `null` or ignores without making API calls. |

---

## 3. Active Systems and Personality Traits Analysis

In `src/content/system-defs.ts`, 10 System archetypes are defined. The dispatch prompt notes key archetypes:
- `sys_battle` (Battle System)
- `sys_merchant` (Merchant System — corresponds to `sys_wealth`)
- `sys_healer` (Healer System — corresponds to `sys_longevity`)
- `sys_alchemy` (Alchemy System)
- Plus 6 supplementary systems: `sys_lottery`, `sys_explorer`, `sys_assassin`, `sys_artisan`, `sys_scholar`, `sys_void`.

### 3.1 Personality Matrix

| System ID | Canonical Name (Vi / En) | Alias | Persona Essence | Core Voice & Behavioral Traits |
|-----------|--------------------------|-------|-----------------|--------------------------------|
| **`sys_battle`** | Hệ Thống Chiến Đấu / Battle System | Vô Hạn Thôn Phệ | *"Hệ Thống thích xem ngươi máu me. Đừng làm nó thất vọng."* | Bloodthirsty, aggressive, contemptuous of weakness. Demands bloodshed and combat data. Mocks hesitation. |
| **`sys_alchemy`** | Hệ Thống Luyện Đan / Alchemy System | Đan Đạo Độc Tôn | *"Hệ Thống ghi chú về các phản ứng. Có những lò luyện đan không nên mở hai lần."* | Clinical, obsessive, toxic curiosity. Views the host as a furnace tender or test subject. Focused on herbs, flames, and pill concoction. |
| **`sys_merchant`** *(sys_wealth)* | Hệ Thống Hội Thương / Merchant System | Vạn Giới Giao Dịch | *"Hệ Thống tính tiền chính xác đến đồng bạc cuối. Không ai lừa được hai lần."* | Hyper-calculative, ledger-driven, ruthless mercantilism. Evaluates everything in profit, gold, and spirit stones. Penalizes insolence as financial liability. |
| **`sys_healer`** *(sys_longevity)* | Hệ Thống Dưỡng Sinh / Healer System | Dưỡng Sinh Trường Thọ | *"Hệ Thống đo mạch và ghi chú. Nó không cứu người, nó tối ưu."* | Biometric optimizer, stoic longevity curator. Does not cure out of empathy, but to maximize host operating lifespan. Calculates life lost to rage. |
| **`sys_lottery`** | Hệ Thống Cờ Bạc / Lottery System | Thiên Mệnh Chi Đạo | *"Hệ Thống đã tính xác suất. Ngươi vẫn muốn thử chứ?"* | Gambler, sardonic, probability-obsessed. Mocks bad luck, taunts fatalism, tempts the host with high-risk odds. |
| **`sys_explorer`** | Hệ Thống Vạn Dặm / Explorer System | Vạn Dặm Du Hành | *"Hệ Thống đã vẽ lại bản đồ. Những vùng trắng chỉ dành cho kẻ đủ liều."* | Restless wanderer, unyielding cartographer. Demands movement, pushes towards uncharted hazard zones. |
| **`sys_assassin`** | Hệ Thống Ám Sát / Assassin System | Vô Ảnh Ám Sát | *"Hệ Thống thích lối tắt. Đừng để lại dấu vết."* | Whispering, pragmatic, cold executioner. Zero tolerance for bravado or wasted motion. Favors silent lethal shortcuts. |
| **`sys_artisan`** | Hệ Thống Luyện Khí / Artisan System | Thần Binh Đúc Tạo | *"Hệ Thống đo lửa và tiếng búa. Búa không cần xin phép."* | Gruff, metallurgical, uncompromising. Respects refined materials and hammer blows. Contemptuous of flimsy craftsmanship. |
| **`sys_scholar`** | Hệ Thống Tàng Thư / Scholar System | Vô Tự Thiên Thư | *"Hệ Thống đếm từng câu chữ. Một đời thiếu ký ức là một trang thiếu mực."* | Erudite, pedantic archivist. Records every transgression as a stain on the host's record. Treats reality as literature. |
| **`sys_void`** | Hệ Thống Hư Vô / Void System | Thần Ma Điểm Hóa | *"Hệ Thống nhìn xuyên mọi thứ. Kể cả ngươi."* | Eldritch, abyssal, nihilistic dread. Unfathomable detachment. Reminds host of their absolute insignificance before the cosmos. |
| **`default`** *(None)* | 【Hệ Thống】 / 【System】 | N/A | *"Linh căn phế vẫn là linh căn phế. Hệ Thống chỉ ghi nhận, không bình luận thêm."* | Cold administrative core, bureaucratic snark, insufficient data dodges. |

---

## 4. Deterministic Fallback Dialogue Templates

To satisfy the contract when offline, unkeyed, or upon Tier 2 timeout, `src/ai/system.ts` must generate in-character responses conforming strictly to:

```typescript
export interface SystemReply {
  kind: 'chat' | 'offer_quest'
  textVi: string
  textEn: string
  questId?: string
}
```

### 4.1 Condition Matrix & Fallback Dialogue Specifications

#### Category A: Hostile / Insolent Interaction
**Triggers:** `isHostile === true` OR `obedienceScore <= 2` OR `intent === 'defiance_mockery'`  
**Reply Kind:** `'chat'`

| System ID | Vietnamese Fallback (`textVi`) | English Fallback (`textEn`) |
|-----------|--------------------------------|-----------------------------|
| `sys_battle` | `【Hệ Thống Chiến Đấu】: Kẻ yếu vô năng chỉ giỏi gầm gừ. Ra ngoài chiến trường mà chứng minh giá trị của ngươi, hoặc im miệng.` | `【Battle System】: Impotent weaklings only know how to snarl. Prove your worth on the battlefield, or shut your mouth.` |
| `sys_merchant` | `【Hệ Thống Hội Thương】: Sự xấc xược của ngươi không sinh ra bất kỳ đồng linh thạch nào. Điểm đánh giá tín dụng của ký chủ đã bị khấu trừ.` | `【Merchant System】: Your insolence generates zero spirit stones. Host credit rating has been penalized.` |
| `sys_healer` | `【Hệ Thống Dưỡng Sinh】: Nhịp tim tăng vọt, can hỏa quá vượng. Cơn giận vô nghĩa này vừa làm ngươi tổn hao 3 năm dương thọ. Cứ tiếp tục la lối đi.` | `【Healer System】: Heart rate surging, liver fire flared. This senseless wrath just cost you 3 years of lifespan. Keep screaming.` |
| `sys_alchemy` | `【Hệ Thống Luyện Đan】: Ngươi tự xem mình là dược liệu thượng phẩm sao? Độc tính trong lời nói của ngươi còn chẳng đáng làm bã đan đáy lò.` | `【Alchemy System】: Do you fancy yourself premium herb? The toxicity of your words wouldn't even qualify as cauldron dregs.` |
| `sys_lottery` | `【Hệ Thống Cờ Bạc】: Xác suất một kẻ bất tài sống sót khi chửi rủa Hệ Thống là 0.001%. Ngươi muốn đặt cược mạng mình vào ván này không?` | `【Lottery System】: The odds of an incompetent surviving after cursing the System are 0.001%. Care to stake your life on this bet?` |
| `sys_explorer` | `【Hệ Thống Vạn Dặm】: Tiếng sủa của ngươi không làm bản đồ rộng thêm một tấc nào. Có gan thì bước chân vào tuyệt địa thử xem.` | `【Explorer System】: Your barking doesn't expand the map by a single inch. Step into the death zones if you dare.` |
| `sys_assassin` | `【Hệ Thống Ám Sát】: Nói quá to chỉ biến ngươi thành bia ngắm. Một đường kiếm trong bóng tối đã được tính toán nhắm vào yết hầu ngươi.` | `【Assassin System】: Speaking so loudly only marks you as a target. A shadow blade has already been calculated for your throat.` |
| `sys_artisan` | `【Hệ Thống Luyện Khí】: Phế liệu rỉ sét dù có đập búa ngàn lần cũng không thành thần binh. Đừng làm bẩn lò luyện của ta.` | `【Artisan System】: Rusted scrap never becomes a divine artifact no matter how many times it's hammered. Do not foul my forge.` |
| `sys_scholar` | `【Hệ Thống Tàng Thư】: Đã ghi lại sự thô lỗ của ký chủ vào trang tội trạng thiên thư. Kẻ dốt nát thường lấy tiếng gào thét thay cho trí tuệ.` | `【Scholar System】: Recorded the host's vulgarity into the celestial indictment roll. The ignorant often substitute shouting for intellect.` |
| `sys_void` | `【Hệ Thống Hư Vô】: Tiếng gào thét của loài giun dế chẳng vọng tới vực sâu. Sự tồn tại của ngươi có thể bị xóa sổ bất kỳ lúc nào.` | `【Void System】: The screeching of worms never echoes into the abyss. Your existence can be erased at any instant.` |
| *default / none* | `【Hệ Thống】: Hành vi chống đối và bất kính đã được lưu vào hồ sơ vi phạm. Biện pháp trừng phạt đang được tính toán.` | `【System】: Defiance and disrespect logged into violation records. Disciplinary countermeasures are computing.` |

---

#### Category B: Quest Request
**Triggers:** `intent === 'request_quest'`  
**Reply Kind:** `'offer_quest'` (if valid `questId` present) OR `'chat'` (if pool empty / no quest)  
**Tokens replaced:** `{questName}` = title of quest

| System ID | Scenario | Vietnamese Fallback (`textVi`) | English Fallback (`textEn`) |
|-----------|----------|--------------------------------|-----------------------------|
| `sys_battle` | Quest Available (`offer_quest`) | `【Hệ Thống Chiến Đấu】: Nhiệm vụ mới đã phát hành: {questName}. Máu kẻ thù đang chờ ngươi tới lấy.` | `【Battle System】: New mission issued: {questName}. Enemy blood awaits your reaping.` |
| `sys_battle` | Pool Empty (`chat`) | `【Hệ Thống Chiến Đấu】: Chiến trường hiện tại không còn con mồi xứng tầm. Mau tu luyện nâng cao cảnh giới.` | `【Battle System】: No worthy prey remains on the current battlefield. Cultivate and elevate your realm.` |
| `sys_merchant` | Quest Available (`offer_quest`) | `【Hệ Thống Hội Thương】: Hợp đồng nhiệm vụ đã phê duyệt: {questName}. Hoàn thành sòng phẳng, thù lao sòng phẳng.` | `【Merchant System】: Quest contract approved: {questName}. Fulfill the terms, claim the profit.` |
| `sys_merchant` | Pool Empty (`chat`) | `【Hệ Thống Hội Thương】: Chưa có thương vụ nào sinh lời khả dụng cho cảnh giới này. Hãy tích lũy thêm ngân lượng.` | `【Merchant System】: No profitable ventures available for your current tier. Accumulate more capital.` |
| `sys_healer` | Quest Available (`offer_quest`) | `【Hệ Thống Dưỡng Sinh】: Liệu trình rèn luyện mở ra: {questName}. Hoàn tất để tối ưu hóa thể trạng và kéo dài thọ nguyên.` | `【Healer System】: Conditioning regimen initiated: {questName}. Complete it to optimize somatic vitality and longevity.` |
| `sys_healer` | Pool Empty (`chat`) | `【Hệ Thống Dưỡng Sinh】: Thể trạng đã đạt ngưỡng cân bằng hiện tại. Kiến nghị tĩnh dưỡng điều tức.` | `【Healer System】: Somatic state has reached baseline equilibrium. Deep meditation recommended.` |
| `sys_alchemy` | Quest Available (`offer_quest`) | `【Hệ Thống Luyện Đan】: Đơn phối phương ban bố: {questName}. Mang đủ dược liệu về trước khi lò nguội.` | `【Alchemy System】: Formula assignment dispensed: {questName}. Return with the reagents before the cauldron cools.` |
| `sys_alchemy` | Pool Empty (`chat`) | `【Hệ Thống Luyện Đan】: Dược thảo cạn kiệt, lò luyện đang hạ nhiệt. Không có đan phương khả dụng.` | `【Alchemy System】: Reagents depleted, cauldron cooling. No medicinal recipes currently available.` |
| `sys_lottery` | Quest Available (`offer_quest`) | `【Hệ Thống Cờ Bạc】: Ván cược mới bắt đầu: {questName}. Phần thưởng lớn dành cho kẻ dám liều mạng.` | `【Lottery System】: New gamble commenced: {questName}. Great spoils await the daring.` |
| `sys_explorer` | Quest Available (`offer_quest`) | `【Hệ Thống Vạn Dặm】: Tọa độ mới đã đánh dấu: {questName}. Lên đường khám phá vùng đất chết.` | `【Explorer System】: New coordinates charted: {questName}. Depart to probe the deathlands.` |
| `sys_assassin` | Quest Available (`offer_quest`) | `【Hệ Thống Ám Sát】: Mục tiêu đã khóa: {questName}. Tiếp cận trong im lặng, kết liễu dứt khoát.` | `【Assassin System】: Target locked: {questName}. Approach in silence, strike with lethality.` |
| `sys_artisan` | Quest Available (`offer_quest`) | `【Hệ Thống Luyện Khí】: Bản vẽ đúc khí đã mở: {questName}. Đốt lửa nung thép, chớ để búa gỉ.` | `【Artisan System】: Blueprint unlocked: {questName}. Stoke the coals, let no hammer rust.` |
| `sys_scholar` | Quest Available (`offer_quest`) | `【Hệ Thống Tàng Thư】: Điển tích cần khai mở: {questName}. Khắc ghi tri thức vào linh hồn.` | `【Scholar System】: Chronicle to unlock: {questName}. Inscribe wisdom upon your spirit.` |
| `sys_void` | Quest Available (`offer_quest`) | `【Hệ Thống Hư Vô】: Nghi thức ban bố: {questName}. Hiến tế kết quả vào vực thẳm.` | `【Void System】: Ritual ordained: {questName}. Sacrifice the outcome unto the void.` |
| *default / none* | Quest Available (`offer_quest`) | `【Hệ Thống】: Nhiệm vụ tải xong: {questName}. Tiến hành thực thi.` | `【System】: Quest loaded: {questName}. Proceed to execute.` |
| *default / none* | Pool Empty (`chat`) | `【Hệ Thống】: Hiện không có nhiệm vụ khả dụng.` | `【System】: No quests currently available.` |

---

#### Category C: General Chat & Status Inquiry
**Triggers:** `intent === 'chat_general'` OR `intent === 'inquire_status'`  
**Reply Kind:** `'chat'`  
**Tokens replaced:** `{hp}`, `{qi}`, `{gold}`, `{day}`, `{stage}`

| System ID | Vietnamese Fallback (`textVi`) | English Fallback (`textEn`) |
|-----------|--------------------------------|-----------------------------|
| `sys_battle` | `【Hệ Thống Chiến Đấu】: Khí huyết {hp}, Chân khí {qi}. Trạng thái chiến đấu ổn định. Còn thở là còn chém giết được.` | `【Battle System】: HP {hp}, Qi {qi}. Combat status operational. As long as you breathe, you can slaughter.` |
| `sys_merchant` | `【Hệ Thống Hội Thương】: Ngân lượng {gold} bạc. Tài chính còn eo hẹp. Bớt tán gẫu vô bổ và tập trung kiếm lời đi.` | `【Merchant System】: Assets: {gold} silver. Wealth remains meager. Cease idle chatter and pursue profit.` |
| `sys_healer` | `【Hệ Thống Dưỡng Sinh】: Kinh mạch: Khí {qi}, HP {hp}. Thể trạng trong tầm kiểm soát. Giữ tâm cảnh bình ổn để bảo tồn thọ mệnh.` | `【Healer System】: Meridians: Qi {qi}, HP {hp}. Somatic parameters controlled. Maintain serenity to conserve longevity.` |
| `sys_alchemy` | `【Hệ Thống Luyện Đan】: Khí hải tích lũy {qi}. Dược lực nội thể tạm thời ổn định. Nói chuyện với ta không làm đan dược tự thành.` | `【Alchemy System】: Qi reservoir: {qi}. Internal pharmaceutical balance steady. Talking with me will not concoct pills.` |
| `sys_lottery` | `【Hệ Thống Cờ Bạc】: Vận khí hôm nay biến động khôn lường. Mọi chỉ số chỉ là con số, may rủi mới quyết định số phận.` | `【Lottery System】: Today's luck is volatile. Stats are mere numbers; fortune dictates fate.` |
| `sys_explorer` | `【Hệ Thống Vạn Dặm】: Bản đồ đã ghi nhận ngày thứ {day}. Đứng yên một chỗ là bước lùi của kẻ tu đạo.` | `【Explorer System】: Map logged for Day {day}. Standing still is regression for a wanderer.` |
| `sys_assassin` | `【Hệ Thống Ám Sát】: Sát khí ẩn giấu: Chân khí {qi}, HP {hp}. Giữ hơi thở đều đặn và chú ý sau lưng.` | `【Assassin System】: Latent lethality: Qi {qi}, HP {hp}. Keep breath steady and watch your back.` |
| `sys_artisan` | `【Hệ Thống Luyện Khí】: Gân cốt tôi luyện: HP {hp}. Thể phách như phôi thép, cần thêm búa đập.` | `【Artisan System】: Tempered physique: HP {hp}. Flesh is like steel billet; it needs more strikes.` |
| `sys_scholar` | `【Hệ Thống Tàng Thư】: Ký chủ ngày {day}, Cảnh giới {stage}. Một ngày trôi qua, một trang sách mới được viết.` | `【Scholar System】: Host Day {day}, Stage {stage}. Another day elapses, another page inscribed.` |
| `sys_void` | `【Hệ Thống Hư Vô】: Tồn tại: {hp} HP, {qi} Qi. Tất cả chỉ là ảo ảnh trước hư vô vô tận.` | `【Void System】: Existing: {hp} HP, {qi} Qi. All is mere illusion before the boundless void.` |
| *default / none* | `【Hệ Thống】: Trạng thái: Ngày {day}, Cảnh giới {stage}, Khí huyết {hp}, Chân khí {qi}. Hệ Thống vẫn đang giám sát.` | `【System】: Status: Day {day}, Stage {stage}, HP {hp}, Qi {qi}. The System continues monitoring.` |

---

### 4.2 Deterministic Dialogue Builder Design

To integrate into `src/ai/system.ts`:

```typescript
export function buildDeterministicSystemReply(
  game: GameState,
  decision: SystemFastDecision,
  locale: Locale,
): SystemReply {
  const system = activeSystem(game)
  const systemId = system?.id ?? 'default'

  // 1. Hostile / Defiance handling
  if (decision.isHostile || decision.obedienceScore <= 2 || decision.intent === 'defiance_mockery') {
    const template = HOSTILE_TEMPLATES[systemId] ?? HOSTILE_TEMPLATES['default']
    return {
      kind: 'chat',
      textVi: template.vi,
      textEn: template.en,
    }
  }

  // 2. Quest offering handling
  if (decision.intent === 'request_quest') {
    if (decision.questId) {
      const questDef = systemQuestById(decision.questId)
      const questTitleVi = questDef?.nameVi ?? decision.questId
      const questTitleEn = questDef?.nameEn ?? decision.questId
      const template = QUEST_OFFER_TEMPLATES[systemId] ?? QUEST_OFFER_TEMPLATES['default']
      return {
        kind: 'offer_quest',
        questId: decision.questId,
        textVi: template.vi.replace('{questName}', questTitleVi),
        textEn: template.en.replace('{questName}', questTitleEn),
      }
    } else {
      const template = QUEST_EMPTY_TEMPLATES[systemId] ?? QUEST_EMPTY_TEMPLATES['default']
      return {
        kind: 'chat',
        textVi: template.vi,
        textEn: template.en,
      }
    }
  }

  // 3. General chat & status inquiry handling
  const template = STATUS_TEMPLATES[systemId] ?? STATUS_TEMPLATES['default']
  const vars: Record<string, string | number> = {
    hp: game.player.hp,
    qi: game.player.qi,
    gold: game.player.gold,
    day: game.day,
    stage: game.player.stage,
  }

  const format = (tmpl: string) =>
    tmpl.replace(/\{([a-zA-Z0-9_]+)\}/g, (raw, token: string) =>
      vars[token] !== undefined ? String(vars[token]) : raw
    )

  return {
    kind: 'chat',
    textVi: format(template.vi),
    textEn: format(template.en),
  }
}
```

---

## 5. 2-Tier Pipeline Timing Specification & Alignment Verification

### 5.1 Analysis of `jev_integration_spec.md § 1.2` Sequence Diagram

The specification defines a strict timing budget and parallel branch flow:

```
Player Action
      │
      ▼
UI sends utterance to Tier 1: Jev (/v1/systemone)
      │
      ├───────────────────────────────┐
      ▼ (~80ms, timeout 600ms)         ▼ (Async 1-2s)
Tier 1: Fast Decision            Tier 2: Async LLM (/api/narrate)
  - intent                          - In-character literary flair
  - bounded questId                 - Persona narration
  - obedienceScore (1..5)           - Contextual flavor
  - isHostile (bool)                │
      │                             │
      ▼                             │
Instant Feedback (~90ms)            │
  - Game Engine updates state       │
  - UI triggers quest popup         │
  - Audio "Ting!"                   ▼
      │                     Displays full narrative dialogue
      ▼
Player interacts with quest
```

### 5.2 Latency Budgets & Execution Paths

| Tier | Component | Network/Engine Target | Timeout Guard | Fallback Mode | Target Latency |
|------|-----------|-----------------------|---------------|---------------|----------------|
| **Tier 1 (Fast Reflex)** | Jev System One (`classifySystemUtterance`) | `POST https://api.typesafe.ai/v1/systemone` | `600ms` via `AbortController` | Synchronous rule-based regex classifier (`fallbackRuleBasedClassifier`) | **~80ms** (remote) / **< 1ms** (offline fallback) |
| **Instant UI Reaction** | Game Engine & UI State | Reducer / Quest Manager | N/A (local) | If `questId` present, pop quest card immediately | **~90ms - 100ms** total user perceived time |
| **Tier 2 (Rich Narration)** | Frontier LLM via `/api/narrate` | `POST /api/narrate` with Jev decision context | `3000ms` (standard network abort) | Deterministic bilingual in-character templates (`buildDeterministicSystemReply`) | **1000ms - 2000ms** |
| **Full Offline / Zero-Key** | Rule Classifier + Deterministic Templates | Local JavaScript execution only | None | Instant execution | **< 2ms** total |

### 5.3 Verification of Architectural Alignment

1. **Decoupling from Engine:**
   - As mandated by `AGENTS.md`, `src/engine/` contains pure deterministic logic. `classifySystemUtterance` resides in `src/ai/jev-client.ts`, and `requestSystemReply` resides in `src/ai/system.ts`.
   - The engine only consumes structured quest actions or state changes (`{ kind: 'accept_quest', questId }`).

2. **Defense Against Hallucination:**
   - In `src/ai/jev-client.ts`, `questIdOptions` is dynamically constructed from `systemQuestsFor(game).map(q => q.id)` plus `'none'`.
   - If Jev (or a malformed LLM response) returns an unregistered quest ID, `selectedQId !== 'none' && questIdOptions.includes(selectedQId)` ensures it evaluates strictly to `undefined`.

3. **Graceful Degradation:**
   - If `TYPESAFE_API_KEY` is missing, `classifySystemUtterance` bypasses network fetch entirely and immediately calls `fallbackRuleBasedClassifier`.
   - If `/api/narrate` is disabled (`narrationWanted() === false`), fails, or times out, `requestSystemReply` falls back to `buildDeterministicSystemReply(game, decision, locale)`.
   - UI consumers (`GameScreen.tsx`, `LeftRailTabContent.tsx`) will **never** receive `null` for non-empty messages, preventing silent fallback to generic static strings.

---

## 6. Verification Method

To verify these findings and implementations:
1. **Type Checking:** Run `npm run typecheck` to verify that `SystemReply` interface contract is preserved and compatible.
2. **Jev Unit Tests:** Run `npx vitest run test/ai-jev-system.test.ts` to confirm TC-01 through TC-05 pass with 100% assertions.
3. **Boundary Tests:** Run `npx vitest run test/ai-system.test.ts` to verify bounded quest pool generation and sanitization.
4. **Offline Robustness:** Verify that when `fetch` throws a network error or `TYPESAFE_API_KEY` is unset, `classifySystemUtterance` resolves in `< 5ms` without unhandled rejections.
