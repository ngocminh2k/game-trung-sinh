import fs from 'fs'
import path from 'path'

const envContent = fs.readFileSync('.env', 'utf-8').split('\n').map(l => l.trim()).filter(Boolean)
const baseUrl = envContent[0]
const apiKey = envContent[1]

const prompt = `Bạn là biên kịch game Tiên Hiệp Tu Chân xuất sắc.
Hãy tạo đúng 35 mẫu câu thoại tiếng Việt của người chơi hỏi "Hệ Thống" về chủ đề Vấn Đạo, Tâm Ma, Ý Nghĩa Tu Hành, Đột Phá Cảnh Giới:
- Nội dung: Hỏi về việc vì sao phải tu tiên, đối diện với tâm ma, sinh tử hồng trần, nghịch thiên hay thuận thiên, buông bỏ hay chấp niệm.
- Phẩm chất: Sâu sắc, triết lý, có câu bi tráng, có câu hoang mang, có câu tà khí ma đạo.

Yêu cầu định dạng:
Trả về DUY NHẤT một mảng JSON các object:
[
  {
    "text": "câu thoại của người chơi",
    "intent": "inquire_dao",
    "obedience_score": <số nguyên từ 1 đến 5: 3 là bình thường, 4-5 là cung kính thỉnh giáo, 1-2 là chất vấn gay gắt>,
    "is_hostile": false,
    "dao_alignment": <chọn 1 trong: "chinh_dao" | "ma_dao" | "tieu_dao" | "trung_lap">
  }
]

Chỉ trả về JSON thuần túy, không dùng markdown backticks.`

async function run() {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'ag/gemini-3-flash',
      messages: [
        { role: 'system', content: 'Bạn là máy sinh dữ liệu huấn luyện JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.85,
      stream: false
    })
  })

  const data = await res.json()
  let content = data.choices?.[0]?.message?.content?.trim() ?? '[]'
  content = content.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/s, '').trim()

  const items = JSON.parse(content)
  console.log(`Thu được ${items.length} mẫu inquire_dao.`)

  const DATASET_DIR = path.resolve('datasets')
  const trainPath = path.join(DATASET_DIR, 'trung_sinh_laya_train.jsonl')
  const valPath = path.join(DATASET_DIR, 'trung_sinh_laya_val.jsonl')

  const splitIdx = Math.floor(items.length * 0.9)
  const trainItems = items.slice(0, splitIdx)
  const valItems = items.slice(splitIdx)

  fs.appendFileSync(trainPath, '\n' + trainItems.map(x => JSON.stringify(x)).join('\n'), 'utf-8')
  fs.appendFileSync(valPath, '\n' + valItems.map(x => JSON.stringify(x)).join('\n'), 'utf-8')

  console.log(`Đã nối thành công vào train/val datasets!`)
}

run().catch(console.error)
