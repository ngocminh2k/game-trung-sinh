# 🗺️ AI KNOWLEDGE MAP & ROUTER — THƯ VIỆN GAME DESIGN CHUẨN
> **Dành cho AI Agents, LLM, RAG & Nhà phát triển Game**  
> **Mục tiêu:** Định vị tức thì tài liệu, chương sách và giải pháp chính xác cho mọi bài toán thiết kế game mà **không gây loãng ngữ cảnh (no context dilution)** hay tràn token.

---

## 🤖 HƯỚNG DẪN DÀNH CHO AI KHI TRUY XUẤT (SYSTEM NAVIGATION PROMPT)

Khi người dùng hỏi về một vấn đề thiết kế game (gameplay, cơ chế, cân bằng, camera, GDD, retention...):
1. **Bước 1:** Tra cứu bảng **[Ma trận Định tuyến theo Vấn đề](#-ma-trận-định-tuyến-theo-vấn-đề-problem-router)** dưới đây để xác định chính xác từ khóa, tác phẩm và chương sách liên quan.
2. **Bước 2:** Chỉ nạp (load) hoặc đọc đúng file / chương sách được chỉ định. **Tuyệt đối KHÔNG đọc cả cuốn sách 500 trang** nếu chỉ cần giải quyết một vấn đề cụ thể (như Boss fight hay Camera).
3. **Bước 3:** Sử dụng **100 Lăng kính của Jesse Schell** hoặc **Quy trình Playcentric của Tracy Fullerton** để đưa ra câu trả lời có cấu trúc phương pháp luận rõ ràng.

---

## ⚡ MA TRẬN ĐỊNH TUYẾN THEO VẤN ĐỀ (PROBLEM ROUTER)

| Vấn đề / Bài toán Game | Khái niệm & Lý thuyết cốt lõi | File tài liệu chuẩn & Tọa độ chương | Hành động thiết kế khuyến nghị |
|---|---|---|---|
| **Game bị chán sau khi chơi một thời gian** | Pattern Mastery, Possibility Space, Fun as Learning | [**`A_Theory_of_Fun_for_Game_Design_Raph_Koster_FULL.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/A_Theory_of_Fun_for_Game_Design_Raph_Koster_FULL.md)<br>*(Ch. 2: How Brain Works, Ch. 7: Problem with Learning)*<br>[**`The_Art_of_Game_Design_Jesse_Schell.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/The_Art_of_Game_Design_Jesse_Schell.md)<br>*(Lens #3: Fun, Lens #4: Curiosity)* | Bổ sung biến thể mới, mở rộng không gian khả năng (possibility space), tránh để người chơi giải mã xong pattern quá sớm. |
| **Cảm giác đánh bị trôi, thiếu lực (Floaty Combat)** | Combat Feedback, Hitstop, Visual Juice, Impact | [**`Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md)<br>*(Level 10: The Elements of Combat)* | Thêm khung dừng hình (hitstop 2-4 frames), rung màn hình nhẹ, âm thanh va đập và hiệu ứng văng lùi (knockback). |
| **Thiết kế trận đánh Trùm (Boss Battle)** | Boss Phases, Telegraphed Attacks, Arenas | [**`Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md)<br>*(Level 13: Now You're Playing with Power / The Big Boss)* | Áp dụng quy tắc 3 giai đoạn (Phase 1: Học chiêu, Phase 2: Biến thể kết hợp, Phase 3: Cao trào tốc độ cao/tuyệt chiêu). |
| **Camera 3D bị lỗi góc nhìn, kẹt tường** | The 3 C's (Character, Controls, Camera) | [**`Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md)<br>*(Level 7: The Three C's - Part 3: Camera)* | Dùng cơ chế camera thông minh tự nâng góc khi lùi vào tường, làm mờ vật cản che nhân vật (dither/fade transparency). |
| **Người chơi bỏ game sau Ngày 1 (D1/D7 Retention tụt)** | Onboarding, FTUE (First Time User Experience), Core Loop | [**`SavaMeta_80pct_Game_Mobile_That_Bai_Sau_30_Ngay.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/3_Phan_Tich/SavaMeta_80pct_Game_Mobile_That_Bai_Sau_30_Ngay.md)<br>[**`Juul_Casual_Revolution_Expanded_Edition.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/Juul_Casual_Revolution_Expanded_Edition.md)<br>*(Chapter 3: Easy to Use and Incredibly Difficult)* | Rút ngắn tutorial dưới 90 giây; cho người chơi trải nghiệm cảm giác chiến thắng (early win) ngay trong 2 phút đầu. |
| **Cần viết tài liệu GDD gấp để xin duyệt / pitch vốn** | One-Pager GDD, High Concept, Core Pillars | [**`IGA_OnePager_Template_GoogleDocs.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/2_GDD_Templates/IGA_OnePager_Template_GoogleDocs.md)<br>[**`Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md)<br>*(Maximo III Pitch Document)* | Dùng mẫu One-Pager: 1 câu định nghĩa (Hook), 3 Cột trụ thiết kế (Core Pillars), Core Gameplay Loop, Target Audience, Visual Style. |
| **Đội ngũ lập trình / đồ họa không hiểu rõ yêu cầu thiết kế** | Modular GDD, Task breakdown, Spec Sheets | [**`GitHub_LazyHatGuy_GDDMarkdownTemplate_README.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/2_GDD_Templates/GitHub_LazyHatGuy_GDDMarkdownTemplate_README.md)<br>*(Bộ 16 file GDD theo từng module độc lập)* | Chia nhỏ GDD thành các file Markdown độc lập theo từng tính năng (Mechanics, Story, Levels, UI, AI) và gắn trực tiếp vào Git repo. |
| **Người chơi bất hòa, phá hoại trong game Multiplayer** | Player Typology, Social Dynamics, MUDs | [**`Bartle_Hearts_Clubs_Diamonds_Spades_PlayerTypes.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/Bartle_Hearts_Clubs_Diamonds_Spades_PlayerTypes.md)<br>[**`The_Art_of_Game_Design_Jesse_Schell.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/The_Art_of_Game_Design_Jesse_Schell.md)<br>*(Ch. 21: Multiplayer, Ch. 22: Community)* | Cân bằng tỷ lệ giữa 4 nhóm Bartle: tạo cơ chế bảo vệ Socializers/Achievers khỏi Killers; dùng bang hội (Guilds) để tự điều tiết. |
| **Cân bằng số liệu game, kinh tế, vũ khí (Game Balance)** | Mathematical Modeling, Dynamic Systems, Feedback Loops | [**`Game_Design_Workshop_Tracy_Fullerton.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Game_Design_Workshop_Tracy_Fullerton.md)<br>*(Ch. 5: System Dynamics, Ch. 10: Balance)*<br>[**`Costikyan_I_Have_No_Words_and_I_Must_Design_2002.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/Costikyan_I_Have_No_Words_and_I_Must_Design_2002.md) | Phân tích vòng lặp phản hồi âm/dương (Positive/Negative Feedback Loops); xác định chiến lược áp đảo (Dominant Strategy) để triệt tiêu. |
| **Cách tổ chức buổi Playtest khoa học, tránh bias** | Playcentric Methodology, Observer Protocol | [**`Game_Design_Workshop_Tracy_Fullerton.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Game_Design_Workshop_Tracy_Fullerton.md)<br>*(Ch. 9: Playtesting)*<br>[**`Medium_The_Feedback_Paradox_r.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/3_Phan_Tich/Medium_The_Feedback_Paradox_r.md) | Người thiết kế chỉ quan sát và ghi chép, KHÔNG giải thích/hướng dẫn người chơi; lắng nghe cảm giác khó chịu nhưng tự tìm giải pháp kỹ thuật. |
| **Đồ họa xấu nhưng ngân sách ít, làm sao để bán được game?** | Art Direction over Fidelity, Gameplay Economics | [**`GameDeveloper_Why_All_Of_Our_Games_Look_Like_Crap.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/3_Phan_Tich/GameDeveloper_Why_All_Of_Our_Games_Look_Like_Crap.md)<br>[**`BaylorLariat_Photorealism_is_hurting_video_games.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/3_Phan_Tich/BaylorLariat_Photorealism_is_hurting_video_games.md) | Không chạy đua đồ họa siêu thực (photorealism); tập trung vào độ đọc rõ của hình ảnh (clarity), phong cách nghệ thuật nhất quán và chiều sâu gameplay. |
| **Phân tích cơ chế một game hoàn chỉnh (Deconstruction)** | MDA Framework (Mechanics - Dynamics - Aesthetics) | [**`MDA_Paper_Hunicke_LeBlanc_Zubek.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/MDA_Paper_Hunicke_LeBlanc_Zubek.md) | Phân rã từ 2 chiều: Designer xây dựng từ Mechanics -> Dynamics -> Aesthetics; Người chơi tiếp nhận từ Aesthetics -> Dynamics -> Mechanics. |

---

## 📂 BẢN ĐỒ 8 CỤM CHUYÊN MÔN (DOMAIN CLUSTERS)

### Cụm 1: Tâm lý học người chơi, Trải nghiệm & Niềm vui (Player Psychology & Fun)
* **Tài liệu chính:**
  * [**`A_Theory_of_Fun_for_Game_Design_Raph_Koster_FULL.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/A_Theory_of_Fun_for_Game_Design_Raph_Koster_FULL.md)
  * [**`The_Art_of_Game_Design_Jesse_Schell.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/The_Art_of_Game_Design_Jesse_Schell.md) (Chương 2: Experience, Chương 8: The Player)
  * [**`Bartle_Hearts_Clubs_Diamonds_Spades_PlayerTypes.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/Bartle_Hearts_Clubs_Diamonds_Spades_PlayerTypes.md)
* **Từ khóa AI cần nhận diện:** `dopamine`, `flow state`, `pattern recognition`, `motivation`, `bartle types`, `achiever`, `explorer`, `socializer`, `killer`, `boredom`, `frustration`.

### Cụm 2: Hệ thống cơ chế & Cân bằng game (Mechanics, Systems & Balance)
* **Tài liệu chính:**
  * [**`Game_Design_Workshop_Tracy_Fullerton.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Game_Design_Workshop_Tracy_Fullerton.md) (Chương 3: Formal Elements, Chương 5: System Dynamics, Chương 10: Functionality, Completeness and Balance)
  * [**`MDA_Paper_Hunicke_LeBlanc_Zubek.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/MDA_Paper_Hunicke_LeBlanc_Zubek.md)
  * [**`Costikyan_I_Have_No_Words_and_I_Must_Design_2002.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/Costikyan_I_Have_No_Words_and_I_Must_Design_2002.md)
* **Từ khóa AI cần nhận diện:** `mechanics`, `dynamics`, `feedback loops`, `economy`, `spreadsheets`, `dominant strategy`, `zero-sum`, `asymmetric balance`, `rng`, `probability`.

### Cụm 3: The 3 C's & Thiết kế Màn chơi (Character, Camera, Controls & Level Design)
* **Tài liệu chính:**
  * [**`Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md) (Level 5: Character, Level 6: Controls, Level 7: Camera, Level 9: Level Design)
* **Từ khóa AI cần nhận diện:** `3Cs`, `character metrics`, `input responsiveness`, `camera occlusion`, `level pacing`, `greyboxing`, `blockout`, `breadcrumbs`, `landmarks`.

### Cụm 4: Thiết kế Chiến đấu & Boss Battles (Combat Systems & Boss Encounters)
* **Tài liệu chính:**
  * [**`Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md) (Level 10: Elements of Combat, Level 11: Enemies, Level 13: The Big Boss)
* **Từ khóa AI cần nhận diện:** `melee combat`, `ranged combat`, `telegraphing`, `hitboxes`, `iframe`, `stagger`, `boss phases`, `aggro`, `enemy variety`.

### Cụm 5: Game Casual, Mobile & Tối ưu Retention
* **Tài liệu chính:**
  * [**`Juul_Casual_Revolution_Expanded_Edition.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/1_Sach_Giao_Trinh/Juul_Casual_Revolution_Expanded_Edition.md)
  * [**`SavaMeta_80pct_Game_Mobile_That_Bai_Sau_30_Ngay.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/3_Phan_Tich/SavaMeta_80pct_Game_Mobile_That_Bai_Sau_30_Ngay.md)
* **Từ khóa AI cần nhận diện:** `casual games`, `mimetic interface`, `match-3`, `onboarding`, `retention D1 D7 D30`, `churn rate`, `monetization`, `hypercasual`.

### Cụm 6: Biểu mẫu Game Design Document (GDD Templates)
* **Tài liệu chính:**
  * One-Pager: [**`IGA_OnePager_Template_GoogleDocs.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/2_GDD_Templates/IGA_OnePager_Template_GoogleDocs.md)
  * Full GDD: [**`IGA_GDD_Template_GoogleDocs.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/2_GDD_Templates/IGA_GDD_Template_GoogleDocs.md), [**`itchio_barrels_Simple_GDD_Template.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/2_GDD_Templates/itchio_barrels_Simple_GDD_Template.md)
  * Git Modular GDD (16 files): [**`GitHub_LazyHatGuy_GDDMarkdownTemplate_README.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/2_GDD_Templates/GitHub_LazyHatGuy_GDDMarkdownTemplate_README.md)
* **Từ khóa AI cần nhận diện:** `game design document`, `GDD`, `one-pager`, `pitch document`, `feature spec`, `core loop diagram`.

### Cụm 7: Phương pháp Tạo mẫu & Playtesting (Prototyping & Playtesting)
* **Tài liệu chính:**
  * [**`Game_Design_Workshop_Tracy_Fullerton.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/Game_Design_Workshop_Tracy_Fullerton.md) (Chương 7: Prototyping, Chương 8: Digital Prototyping, Chương 9: Playtesting)
  * [**`Medium_The_Feedback_Paradox_r.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/3_Phan_Tich/Medium_The_Feedback_Paradox_r.md)
* **Từ khóa AI cần nhận diện:** `paper prototyping`, `playtesting`, `user feedback`, `usability`, `blind testing`, `iteration`.

### Cụm 8: Triết lý & 100 Lăng kính Thiết kế (The 100 Lenses of Jesse Schell)
* **Tài liệu chính:**
  * [**`The_Art_of_Game_Design_Jesse_Schell.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/The_Art_of_Game_Design_Jesse_Schell.md)
* **Từ khóa AI cần nhận diện:** `lenses`, `elemental tetrad`, `resonance`, `theme`, `curiosity`, `indirect control`, `transformational games`.

---

## 🔍 TRA CỨU NHANH 100 LĂNG KÍNH CỦA JESSE SCHELL (TOP LENSES)

Khi cần mổ xẻ thiết kế, AI hãy chỉ định các lăng kính tương ứng trong [**`The_Art_of_Game_Design_Jesse_Schell.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/5_Bo_50MB_OpenClaw/clean_docs/The_Art_of_Game_Design_Jesse_Schell.md):

* **Lăng kính Cốt lõi & Cảm xúc:**
  * `Lens #1: The Lens of Essential Experience`: Trải nghiệm cơ bản tôi muốn người chơi cảm thấy là gì?
  * `Lens #2: The Lens of Surprise`: Trò chơi có yếu tố bất ngờ nào không?
  * `Lens #3: The Lens of Fun`: Điều gì thực sự mang lại niềm vui ở đây?
  * `Lens #4: The Lens of Curiosity`: Điều gì thôi thúc người chơi tự hỏi "Điều gì sẽ xảy ra tiếp theo?"
* **Lăng kính Cấu trúc & Thẩm mỹ:**
  * `Lens #7: The Lens of the Elemental Tetrad`: 4 yếu tố (Mechanics, Story, Aesthetics, Technology) có hòa hợp và củng cố lẫn nhau không?
  * `Lens #8: The Lens of Holographic Design`: Chi tiết nhỏ này có phản ánh đúng tinh thần lớn của game không?
  * `Lens #9: The Lens of Unification`: Chủ đề (Theme) của game có xuyên suốt không?
* **Lăng kính Giải đố & Thử thách:**
  * `Lens #6: The Lens of Problem Solving`: Người chơi đang giải quyết bài toán gì?
  * `Lens #34: The Lens of Skill`: Trò chơi đòi hỏi kỹ năng vận động (physical), tinh thần (mental) hay xã hội (social)?
  * `Lens #35: The Lens of Expected Value`: Phần thưởng có xứng đáng với rủi ro/công sức người chơi bỏ ra không?
* **Lăng kính Điều khiển Gián tiếp & Không gian:**
  * `Lens #53: The Lens of Indirect Control`: Làm thế nào hướng dẫn người chơi mà không tước đi cảm giác tự do của họ?
  * `Lens #67: The Lens of Simplicity/Transcendence`: Cơ chế nào có thể tối giản để làm nổi bật trải nghiệm siêu việt?
