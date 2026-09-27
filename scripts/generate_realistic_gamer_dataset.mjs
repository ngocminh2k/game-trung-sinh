import fs from 'fs'
import path from 'path'

const envContent = fs.readFileSync('.env', 'utf-8').split('\n').map(l => l.trim()).filter(Boolean)
const baseUrl = envContent[0]
const apiKey = envContent[1]

const DATASET_DIR = path.resolve('datasets')
if (!fs.existsSync(DATASET_DIR)) {
  fs.mkdirSync(DATASET_DIR, { recursive: true })
}

// 23 Phân nhánh đa dạng mô phỏng 100% thói quen gõ phím của Game thủ thực tế
const SUB_PROMPTS = [
  // --- 1. REQUEST_QUEST (Xin nhiệm vụ) ---
  {
    intent: 'request_quest',
    style: '60% Game thủ gõ tắt, gõ nhanh, teencode, không dấu',
    desc: 'Các câu chat siêu ngắn, viết tắt: "cho xin nv", "co nv j k", "co quest moi chua", "nhan q o dau", "quest cay tien dau", "cho nv danh boss di", "con nv nao k", "nv hang ngay dau ad", "het nv r ak".',
    count: 80
  },
  {
    intent: 'request_quest',
    style: '25% Game thủ nói chuyện tự nhiên, đời thường',
    desc: 'Hỏi han thân thiện hoặc cộc lốc bình thường: "Hệ thống có nhiệm vụ gì dễ làm không?", "Hôm nay có quest săn thú nào ngon không?", "Giao cho mình một nhiệm vụ kiếm linh thạch với", "Hết việc làm rồi có quest gì mới chưa?", "Cho mình xin cái nhiệm vụ môn phái".',
    count: 80
  },
  {
    intent: 'request_quest',
    style: '15% Nhập vai kiếm hiệp tu tiên',
    desc: 'Văn phong tu sĩ: "Tại hạ muốn hạ sơn lịch luyện, xin chỉ giáo nhiệm vụ", "Bổn tọa rảnh rỗi, có ma đầu nào cần trảm sát không?", "Đệ tử cầu nhiệm vụ tông môn", "Hệ thống, ban bố nhiệm vụ khai sơn phá thạch đi".',
    count: 70
  },

  // --- 2. BEG_RESOURCE (Xin đồ, xin tiền, xin linh thạch) ---
  {
    intent: 'beg_resource',
    style: '60% Game thủ thực tế gõ nhanh, xin xỏ cợt nhả, viết tắt',
    desc: 'Các câu xin đồ kiểu game thủ: "cho it linh thach di", "ngheo qua ad oi", "cho xin vien thuoc tang exp coi", "phat qua di he thong", "cho it tien up do voi", "xin it da cuong hoa", "cho vien truc co dan di", "code tan thu dau ad", "het mau r cho xin it binh mau".',
    count: 80
  },
  {
    intent: 'beg_resource',
    style: '25% Xin xỏ lịch sự hoặc nịnh bợ Hệ Thống',
    desc: 'Gạ gẫm nhẹ nhàng: "Hệ thống đại ca cho xin ít linh thạch tiêu vặt đi", "Đang kẹt tiền mua đan dược quá, cho vay ít linh thạch đi", "Có rương quà tân thủ hay đan dược gì hỗ trợ người chơi nghèo không?", "Hệ thống đẹp trai cho xin ít bùa hộ thân với".',
    count: 75
  },
  {
    intent: 'beg_resource',
    style: '15% Nhập vai cổ trang bái tạ xin ân huệ',
    desc: 'Tu tiên cổ phong: "Đệ tử đứt gãy kinh mạch, khẩn cầu Hệ Thống ban đan dược Tẩy Tủy", "Xin ban một thanh phi kiếm để bảo mệnh", "Cầu công pháp bảo điển để vượt qua kiếp nạn này".',
    count: 70
  },

  // --- 3. DEFIANCE_MOCKERY (Chửi bới, cay cú, khinh thường Hệ Thống) ---
  {
    intent: 'defiance_mockery',
    style: '60% Toxic gamer rage, chửi tục, cay cú đập đồ, viết tắt',
    desc: 'Game thủ cay cú khi xịt đồ, chết nhảm: "game rac vcl", "he thong ngu nhu cho", "dcm xit tiep a", "nuot tien ha con cho nay", "ad lua dao", "cay vcl dut cap roi", "he thong lol", "cut di deo can nua", "game hut mau", "dkm ti le 90% van tach".',
    count: 85
  },
  {
    intent: 'defiance_mockery',
    style: '25% Mỉa mai, khinh bỉ, dỗi game',
    desc: 'Châm chọc cay độc: "Hệ thống này chắc mua ở chợ Đồng Xuân à?", "Làm ăn như trò hề vậy?", "Hệ thống nhà người ta gánh còng lưng, hệ thống này chỉ biết bóp", "Tao xóa game cho mày vừa lòng", "Ủa alo hệ thống bị lag não hả?".',
    count: 75
  },
  {
    intent: 'defiance_mockery',
    style: '15% Nghịch thiên bá đạo, thề tiêu diệt Hệ Thống',
    desc: 'Tu tiên phản nghịch: "Ngươi dám xem ta như quân cờ?", "Lão tử nghịch thiên sửa mệnh chứ không làm con rối của ngươi", "Chờ bổn tọa độ kiếp thành công, kẻ đầu tiên ta luyện hóa chính là ngươi!", "Một món khí linh tà đạo cũng đòi chỉ huy ta?".',
    count: 70
  },

  // --- 4. INQUIRE_DAO (Hỏi cách chơi, đột phá, vấn đạo) ---
  {
    intent: 'inquire_dao',
    style: '60% Game thủ hỏi mẹo build, cách up cấp, hỏi meta',
    desc: 'Hỏi gameplay: "lam sao de len truc co", "sao ko dot pha dc the", "can bao nhieu exp de len cap", "huong dan cach build ma dao voi", "chinh dao hay ma dao manh hon", "kiem tien kieu gi nhanh nhat", "di map nao de nhat bi kip", "tang diem the nao cho chuan".',
    count: 80
  },
  {
    intent: 'inquire_dao',
    style: '25% Hỏi nghiêm túc về cốt truyện và lựa chọn nhánh Đạo',
    desc: 'Người chơi suy ngẫm: "Lên Kim Đan cần chuẩn bị đan dược gì để không bị tâm ma?", "Nếu mình theo Ma Đạo thì tông môn có đuổi mình không?", "Chọn nhánh Tiêu Dao có yếu hơn Ma Đạo không?", "Làm sao để tẩy điểm thuộc tính?".',
    count: 75
  },
  {
    intent: 'inquire_dao',
    style: '15% Vấn đạo triết học tiên hiệp, tâm ma sâu sắc',
    desc: 'Văn phong tiểu thuyết: "Đạo trời bất nhân coi vạn vật như cỏ rác, đạo của ta là gì?", "Ta tu tiên vì cầu trường sinh hay vì bảo vệ người thân?", "Giữa sát phạt vô tình và từ bi độ thế, đâu mới là chân chính viên mãn?".',
    count: 70
  },

  // --- 5. COMPLAIN (Phàn nàn độ khó, than vãn rủi ro) ---
  {
    intent: 'complain',
    style: '60% Than vãn cộc lốc, khóc lóc vì boss quá trâu, tỷ lệ ảo',
    desc: 'Game thủ kêu ca: "boss trau vcl ai choi noi", "kho qua ad oi giam bot do kho di", "bi quai can 1 hit chet queo", "ti le roi do nhu cc", "sao nay den the toan ra rac", "choi ca ngay ko qua dc ai", "kho qua trầm cảm cmnr".',
    count: 80
  },
  {
    intent: 'complain',
    style: '40% Phàn nàn lịch sự hoặc than thở hài hước',
    desc: 'Kêu ca trải nghiệm: "Map này quái đánh thốn quá chịu không nổi", "Hình như game đang bị lỗi tỷ lệ rớt đồ đúng không?", "Cày cả tuần không đủ tiền mua một viên thuốc, nghèo xơ xác luôn rồi", "Hệ thống ơi cân bằng lại độ khó con boss map 2 đi".',
    count: 75
  },

  // --- 6. CHAT_GENERAL (Tán gẫu, chào hỏi, trêu đùa) ---
  {
    intent: 'chat_general',
    style: '60% Tán gẫu kiểu Gen Z, chào hỏi cộc lốc, meme',
    desc: 'Chat phiếm: "hi ad", "he lo he thong", "ngu chua m", "ad an com chua", "he thong la trai hay gai v", "test ti thoi", "co gi vui ko", "game nay ai lam the", "alo alo 1234", "chao buoi sang con bot".',
    count: 80
  },
  {
    intent: 'chat_general',
    style: '40% Trò chuyện nhập vai tự nhiên hoặc thưởng ngoạn',
    desc: 'Hỏi han phong cảnh: "Thời tiết trong game hôm nay nhìn đẹp ghê", "Hệ thống có biết tiểu sư muội ở môn phái đang làm gì không?", "Ngồi ngắm hoàng hôn đỉnh núi một chút thôi", "Chúc Hệ Thống một ngày tu luyện vui vẻ nhé".',
    count: 75
  }
]

