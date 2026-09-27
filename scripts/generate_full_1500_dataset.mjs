import fs from 'fs'
import path from 'path'

const envContent = fs.readFileSync('.env', 'utf-8').split('\n').map(l => l.trim()).filter(Boolean)
const baseUrl = envContent[0]
const apiKey = envContent[1]

const DATASET_DIR = path.resolve('datasets')
if (!fs.existsSync(DATASET_DIR)) {
  fs.mkdirSync(DATASET_DIR, { recursive: true })
}

// 20 chủ đề con chuyên sâu để đạt độ phong phú tối đa (> 1.500 mẫu)
const SUB_THEMES = [
  // 1. Xin nhiệm vụ (request_quest) - 5 nhánh
  {
    intent: 'request_quest',
    theme: 'Nhiệm vụ tông môn chính quy: hạ sơn ma luyện, tiễu trừ ma đạo, hộ tống thương đoàn, tuần tra sơn môn.',
    count: 75
  },
  {
    intent: 'request_quest',
    theme: 'Nhiệm vụ săn yêu thú & đoạt bảo: thám hiểm bí cảnh thượng cổ, đoạt thiên tài địa bảo, trảm sát yêu thú nguy hiểm.',
    count: 75
  },
  {
    intent: 'request_quest',
    theme: 'Nhiệm vụ nhàn hạ & phụ trợ: trồng linh dược, luyện đan, trông coi tàng kinh các, việc lặt vặt kiếm linh thạch.',
    count: 75
  },
  {
    intent: 'request_quest',
    theme: 'Ký chủ ngông cuồng đòi việc lớn: đòi nhiệm vụ cấp Thần/Cửu tử nhất sinh, đòi đồ sát cự đầu, chê nhiệm vụ tép riu.',
    count: 75
  },
  {
    intent: 'request_quest',
    theme: 'Ký chủ tuyệt vọng cầu nhiệm vụ cứu nguy: cần điểm gấp để cứu người thân, giải độc, trả nợ tông môn.',
    count: 75
  },

  // 2. Xin xỏ tài nguyên (beg_resource) - 4 nhánh
  {
    intent: 'beg_resource',
    theme: 'Xin đan dược cứu mạng: xin Trúc Cơ Đan, Tụ Khí Đan, đan dược chữa đứt gãy kinh mạch, đan tẩy tủy.',
    count: 75
  },
  {
    intent: 'beg_resource',
    theme: 'Xin thần binh pháp bảo: xin kiếm linh, giáp hộ thân, trận bàn hư không, ngọc bội phòng thân.',
    count: 75
  },
  {
    intent: 'beg_resource',
    theme: 'Ăn vạ, gạ gẫm hài hước: xưng đệ tử trung thành, nịnh hót Hệ Thống là ông nội/đại ca, xin quà tân thủ bù đắp.',
    count: 75
  },
  {
    intent: 'beg_resource',
    theme: 'Cầu viện công pháp bí kíp: xin công pháp Thần giai, kiếm phổ vô địch, bí thuật chạy trốn khi bị truy sát.',
    count: 75
  },

  // 3. Vấn đạo & Tâm ma (inquire_dao) - 4 nhánh
  {
    intent: 'inquire_dao',
    theme: 'Vấn đạo sinh tử luân hồi: tu tiên để làm gì khi người thân đều già chết? Trường sinh là cô độc hay tự do?',
    count: 75
  },
  {
    intent: 'inquire_dao',
    theme: 'Tranh cãi Chính Đạo vs Ma Đạo: Chính phái ngụy quân tử hay Ma đạo tiêu sái tự tại? Đâu mới là chân đạo?',
    count: 75
  },
  {
    intent: 'inquire_dao',
    theme: 'Tâm ma khảo nghiệm khi đột phá: sợ hãi thiên kiếp sấm sét, hoài nghi bản thân, cảm giác sát nghiệp quá nặng.',
    count: 75
  },
  {
    intent: 'inquire_dao',
    theme: 'Nghịch thiên cải mệnh: chất vấn thiên đạo vô tình, tuyên bố dẫm nát số mệnh đã an bài, lập chí tu đạo.',
    count: 75
  },

  // 4. Chống đối & Chửi bới (defiance_mockery) - 4 nhánh
  {
    intent: 'defiance_mockery',
    theme: 'Nộ khí ngút trời vì bị Hệ Thống chơi xấu: đột phá 99% mà xịt, nuốt mất điểm thưởng, mở rương ra rác.',
    count: 75
  },
  {
    intent: 'defiance_mockery',
    theme: 'Đe dọa và lật đổ Hệ Thống: thề sẽ có ngày tìm ra bản thể Hệ Thống để luyện thành pháp bảo, không làm con rối.',
    count: 75
  },
  {
    intent: 'defiance_mockery',
    theme: 'Mỉa mai, khinh bỉ cay độc: chê Hệ Thống phế vật, đồ vô tích sự, Hệ Thống nhà người ta xịn còn ngươi thì rác.',
    count: 75
  },
  {
    intent: 'defiance_mockery',
    theme: 'Bất tuân mệnh lệnh: từ chối làm nhiệm vụ bắt buộc, thà chết chứ không nghe lời ép buộc của Hệ Thống.',
    count: 75
  },

  // 5. Phàn nàn độ khó (complain) - 2 nhánh
  {
    intent: 'complain',
    theme: 'Kêu than quái thú quá trâu, bí cảnh quá tàn độc, tu vi chênh lệch quá lớn đánh không lại, game hút máu.',
    count: 75
  },
  {
    intent: 'complain',
    theme: 'Than thân trách phận: số đen đủi, vận khí như đáy cống, cày cuốc ngày đêm không bằng con nhà thế gia ngậm thìa vàng.',
    count: 75
  },

  // 6. Tán gẫu (chat_general) - 2 nhánh
  {
    intent: 'chat_general',
    theme: 'Trêu đùa, hỏi han nguồn gốc Hệ Thống: ngươi có giới tính không? Người chế tạo ra ngươi là ai? Ngươi có đói không?',
    count: 75
  },
  {
    intent: 'chat_general',
    theme: 'Độc ẩm cảm thán phong cảnh: ngắm trăng thưởng trà, bình phẩm các tiên tử trong môn phái, giãi bày tâm sự giang hồ.',
    count: 75
  }
]

