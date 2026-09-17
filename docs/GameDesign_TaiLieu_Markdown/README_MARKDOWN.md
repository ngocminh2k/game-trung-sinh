# 🎮 THƯ VIỆN CHUẨN TÀI LIỆU THIẾT KẾ GAME (GAME DESIGN MASTER REPOSITORY)
> **Bản định dạng Markdown (.md) chuẩn hóa toàn diện từ `GameDesign_TaiLieu`**  
> **Tổng cộng:** 66 file Markdown | **Dung lượng:** 5.24 MB văn bản thuần  
> **Phương pháp xử lý:** PyMuPDF Layout Engine + Deep Learning OCR (RapidOCR/PaddleOCR ONNX) + BeautifulSoup4 & Markdownify Semantic Extractor.

---

> 🚀 **ĐÃ TÍCH HỢP HỆ THỐNG CHỈ MỤC & BẢN ĐỒ AI (AI KNOWLEDGE MAP & INDEX):**\n> - Tra cứu nhanh định tuyến cho AI/LLM: [**`AI_KNOWLEDGE_MAP.md`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/AI_KNOWLEDGE_MAP.md)\n> - Cơ sở dữ liệu chỉ mục ngữ nghĩa dạng máy đọc: [**`AI_INDEX.json`**](file:///C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown/AI_INDEX.json)\n\n
## 📖 GIỚI THIỆU TỔNG QUAN

Thư mục này là bộ tài liệu chuẩn về **Game Design (Thiết kế Trò chơi)**, được chuyển đổi sang chuẩn **Markdown (.md)** sạch, có cấu trúc chặt chẽ, hỗ trợ đọc trên Obsidian, Notion, VS Code, GitHub hoặc tích hợp vào hệ thống RAG / LLM.

### Các cải tiến chất lượng vượt trội trong bản chuyển đổi này:
1. **Khử hoàn toàn rác giao diện web (HTML Chrome & Junk):** Bóc tách trực tiếp phần nội dung bài viết gốc, loại bỏ toàn bộ menu điều hướng, thanh tìm kiếm, chân trang, quảng cáo, nút share mạng xã hội.
2. **Khử bóng chữ (Shadow-text Deduplication) trong PDF:** Tài liệu *Theory of Fun* của Raph Koster gặp lỗi drop-shadow khiến các bộ chuyển đổi thông thường bị lặp đôi chữ (`WWhheenn wwee mmeeeett...`) đã được xử lý và làm sạch 100%.
3. **Tích hợp OCR nhận diện hình vẽ & sơ đồ (Visual & Diagram Integration):** Các trang bản vẽ tay của Scott Rogers (sơ đồ thể loại platformer, bản vẽ phác thảo level ngõ hẻm, form pitch game *Maximo III*), form Robot Action Sheet của Tracy Fullerton, và tranh hoạt hình của Raph Koster đã được OCR và lồng ghép trực tiếp vào đúng vị trí của sách.
4. **Loại bỏ file trùng lặp (Zero Duplicates):** Không còn các file trùng đuôi như `_html.md`, `_pdf.md`, `_docx.md`. Mỗi tài liệu được định danh duy nhất và chuẩn hóa.
5. **Chuẩn hóa Frontmatter:** Mọi file đều có phần Metadata YAML đầu trang ghi rõ tiêu đề, tác giả, file nguồn gốc và loại tài liệu.

---

## 🗂️ DANH MỤC CHI TIẾT THEO CẤU TRÚC THƯ MỤC

```
GameDesign_TaiLieu_Markdown/
├── 1_Sach_Giao_Trinh/          # Sách giáo trình, bài báo học thuật nền tảng
├── 2_GDD_Templates/            # Bộ sưu tập các mẫu Game Design Document thực chiến
├── 3_Phan_Tich/                # Các bài phân tích chuyên sâu về kinh tế, đồ họa & tâm lý game
├── 4_Khoa_Hoc_Cong_Dong/       # Tài liệu khóa học, kênh học thuật & cộng đồng game dev
└── 5_Bo_50MB_OpenClaw/clean_docs/ # Bộ tài liệu nén trọn bộ 3 đại giáo trình & bản dịch TV
```

---

### 📚 1. SÁCH GIÁO TRÌNH & BÀI BÁO NỀN TẢNG (`1_Sach_Giao_Trinh/`)

Nơi lưu trữ những tác phẩm đặt nền móng lý thuyết cho ngành công nghiệp game hiện đại:

| Tên File | Tác giả & Tác phẩm | Ý nghĩa & Nội dung chính |
|---|---|---|
| `Crawford_Art_of_Computer_Game_Design_1984_free.md` | **Chris Crawford** (1984) | Cuốn sách kinh điển đầu tiên trong lịch sử về Game Design. Định nghĩa game là gì, sự khác biệt giữa Puzzle - Toy - Contest - Game. |
| `The_Art_of_Game_Design_3rdEd_Ch1_Excerpt_Wiley.md` | **Jesse Schell** | Trích đoạn Chương 1 bản 3rd Edition (mới nhất) của cuốn giáo trình dạy thiết kế game nổi tiếng nhất thế giới. |
| `Costikyan_I_Have_No_Words_and_I_Must_Design_2002.md` | **Greg Costikyan** | Tiểu luận kinh điển (25 trang) xây dựng vốn từ vựng phản biện (critical vocabulary) để phân tích cơ chế game. |
| `MDA_Paper_Hunicke_LeBlanc_Zubek.md` | **Hunicke, LeBlanc, Zubek** | Khung lý thuyết MDA (Mechanics - Dynamics - Aesthetics) chuẩn mực mà mọi trường đại học đào tạo game trên thế giới đều giảng dạy. |
| `Bartle_Hearts_Clubs_Diamonds_Spades_PlayerTypes.md` | **Richard A. Bartle** | Bài báo học thuật gốc phân loại 4 nhóm người chơi trực tuyến: Achievers, Explorers, Socializers, Killers. |
| `Juul_Casual_Revolution_Chapter1_sample.md` | **Jesper Juul** (MIT Press) | Nghiên cứu về cuộc cách mạng game casual và sự thay đổi nhân khẩu học của người chơi game. |
| `A_Theory_of_Fun_for_Game_Design_theoryoffun.com_ORIGINAL_2004.md` | **Raph Koster** (2004) | Trọn bộ 51 slide và tranh minh họa cartoon: "Niềm vui trong game bắt nguồn từ việc bộ não nhận diện và làm chủ các quy luật (pattern recognition)". |
| `Viblo_Translate_ArtOfGameDesign_Chuong1.md` | **Jesse Schell** (Dịch TV) | Bản dịch tiếng Việt Chương 1: *Ở trên đời có một người gọi là Game Designer* ("Hãy nói to: Tôi là một Game Designer!"). |
| `Viblo_Series_Translate_The_Art_of_Game_Design.md` | **Viblo Community** | Tổng hợp danh mục và liên kết của series dịch sách The Art of Game Design trên Viblo. |
| `ThietKeGame_Top5_Sach_Game_Design.md` | **ThietKeGame.com** | Bài tổng hợp 5 cuốn sách bắt buộc phải đọc cho người bắt đầu bước chân vào nghề Game Design tại Việt Nam. |

---

### 📋 2. MẪU GAME DESIGN DOCUMENT THỰC CHIẾN (`2_GDD_Templates/`)

Tập hợp đầy đủ các mẫu GDD từ One-Pager ngắn gọn đến tài liệu chi tiết nhiều chương dành cho production:

1. **Bộ mẫu từ Indie Game Academy:**
   - `IGA_OnePager_Template_GoogleDocs.md`: Mẫu GDD 1 trang (One-Pager) dùng để pitch ý tưởng nhanh gọn cho sếp/nhà đầu tư.
   - `IGA_GDD_Template_GoogleDocs.md`: Mẫu GDD toàn diện 9 trang bao gồm Core Loop, Mechanics, UI/UX, Art Style, Economy.
   - `IGA_Free_GDD_Template_HowTo_Guide.md`: Cẩm nang hướng dẫn chi tiết cách viết từng mục trong GDD.
2. **Bộ mẫu LazyHatGuy (Modular GDD - 16 modules):**
   - Được chia nhỏ thành từng file Markdown độc lập giúp đội ngũ dev dễ quản lý trên Git:
   - `1_Copyright Information`, `2_Version History`, `3_Game Overview`, `4_Gameplay and Mechanics`, `5_Story, Setting and Character`, `6_Levels`, `7_Interface`, `8_Artificial Intelligence`, `9_Technical`, `10_Game Art`, `11_Secondary Software`, `12_Management`, `13_Appendices` cùng các file `README.md`, `SmallerTableOfContents.md`.
3. **Mẫu GDD từ GitHub & itchio:**
   - `itchio_barrels_Simple_GDD_Template.md`: Mẫu GDD tinh gọn thực chiến của tác giả barrels trên itch.io.
   - `GitHub_kosinaz_GDD_Template_for_Beginners.md` (+ `README.md`): Mẫu GDD cơ bản, cực kỳ trực quan cho người mới bắt đầu.
   - `GitHub_saeidzebardast_game-design-document_*.md`: Dàn ý GDD chuẩn công nghiệp.
   - `GitHub_gamedevpl_game-design-document_GDD_TEMPLATE.md`: Template GDD tiêu chuẩn của cộng đồng GameDev Ba Lan.
   - `GitHub_mikewesthad_Game-Design-Document-Resources_README.md`: Bảng tra cứu tài nguyên và đường dẫn các mẫu GDD nổi tiếng.

---

### 🔍 3. BÀI PHÂN TÍCH CHUYÊN SÂU & CASE STUDIES (`3_Phan_Tich/`)

Các bài phân tích thực tế về kinh tế học, đồ họa và hành vi người chơi:

| Tên File | Nguồn / Tác giả | Nội dung cốt lõi |
|---|---|---|
| `SavaMeta_80pct_Game_Mobile_That_Bai_Sau_30_Ngay.md` | **Sava Meta** | Phân tích vì sao 80% game mobile ra mắt thất bại trong 30 ngày đầu (vấn đề Retention D1, D7, D30, LTV vs CPI, Onboarding). |
| `GameDeveloper_Why_All_Of_Our_Games_Look_Like_Crap.md` | **Jeff Vogel** (Spiderweb Software) | Bài viết huyền thoại của Jeff Vogel về bài toán kinh tế trong đồ họa game: tại sao game indie đồ họa xấu vẫn sống khỏe suốt 25 năm nếu gameplay và cốt truyện vững. |
| `Medium_The_Feedback_Paradox_r.md` | **Corey Saul** | Nghịch lý phản hồi: Tại sao người chơi thường phàn nàn sai về nguyên nhân nhưng lại chỉ đúng triệu chứng họ cảm thấy khó chịu. |
| `BaylorLariat_Photorealism_is_hurting_video_games.md` | **The Baylor Lariat** | Góc nhìn phản biện: Cuộc chạy đua đồ họa siêu thực (photorealism) đang làm đội chi phí phát triển và bóp nghẹt tính sáng tạo của gameplay. |

---

### 🎓 4. KHÓA HỌC & CỘNG ĐỒNG (`4_Khoa_Hoc_Cong_Dong/`)

- `README_Khoa_Hoc_Cong_Dong.md`:
  - Kênh YouTube học Game Design số 1 thế giới: **Game Maker's Toolkit (GMTK)** của Mark Brown.
  - Kho tài nguyên diễn thuyết **GDC Vault** & kênh YouTube **Game Developers Conference**.
  - Các khóa học miễn phí từ **Indie Game Academy** & chuyên trang tiếng Việt **thietkegame.com**.
  - Khóa học lý thuyết cân bằng game **Game Balance Concepts** của Ian Schreiber.

---

### 🚀 5. BỘ TRỌN VẸN 3 ĐẠI GIÁO TRÌNH KINH ĐIỂN (`5_Bo_50MB_OpenClaw/clean_docs/`)

Đây là trung tâm tài liệu nặng ký nhất, chứa toàn bộ nội dung nguyên bản của 3 cuốn sách giáo trình gối đầu giường của mọi Game Designer:

1. **`The_Art_of_Game_Design_Jesse_Schell.md` (518 trang - 1.1 triệu ký tự):**
   - Tác phẩm kinh điển nhất của Jesse Schell (Carnegie Mellon University / Schell Games).
   - Trọn bộ phương pháp luận **100 Lăng Kính (The 100 Lenses)** soi chiếu trò chơi dưới góc nhìn Tâm lý học, Kiến trúc, Toán học, Âm nhạc, Nghệ thuật thị giác.
   - Đã tích hợp đầy đủ trang bìa, lời tựa, lời đề tặng và sơ đồ bản đồ Game Design tổng kết.
   - Kèm các bản dịch tiếng Việt chất lượng cao: `The_Art_of_Game_Design_Chuong_1_Viblo.md`, `Chuong_2_Viblo.md`, `Chuong_3_Viblo.md`.

2. **`Game_Design_Workshop_Tracy_Fullerton.md` (587 trang - 1.7 triệu ký tự):**
   - Giáo trình của Giáo sư Tracy Fullerton (Giám đốc USC Games - trường đại học đào tạo game số 1 nước Mỹ).
   - Triết lý thiết kế lấy người chơi làm trung tâm (**Playcentric Design Approach**).
   - Chi tiết từng bước từ Paper Prototyping (tạo mẫu thử bằng giấy), Playtesting đến hoàn thiện cơ chế Formal / Dramatic Elements.
   - Đã tích hợp trang bài tập thiết kế hệ thống hành động mẫu (*Robot Action Sheet*).

3. **`Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md` (516 trang - 818,000 ký tự):**
   - Cuốn sách thực chiến hóm hỉnh của Scott Rogers (nhà thiết kế của *Pac-Man World*, *God of War*, *Maximo*).
   - Dạy thiết kế chi tiết: Camera, Controls, Character (3C), Level Design, Combat Mechanics, Boss Battles, Platform Mechanics.
   - **Đặc biệt:** Đã dùng Deep Learning OCR trích xuất trọn vẹn 11 sơ đồ vẽ tay của Scott Rogers (Sơ đồ phả hệ game platformer, Bản phác thảo ngõ hẻm Alley Level, Platform Primer, One-Pager pitch của Maximo III).

4. **`A_Theory_of_Fun_for_Game_Design_Raph_Koster.md`:**
   - Phiên bản đầy đủ 51 trang slide có làm sạch bóng chữ và OCR tranh vẽ của Raph Koster.

5. **Bộ GDD Templates bổ trợ:**
   - `GDD_Template_Unity.md`, `GDD_Template_Beginners_GitHub.md`, `GDD_Template_Gist_raybun.md`, `IndieGameAcademy_GDD_Template.md`, `IndieGameAcademy_One_Pager_Template.md`, `Itch_Simple_GDD_Template.md`.

---

## 🎯 LỘ TRÌNH ĐỌC & ỨNG DỤNG ĐỀ XUẤT CHO GAME DESIGNER

Nếu bạn đang phát triển một dự án game:
1. **Bước 1 (Lên ý tưởng & Pitching):** Đọc `1_Sach_Giao_Trinh/Costikyan_I_Have_No_Words_and_I_Must_Design_2002.md`, sau đó dùng `2_GDD_Templates/IGA_OnePager_Template_GoogleDocs.md` để viết bản tóm tắt 1 trang.
2. **Bước 2 (Thiết lập Core Loop & Cảm giác chơi):** Đọc `5_Bo_50MB_OpenClaw/clean_docs/The_Art_of_Game_Design_Jesse_Schell.md` (đặc biệt là các lăng kính về Core Mechanics và Player Experience) kết hợp `A_Theory_of_Fun_for_Game_Design_Raph_Koster.md`.
3. **Bước 3 (Thiết kế chi tiết Level, Camera, Điều khiển, Combat):** Đọc kỹ `5_Bo_50MB_OpenClaw/clean_docs/Level_Up_The_Guide_to_Great_Video_Game_Design_Scott_Rogers.md`.
4. **Bước 4 (Viết GDD hoàn chỉnh cho Team):** Sử dụng bộ `2_GDD_Templates/GitHub_LazyHatGuy_GDDMarkdownTemplate_*.md` để đưa vào repository Git của dự án.
5. **Bước 5 (Tạo mẫu & Playtest):** Tham chiếu quy trình Playtesting khoa học trong `5_Bo_50MB_OpenClaw/clean_docs/Game_Design_Workshop_Tracy_Fullerton.md`.
