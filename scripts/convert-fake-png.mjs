// Detect and convert JPEG files mislabeled as .png in src/assets/art/
// Safe to re-run: skips already-real PNGs.
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ART = path.join(ROOT, 'src/assets/art')
const JPEG_SIG = 'ffd8ff'

let converted = 0
let skipped = 0
let errors = 0
const errs = []

function walk(dir) {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p))
    else if (e.isFile() && p.toLowerCase().endsWith('.png')) out.push(p)
  }
  return out
}

const files = walk(ART)
for (const p of files) {
  let buf
  try { buf = fs.readFileSync(p) } catch (e) { errors++; errs.push(`${p}: ${e.message}`); continue }
  const sig = buf.slice(0, 3).toString('hex')
  if (sig !== JPEG_SIG) { skipped++; continue }
  try {
    const png = await sharp(buf).toFormat('png').toBuffer()
    fs.writeFileSync(p, png)
    converted++
  } catch (e) {
    errors++; errs.push(`${p}: ${e.message}`)
  }
}

const ts = new Date().toISOString().replace('T', ' ').slice(0, 19)
console.log(`[${ts}] files=${files.length} converted=${converted} skipped=${skipped} errors=${errors}`)
if (errs.length) for (const e of errs) console.log('  ERR ' + e)
