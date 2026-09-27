import fs from "fs";
import path from "path";

const creds = JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE, ".claude", ".credentials.json"), "utf8"));
const token = creds.mcpOAuth?.["secondbrain|25a59228527fc67e"]?.accessToken;

if (!token) {
  console.error("No access token found in .credentials.json!");
  process.exit(1);
}

const ENDPOINT = "https://second-brain.minhdtn-gmail-com-s-account.workers.dev/mcp";
const BASE_DIR = "F:/game-trung-sinh/docs/GameDesign_TaiLieu_Markdown";

const DOCS_TO_SYNC = [
  {
    relPath: "AI_KNOWLEDGE_MAP.md",
    title: "AI Knowledge Map & Problem Router - Game Design Master Repository",
    tags: ["game-design", "ai-router", "problem-solving", "master-index"]
  },
  {
    relPath: "README.md",
    title: "Game Design Master Repository - Overview & Catalog",
    tags: ["game-design", "catalog", "overview"]
  },
  {
    relPath: "1_Sach_Giao_Trinh/Bartle_Hearts_Clubs_Diamonds_Spades_PlayerTypes.md",
    title: "Richard Bartle - 4 Player Types (Hearts, Clubs, Diamonds, Spades)",
    tags: ["game-design", "player-types", "bartle", "psychology", "multiplayer"]
  },
  {
    relPath: "1_Sach_Giao_Trinh/Costikyan_I_Have_No_Words_and_I_Must_Design_2002.md",
    title: "Greg Costikyan - I Have No Words and I Must Design (Core Mechanics Vocabulary)",
    tags: ["game-design", "mechanics", "systems", "game-theory"]
  },
  {
    relPath: "1_Sach_Giao_Trinh/The_Art_of_Game_Design_3rdEd_Ch1_Excerpt_Wiley.md",
    title: "Jesse Schell - The Art of Game Design (Chapter 1 Excerpt)",
    tags: ["game-design", "jesse-schell", "lenses", "fundamentals"]
  },
  {
    relPath: "1_Sach_Giao_Trinh/ThietKeGame_Top5_Sach_Game_Design.md",
    title: "Top 5 Sách Game Design Nhập Môn Cần Đọc",
    tags: ["game-design", "books", "reading-list", "vietnamese"]
  },
  {
    relPath: "1_Sach_Giao_Trinh/A_Theory_of_Fun_for_Game_Design_Raph_Koster_FULL.md",
    title: "Raph Koster - A Theory of Fun for Game Design (Full Text 12 Chapters)",
    tags: ["game-design", "theory-of-fun", "raph-koster", "learning", "pattern-recognition"]
  },
  {
    relPath: "2_GDD_Templates/IGA_OnePager_Template_GoogleDocs.md",
    title: "Indie Game Academy - One-Pager GDD Template",
    tags: ["game-design", "gdd-template", "one-pager", "pitch", "indie"]
  },
  {
    relPath: "2_GDD_Templates/IGA_GDD_Template_GoogleDocs.md",
    title: "Indie Game Academy - Comprehensive 9-Page GDD Template",
    tags: ["game-design", "gdd-template", "full-gdd", "production", "indie"]
  },
  {
    relPath: "2_GDD_Templates/IGA_Free_GDD_Template_HowTo_Guide.md",
    title: "Indie Game Academy - GDD How-To Guide",
    tags: ["game-design", "gdd-guide", "how-to", "indie"]
  },
  {
    relPath: "2_GDD_Templates/GitHub_LazyHatGuy_GDDMarkdownTemplate_README.md",
    title: "LazyHatGuy - Modular Markdown GDD Template Framework",
    tags: ["game-design", "gdd-template", "modular-gdd", "github"]
  },
  {
    relPath: "2_GDD_Templates/GitHub_LazyHatGuy_GDDMarkdownTemplate_4_Gameplay and Mechanics.md",
    title: "LazyHatGuy - GDD Module 4: Gameplay and Mechanics",
    tags: ["game-design", "gdd-template", "mechanics-spec"]
  },
  {
    relPath: "2_GDD_Templates/GitHub_kosinaz_GDD_Template_for_Beginners.md",
    title: "Kosinaz - Beginner GDD Template",
    tags: ["game-design", "gdd-template", "beginner"]
  },
  {
    relPath: "2_GDD_Templates/GitHub_gamedevpl_game-design-document_GDD_TEMPLATE.md",
    title: "GameDevPL - Studio Standard GDD Template",
    tags: ["game-design", "gdd-template", "studio-standard"]
  },
  {
    relPath: "2_GDD_Templates/itchio_barrels_Simple_GDD_Template.md",
    title: "Itch.io Barrels - Simple GDD Template",
    tags: ["game-design", "gdd-template", "simple-gdd"]
  },
  {
    relPath: "3_Phan_Tich/SavaMeta_80pct_Game_Mobile_That_Bai_Sau_30_Ngay.md",
    title: "SavaMeta - Tại sao 80% Game Mobile thất bại sau 30 ngày (D1/D7 Retention & FTUE)",
    tags: ["game-design", "retention", "mobile", "ftue", "monetization", "case-study"]
  },
  {
    relPath: "3_Phan_Tich/GameDeveloper_Why_All_Of_Our_Games_Look_Like_Crap.md",
    title: "GameDeveloper - Why All Of Our Games Look Like Crap (Art Direction vs Visual Polish)",
    tags: ["game-design", "art-direction", "visuals", "critique"]
  },
  {
    relPath: "3_Phan_Tich/BaylorLariat_Photorealism_is_hurting_video_games.md",
    title: "Baylor Lariat - Photorealism is Hurting Video Games",
    tags: ["game-design", "graphics", "photorealism", "art-direction"]
  },
  {
    relPath: "3_Phan_Tich/Medium_The_Feedback_Paradox_r.md",
    title: "Medium - The Feedback Paradox in Playtesting & Player Feedback",
    tags: ["game-design", "playtesting", "feedback", "player-psychology"]
  }
];

