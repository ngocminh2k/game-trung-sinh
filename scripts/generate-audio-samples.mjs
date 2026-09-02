import fs from 'fs'
import path from 'path'

const SAMPLE_RATE = 44100
const AUDIO_DIR = 'src/assets/audio'

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true })
}

/**
 * Creates a valid 16-bit mono RIFF WAV buffer from Float32Array samples (-1.0 to 1.0)
 */
function encodeWAV(samples, sampleRate = SAMPLE_RATE) {
  const numSamples = samples.length
  const buffer = Buffer.alloc(44 + numSamples * 2)

  // RIFF chunk descriptor
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + numSamples * 2, 4)
  buffer.write('WAVE', 8)

  // fmt sub-chunk
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20) // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22) // NumChannels (1 = mono)
  buffer.writeUInt32LE(sampleRate, 24) // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28) // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(2, 32) // BlockAlign (NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(16, 34) // BitsPerSample

  // data sub-chunk
  buffer.write('data', 36)
  buffer.writeUInt32LE(numSamples * 2, 40)

  // Write PCM samples
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    const val = s < 0 ? s * 0x8000 : s * 0x7fff
    buffer.writeInt16LE(Math.floor(val), 44 + i * 2)
  }

  return buffer
}

function generateSamples(durationSec, fn) {
  const total = Math.floor(SAMPLE_RATE * durationSec)
  const samples = new Float32Array(total)
  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE
    samples[i] = fn(t, i, total)
  }
  return samples
}

// 1. Chuông ngọc / Khánh ngọc (Jade Chime / Bell) - Ethereal singing bowl with harmonics
const bellSamples = generateSamples(2.5, (t) => {
  const env = Math.exp(-2.5 * t)
  const f0 = 523.25 // C5
  const s =
    Math.sin(2 * Math.PI * f0 * t) * 0.6 +
    Math.sin(2 * Math.PI * f0 * 2.76 * t) * 0.25 * Math.exp(-3.5 * t) +
    Math.sin(2 * Math.PI * f0 * 5.4 * t) * 0.15 * Math.exp(-5.0 * t)
  return s * env * 0.8
})

// 2. Tu luyện (Cultivate) - Deep resonant meditative resonance with subtle harmonic pulse
const cultivateSamples = generateSamples(2.0, (t) => {
  const env = Math.sin((Math.PI * t) / 2.0) * Math.exp(-1.2 * t)
  const f0 = 220.0 // A3
  const shimmer = 1 + 0.08 * Math.sin(2 * Math.PI * 4.5 * t)
  const s =
    Math.sin(2 * Math.PI * f0 * shimmer * t) * 0.5 +
    Math.sin(2 * Math.PI * (f0 * 1.5) * t) * 0.3 * Math.exp(-1.8 * t) +
    Math.sin(2 * Math.PI * (f0 * 2.0) * t) * 0.2 * Math.exp(-2.2 * t)
  return s * env * 0.85
})

// 3. Đột phá cảnh giới (Breakthrough) - Ascending pentatonic chord fanfare (C-E-G-A-C)
const breakthroughSamples = generateSamples(3.0, (t) => {
  const notes = [261.63, 329.63, 392.0, 440.0, 523.25, 659.25]
  let sum = 0
  notes.forEach((freq, idx) => {
    const delay = idx * 0.12
    if (t >= delay) {
      const localT = t - delay
      const env = Math.exp(-2.0 * localT)
      sum += Math.sin(2 * Math.PI * freq * localT) * env * 0.25
    }
  })
  return sum * 0.9
})

// 4. Kiếm khí chém (Sword Strike) - Sharp whoosh + bright metallic chime
const swordStrikeSamples = generateSamples(0.6, (t) => {
  const env = Math.exp(-10 * t)
  const noise = (Math.random() * 2 - 1) * Math.exp(-15 * t) * 0.4
  const tone = Math.sin(2 * Math.PI * (1200 - 800 * t) * t) * 0.6
  return (tone + noise) * env * 0.85
})

// 5. Đỡ đòn / Phòng ngự (Sword Defend) - Resonant metal clash with ring-out
const swordDefendSamples = generateSamples(1.0, (t) => {
  const env = Math.exp(-5 * t)
  const f1 = 880
  const f2 = 1320
  const tone =
    Math.sin(2 * Math.PI * f1 * t) * 0.5 +
    Math.sin(2 * Math.PI * f2 * t) * 0.3 +
    (Math.random() * 2 - 1) * Math.exp(-30 * t) * 0.2
  return tone * env * 0.8
})

// 6. Đóng triện son / Thành tựu (Stamp / Seal) - Wooden thud + jade shimmer
const stampSamples = generateSamples(0.8, (t) => {
  const thud = Math.sin(2 * Math.PI * 90 * Math.exp(-20 * t) * t) * Math.exp(-12 * t) * 0.8
  const jade = Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-8 * t) * 0.3
  return (thud + jade) * 0.9
})

// 7. Nuốt đan dược (Pill Ingestion) - Bubbling chi resonance
const pillSamples = generateSamples(0.6, (t) => {
  const env = Math.exp(-6 * t)
  const freq = 440 + 200 * Math.sin(2 * Math.PI * 15 * t)
  return Math.sin(2 * Math.PI * freq * t) * env * 0.75
})

// 8. Lật trang sách / Giấy Tuyên Thành (Page Turn) - Textured paper rustle
const pageTurnSamples = generateSamples(0.4, (t) => {
  const env = Math.sin((Math.PI * t) / 0.4) * Math.exp(-4 * t)
  const noise = (Math.random() * 2 - 1) * 0.6
  const lowFilter = Math.sin(2 * Math.PI * 300 * t) * 0.3
  return (noise + lowFilter) * env * 0.65
})

// 9. Bước chân (Footstep) - Soft earthen/grass step
const stepSamples = generateSamples(0.25, (t) => {
  const env = Math.exp(-18 * t)
  const lowThump = Math.sin(2 * Math.PI * 80 * t) * 0.5
  const brushNoise = (Math.random() * 2 - 1) * 0.4
  return (lowThump + brushNoise) * env * 0.6
})

// 10. Sấm sét (Thunder) - Deep rumble and electric crackle
const thunderSamples = generateSamples(2.2, (t) => {
  const env = Math.exp(-1.5 * t)
  const rumble = Math.sin(2 * Math.PI * (55 + 10 * Math.sin(10 * t)) * t) * 0.6
  const crackle = (Math.random() * 2 - 1) * Math.exp(-8 * t) * 0.4
  return (rumble + crackle) * env * 0.9
})

const audioFiles = [
  { name: 'bell.wav', data: bellSamples },
  { name: 'cultivate.wav', data: cultivateSamples },
  { name: 'breakthrough.wav', data: breakthroughSamples },
  { name: 'sword-strike.wav', data: swordStrikeSamples },
  { name: 'sword-defend.wav', data: swordDefendSamples },
  { name: 'stamp.wav', data: stampSamples },
  { name: 'pill.wav', data: pillSamples },
  { name: 'page-turn.wav', data: pageTurnSamples },
  { name: 'step.wav', data: stepSamples },
  { name: 'thunder.wav', data: thunderSamples },
]

for (const f of audioFiles) {
  const outPath = path.join(AUDIO_DIR, f.name)
  const wavBuf = encodeWAV(f.data)
  fs.writeFileSync(outPath, wavBuf)
  console.log(`Generated: ${outPath} (${wavBuf.length} bytes)`)
}

console.log('All 10 audio assets generated successfully!')