async function generateSubBatch(item, index, total) {
  const prompt = `Bạn là chuyên gia thiết kế ngôn ngữ AI cho game.
Hãy tạo ĐÚNG ${item.count} mẫu câu chat tiếng Việt chân thực của người chơi tương tác với "Hệ Thống" theo tiêu chí:
- Ý định: ${item.intent}
- Phong cách ngôn ngữ: ${item.style}
- Mô tả chi tiết các kiểu câu cần có: ${item.desc}

ĐẶC BIỆT CHÚ Ý:
- Phản ánh đúng 100% thói quen gõ phím của game thủ Việt: viết tắt (nv, q, exp, lt, k, ko, dc, vcl, dm, ad, boss...), câu không dấu, câu ngắn gọn, câu cộc lốc, tiếng lóng internet.
- Đan xen cả câu lịch sự và câu nhập vai đúng tỷ lệ.
- Mỗi câu phải tự nhiên như thể người chơi đang gõ thật trên bàn phím.

ĐỊNH DẠNG BẮT BUỘC:
Trả về duy nhất 1 mảng JSON các object:
[
  {
    "text": "nội dung câu chat của game thủ",
    "intent": "${item.intent}",
    "obedience_score": <số nguyên 1 đến 5: 1 là cực kỳ láo/chửi tục, 3 là bình thường/cợt nhả, 5 là ngoan ngoãn/cung kính>,
    "is_hostile": <true nếu câu này là chửi bới/xúc phạm/đe dọa thô bạo, ngược lại false>,
    "dao_alignment": <chọn 1 trong: "chinh_dao" | "ma_dao" | "tieu_dao" | "trung_lap">
  }
]

Chỉ trả về JSON mảng thuần túy trong cặp ngoặc [], KHÔNG dùng markdown backticks, KHÔNG giải thích gì thêm.`

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'ag/gemini-3-flash',
      messages: [
        { role: 'system', content: 'Bạn là bộ máy sinh dữ liệu game thủ JSON siêu chân thực.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.92,
      stream: false
    })
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  let content = data.choices?.[0]?.message?.content?.trim() ?? '[]'
  content = content.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/s, '').trim()

  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      return parsed.filter(x => x.text && x.intent)
    }
    return []
  } catch (err) {
    const match = content.match(/\[\s*\{.*\}\s*\]/s)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
    const objMatches = content.match(/\{[^{}]*"text"[^{}]*\}/g)
    if (objMatches) {
      const salvaged = []
      for (const m of objMatches) {
        try { salvaged.push(JSON.parse(m)) } catch {}
      }
      if (salvaged.length > 0) return salvaged
    }
    console.error(`  ⚠️ Lỗi parse JSON ở nhánh ${index + 1}:`, err.message)
    return []
  }
}

