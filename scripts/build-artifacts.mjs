import { readdir, mkdir, writeFile } from 'node:fs/promises'
import { join, relative, dirname, parse } from 'node:path'
import sharp from 'sharp'

const SRC = 'src/assets/art'
const OUT = 'src/assets/art-webp'

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(p)
    else yield p
  }
}

for await (const file of walk(SRC)) {
  if (parse(file).ext.toLowerCase() !== '.png') continue
  const out = join(OUT, relative(SRC, file)).replace(/\.png$/i, '.webp')
  await mkdir(dirname(out), { recursive: true })
  const buf = await sharp(file).webp({ quality: 80 }).toBuffer()
  await writeFile(out, buf)
  console.log('webp', relative('.', out))
}