async function storeMemory({ content, tags, project }) {
  const payload = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: {
      name: "remember",
      arguments: {
        content,
        tags,
        project,
        volatility: "durable"
      }
    }
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  return { status: res.status, text };
}

async function main() {
  console.log(`Bắt đầu đồng bộ ${DOCS_TO_SYNC.length} tài liệu Game Design cốt lõi vào Second Brain...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < DOCS_TO_SYNC.length; i++) {
    const item = DOCS_TO_SYNC[i];
    const fullPath = path.join(BASE_DIR, item.relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[SKIP] Không tìm thấy file: ${fullPath}`);
      continue;
    }

    const raw = fs.readFileSync(fullPath, "utf8");
    const content = `# ${item.title}\n\n[Nguồn file: docs/GameDesign_TaiLieu_Markdown/${item.relPath}]\n\n${raw}`;
    const sizeKB = (content.length / 1024).toFixed(1);

    process.stdout.write(`[${i + 1}/${DOCS_TO_SYNC.length}] Đang đẩy "${item.title}" (${sizeKB} KB)... `);

    try {
      const res = await storeMemory({
        content,
        tags: item.tags,
        project: "game-design"
      });

      if (res.status === 200 && res.text.includes("Stored. ID:")) {
        const match = res.text.match(/Stored\. ID: ([a-f0-9-]+)/);
        const id = match ? match[1] : "OK";
        console.log(`✅ Thành công (ID: ${id})`);
        successCount++;
      } else {
        console.log(`❌ Thất bại (HTTP ${res.status}): ${res.text.slice(0, 100)}`);
        failCount++;
      }
    } catch (err) {
      console.log(`❌ Lỗi kết nối: ${err.message}`);
      failCount++;
    }

    // Nghỉ nhẹ 300ms giữa các request để tránh rate-limit
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n🎉 Hoàn thành! Thành công: ${successCount} | Thất bại: ${failCount}`);
}

main().catch(console.error);
