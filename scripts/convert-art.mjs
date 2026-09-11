import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

/**
 * One-shot art pipeline for issue #16: shrink 472MB of oversized PNGs to
 * display-sized WebP. Source art is authored at 1024–1672px but rendered at
 * 42–68px (items/talents/icons), ~68×80 (NPCs), ~205 (player), ~580 (scene).
 * We resize to 2× the largest on-screen box (crisp on HiDPI), WebP-encode, and
 * remove the source PNG so the tree tracks only what ships.
 *
 * The `--dry` flag reports the projected footprint without touching files.
 */

const ART_ROOT = 'src/assets/art'

// Max source edge kept, 2× the largest rendered box per surface.
const MAX_EDGE = {
  items: 400, // inventory thumb (42px) + large inspector (~180px tall)
  talents: 128, // rpg-entry (42×46) + codex (48×54)
  'location-icons': 128, // map exit pin + legend
  locations: 640, // full world-map / scene backdrop (~580px)
  npcs: 176, // portrait card 68×80
  player: 440, // player-action-art ~205px tall, contain
  root: 900, // combined banners: still-life, ensemble, world-map, portrait
}

const WEBP_OPTS = { quality: 80, effort: 6, alphaQuality: 82 }

function listPng(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .map((f) => path.join(dir, f))
}

async function convertOne(inputPath, edge, dry) {
  const outPath = inputPath.replace(/\.png$/i, '.webp')
  const inSize = fs.statSync(inputPath).size
  if (!dry) {
    await sharp(inputPath)
      .resize(edge, edge, { fit: 'inside', withoutEnlargement: true })
      .webp(WEBP_OPTS)
      .toFile(outPath)
    fs.rmSync(inputPath)
  }
  const outSize = dry ? Math.round(inSize * 0.035) : fs.statSync(outPath).size
  return { outPath, inSize, outSize }
}

async function main() {
  const dry = process.argv.includes('--dry')
  let totalIn = 0
  let totalOut = 0
  let n = 0

  // Flat root-level PNGs (combined banners, portraits, world map).
  for (const file of listPng(ART_ROOT)) {
    const { inSize, outSize } = await convertOne(file, MAX_EDGE.root, dry)
    totalIn += inSize
    totalOut += outSize
    n++
  }

  // Per-category subfolders.
  for (const cat of fs.readdirSync(ART_ROOT)) {
    const catPath = path.join(ART_ROOT, cat)
    if (!fs.statSync(catPath).isDirectory()) continue
    const edge = MAX_EDGE[cat] ?? MAX_EDGE.root
    for (const file of listPng(catPath)) {
      const { inSize, outSize } = await convertOne(file, edge, dry)
      totalIn += inSize
      totalOut += outSize
      n++
    }
  }

  const mb = (x) => (x / 1e6).toFixed(2)
  console.log(`${dry ? '[dry] ' : ''}${n} files`)
  console.log(`in:     ${mb(totalIn)} MB`)
  console.log(`out:    ${mb(totalOut)} MB`)
  console.log(`target: ${mb(totalOut) < 20 ? 'PASS (<20MB)' : 'FAIL (>=20MB)'}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