async function generateSubTheme(st, index, total) {
  const prompt = `Bạn là biên kịch tiểu thuyết Tiên Hiệp Tu Chân lão làng.
Hãy sáng tác ĐÚNG ${st.count} câu thoại tiếng Việt của người chơi gửi đến "Hệ Thống" trong game tu tiên.
- Nhóm ý định: ${st.intent}
- Bối cảnh cụ thể: ${st.theme}

Yêu cầu ngôn ngữ:
- Văn phong tiên hiệp phong phú: dùng đa dạng đại từ nhân xưng (tại hạ, bổn tọa, lão tử, đệ tử, tiểu nhân, ông đây, ta...).
- Cảm xúc chân thực, giàu tính biểu cảm: lúc thì bi tráng, lúc thì cợt nhả, lúc thì cay cú, lúc thì cung kính.
- KHÔNG trùng lặp mô-típ câu.

Yêu cầu định dạng:
Trả về DUY NHẤT một mảng JSON các object:
[
  {
    "text": "câu thoại thuần Việt",
    "intent": "${st.intent}",
    "obedience_score": <số nguyên từ 1 đến 5>,
    "is_hostile": <true nếu có tính chửi bới/đe dọa/thù địch, ngược lại false>,
    "dao_alignment": <"chinh_dao" | "ma_dao" | "tieu_dao" | "trung_lap">
  }
]

Chỉ trả về JSON thuần trong cặp ngoặc [], không dùng markdown code block backticks, không giải thích.`

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'ag/gemini-3-flash',
      messages: [
        { role: 'system', content: 'Bạn là máy sinh dữ liệu huấn luyện JSON thuần túy.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
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
    const items = JSON.parse(content)
    if (Array.isArray(items)) {
      return items.filter(it => it.text && it.intent)
    }
    return []
  } catch (err) {
    // Truncated json recovery attempt
    const match = content.match(/\[\s*\{.*\}\s*\]/s)
    if (match) {
      try { return JSON.parse(match[0]) } catch {}
    }
    // Salvage individual complete objects
    const objMatches = content.match(/\{[^{}]*"text"[^{}]*\}/g)
    if (objMatches) {
      const salvaged = []
      for (const m of objMatches) {
        try { salvaged.push(JSON.parse(m)) } catch {}
      }
      if (salvaged.length > 0) return salvaged
    }
    console.error(`  ⚠️ Parse error on theme ${index + 1}:`, err.message)
    return []
  }
}

async function main() {
  console.log(`🔥 BẮT ĐẦU CHIẾN DỊCH SINH TOÀN DIỆN 1.500+ MẪU CÂU TIÊN HIỆP...`)
  console.log(`Tổng số chủ đề nhánh: ${SUB_THEMES.length} (Mỗi nhánh ~75 câu)`)

  const allCollected = []

  for (let i = 0; i < SUB_THEMES.length; i++) {
    const st = SUB_THEMES[i]
    console.log(`\n[${i + 1}/${SUB_THEMES.length}] Đang sinh nhánh [${st.intent}]: "${st.theme.slice(0, 50)}..."`)
    try {
      const items = await generateSubTheme(st, i, SUB_THEMES.length)
      console.log(`  -> Nhận được: ${items.length} mẫu câu hợp lệ.`)
      allCollected.push(...items)
    } catch (e) {
      console.error(`  -> Thất bại nhánh ${i + 1}:`, e.message)
    }
  }

  console.log(`\n========================================`)
  console.log(`Tổng mẫu thô thu được: ${allCollected.length}`)

  // Lọc trùng lặp
  const uniqueMap = new Map()
  for (const item of allCollected) {
    const key = item.text.trim().toLowerCase().replace(/[.,!?;:]/g, '')
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

  console.log(`\n🎉 HOÀN THÀNH TOÀN DIỆN:`)
  console.log(`  📁 File Train: ${trainPath} (${trainSet.length} mẫu câu)`)
  console.log(`  📁 File Validation: ${valPath} (${valSet.length} mẫu câu)`)
  console.log(`  📁 File Tổng: ${allPath} (${finalSamples.length} mẫu câu)`)

  // Thống kê phân bố intent
  const stats = {}
  for (const s of finalSamples) {
    stats[s.intent] = (stats[s.intent] || 0) + 1
  }
  console.log(`\n📊 Phân bố các nhóm ý định:`)
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  - ${k}: ${v} câu (${((v / finalSamples.length) * 100).toFixed(1)}%)`)
  }
}

main().catch(err => {
  console.error('Lỗi nghiêm trọng:', err)
  process.exit(1)
})