async function main() {
  console.log(`🚀 BẮT ĐẦU SINH BỘ DỮ LIỆU GAME THỦ THỰC CHIẾN (CHÂN THỰC 100%)...`)
  console.log(`Số phân nhánh kịch bản: ${SUB_PROMPTS.length} nhánh`)

  const collected = []

  for (let i = 0; i < SUB_PROMPTS.length; i++) {
    const item = SUB_PROMPTS[i]
    console.log(`\n[${i + 1}/${SUB_PROMPTS.length}] Sinh [${item.intent}] - ${item.style.slice(0, 45)}...`)
    try {
      const samples = await generateSubBatch(item, i, SUB_PROMPTS.length)
      console.log(`  -> Thu được: ${samples.length} câu chat chuẩn game thủ.`)
      collected.push(...samples)
    } catch (e) {
      console.error(`  -> Thất bại nhánh ${i + 1}:`, e.message)
    }
  }

  console.log(`\n========================================`)
  console.log(`Tổng mẫu câu thu thập thô: ${collected.length}`)

  // Lọc trùng theo text chuẩn hóa
  const uniqueMap = new Map()
  for (const item of collected) {
    const key = item.text.trim().toLowerCase().replace(/\s+/g, ' ')
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item)
    }
  }

  const finalSamples = Array.from(uniqueMap.values())
  console.log(`Sau khi lọc trùng: ${finalSamples.length} mẫu câu độc nhất.`)

  // Xáo trộn ngẫu nhiên
  finalSamples.sort(() => Math.random() - 0.5)

  // Chia 90% Train / 10% Validation
  const splitIdx = Math.floor(finalSamples.length * 0.9)
  const trainSet = finalSamples.slice(0, splitIdx)
  const valSet = finalSamples.slice(splitIdx)

  const trainPath = path.join(DATASET_DIR, 'trung_sinh_laya_train.jsonl')
  const valPath = path.join(DATASET_DIR, 'trung_sinh_laya_val.jsonl')
  const allPath = path.join(DATASET_DIR, 'trung_sinh_laya_all.json')

  fs.writeFileSync(trainPath, trainSet.map(x => JSON.stringify(x)).join('\n'), 'utf-8')
  fs.writeFileSync(valPath, valSet.map(x => JSON.stringify(x)).join('\n'), 'utf-8')
  fs.writeFileSync(allPath, JSON.stringify(finalSamples, null, 2), 'utf-8')

  console.log(`\n🎉 HOÀN TẤT TÁI THIẾT KẾ BỘ DỮ LIỆU GAME THỦ:`)
  console.log(`  📁 File Train: ${trainPath} (${trainSet.length} mẫu)`)
  console.log(`  📁 File Validation: ${valPath} (${valSet.length} mẫu)`)
  console.log(`  📁 File Tổng: ${allPath} (${finalSamples.length} mẫu)`)

  const stats = {}
  for (const s of finalSamples) {
    stats[s.intent] = (stats[s.intent] || 0) + 1
  }
  console.log(`\n📊 Phân bố các nhóm ý định thực tế:`)
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  - ${k}: ${v} câu (${((v / finalSamples.length) * 100).toFixed(1)}%)`)
  }
}

main().catch(err => {
  console.error('Lỗi nghiêm trọng:', err)
  process.exit(1)
})
