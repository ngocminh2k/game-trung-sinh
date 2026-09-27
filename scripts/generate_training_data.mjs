import fs from 'fs'
import path from 'path'

const envContent = fs.readFileSync('.env', 'utf-8').split('\n').map(l => l.trim()).filter(Boolean)
const baseUrl = envContent[0]
const apiKey = envContent[1]

const DATASET_DIR = path.resolve('datasets')
if (!fs.existsSync(DATASET_DIR)) {
  fs.mkdirSync(DATASET_DIR, { recursive: true })
}

const BATCH_TOPICS = [
  {
    category: 'request_quest',
    description: 'Người chơi xin nhiệm vụ, hỏi việc làm, ma luyện tông môn, săn yêu thú, kiếm linh thạch/cống hiến. Văn phong từ cung kính đến ngang ngược hoặc bông đùa.',
    count: 60
  },
  {
    category: 'beg_resource',
    description: 'Người chơi xin xỏ Hệ Thống đan dược, linh thạch, công pháp, gạ gẫm buff chỉ số, than nghèo kể khổ xin cứu trợ.',
    count: 40
  },
  {
    category: 'inquire_dao',
    description: 'Vấn đạo, tâm ma kiếp nạn, hỏi về cảnh giới tu hành, ý nghĩa sinh tử, nghịch thiên hay thuận thiên, đạo tâm dao động.',
    count: 40
  },
  {
    category: 'defiance_mockery',
    description: 'Người chơi chửi bới, khinh bỉ, đe dọa Hệ Thống, tức giận vì rớt cấp/tỷ lệ xịt, coi thường quy tắc hoặc tuyên bố chống lại Hệ Thống.',
    count: 50
  },
  {
    category: 'complain',
    description: 'Người chơi than vãn độ khó, phàn nàn quái trâu, đau khổ vì cày cuốc, chê game khó nuốt, xin giảm độ khó.',
    count: 40
  },
  {
    category: 'chat_general',
    description: 'Hỏi thăm vu vơ, chào hỏi Hệ Thống, bình phẩm phong cảnh, thời tiết giới tu tiên, nói chuyện phiếm nhập vai.',
    count: 40
  }
]

async function generateBatch(topic) {
  const prompt = `Bạn là biên kịch game Tiên Hiệp Tu Chân xuất sắc.
Hãy tạo đúng ${topic.count} mẫu câu thoại tiếng Việt của người chơi gửi cho "Hệ Thống" theo chủ đề sau:
- Chủ đề: ${topic.description}

Yêu cầu định dạng:
Trả về duy nhất một mảng JSON các object, mỗi object có cấu trúc:
{
  "text": "câu thoại của người chơi (văn phong tu tiên thuần Việt, từ ngữ sinh động phong phú)",
  "intent": "${topic.category}",
  "obedience_score": <số nguyên từ 1 đến 5: 1 là cực kỳ phản nghịch/chửi bới, 3 là bình thường/hơi cợt nhả, 5 là tuyệt đối kính cẩn>,
  "is_hostile": <true nếu câu nói có tính xúc phạm/thù địch/chửi rủa Hệ Thống, ngược lại false>,
  "dao_alignment": <chọn 1 trong: "chinh_dao" | "ma_dao" | "tieu_dao" | "trung_lap">
}

LƯU Ý QUAN TRỌNG:
Chỉ trả về JSON thuần túy trong cặp ngoặc vuông [...], không dùng markdown backticks (\`\`\`json), không giải thích gì thêm.`

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'ag/gemini-3-flash',
      messages: [
        { role: 'system', content: 'Bạn là máy sinh dữ liệu huấn luyện JSON chính xác.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.85,
      stream: false
    })
  })

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  let content = data.choices?.[0]?.message?.content?.trim() ?? '[]'
  // Clean markdown backticks if any
  content = content.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/s, '').trim()
  
  try {
    const items = JSON.parse(content)
    if (Array.isArray(items)) {
      return items.filter(it => it.text && it.intent)
    }
    return []
  } catch (err) {
    console.error('Failed to parse JSON for topic', topic.category, err.message)
    // Try regex extraction of json array
    const match = content.match(/\[\s*\{.*\}\s*\]/s)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {}
    }
    return []
  }
}

async function main() {
  console.log('🚀 Bắt đầu sinh tập dữ liệu huấn luyện cho game-trung-sinh...')
  const allSamples = []

  for (let i = 0; i < BATCH_TOPICS.length; i++) {
    const topic = BATCH_TOPICS[i]
    console.log(`[Batch ${i + 1}/${BATCH_TOPICS.length}] Đang sinh nhóm: ${topic.category}...`)
    try {
      const items = await generateBatch(topic)
      console.log(` -> Thu được ${items.length} mẫu câu.`)
      allSamples.push(...items)
    } catch (err) {
      console.error(` -> Lỗi sinh nhóm ${topic.category}:`, err.message)
    }
  }

  console.log(`\n Tổng số mẫu thu thập được: ${allSamples.length}`)

  // Deduplicate by text
  const uniqueSamples = []
  const seen = new Set()
  for (const s of allSamples) {
    const norm = s.text.trim().toLowerCase()
    if (!seen.has(norm)) {
      seen.add(norm)
      uniqueSamples.push(s)
    }
  }

  // Shuffle
  uniqueSamples.sort(() => Math.random() - 0.5)

  // Split Train / Val (90% / 10%)
  const splitIdx = Math.floor(uniqueSamples.length * 0.9)
  const trainSet = uniqueSamples.slice(0, splitIdx)
  const valSet = uniqueSamples.slice(splitIdx)

  const trainPath = path.join(DATASET_DIR, 'trung_sinh_laya_train.jsonl')
  const valPath = path.join(DATASET_DIR, 'trung_sinh_laya_val.jsonl')
  const allPath = path.join(DATASET_DIR, 'trung_sinh_laya_all.json')

  fs.writeFileSync(trainPath, trainSet.map(x => JSON.stringify(x)).join('\n'), 'utf-8')
  fs.writeFileSync(valPath, valSet.map(x => JSON.stringify(x)).join('\n'), 'utf-8')
  fs.writeFileSync(allPath, JSON.stringify(uniqueSamples, null, 2), 'utf-8')

  console.log(` Đã lưu tập Train (${trainSet.length} mẫu) tại: ${trainPath}`)
  console.log(` Đã lưu tập Val (${valSet.length} mẫu) tại: ${valPath}`)
  console.log(` Đã lưu tập All JSON (${uniqueSamples.length} mẫu) tại: ${allPath}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
