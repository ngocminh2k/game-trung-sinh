import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8').split('\n').map(l => l.trim()).filter(Boolean)
const baseUrl = envContent[0]
const apiKey = envContent[1]

console.log('Testing connection to:', baseUrl)

const res = await fetch(`${baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'ag/gemini-3-flash',
    messages: [
      { role: 'system', content: 'Bạn là chuyên gia ngôn ngữ văn học Tiên Hiệp Tu Chân.' },
      { role: 'user', content: 'Hãy viết 3 câu thoại ngắn (1 câu xin nhiệm vụ, 1 câu chửi Hệ Thống, 1 câu vấn đạo) của người chơi trong game tu tiên. Trả về định dạng JSON mảng [{ "text": "...", "intent": "..." }]. Chỉ trả về JSON thuần trong cặp ngoặc nhọn/vuông, không kèm markdown backticks.' }
    ],
    temperature: 0.7,
    stream: false
  })
})

const text = await res.text()
console.log('Response status:', res.status)
try {
  const data = JSON.parse(text)
  console.log('Content:\n', data.choices?.[0]?.message?.content)
} catch {
  console.log('Raw text:\n', text)
}
