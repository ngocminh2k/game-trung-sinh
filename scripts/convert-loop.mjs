// Re-run convert-fake-png every 5 minutes until stopped.
// Also stops when 20 consecutive passes convert nothing (idle).
import { execSync } from 'node:child_process'

let idleRuns = 0
for (;;) {
  try {
    const out = execSync('node scripts/convert-fake-png.mjs', { encoding: 'utf8' })
    const m = out.match(/converted=(\d+)/)
    const converted = m ? Number(m[1]) : 0
    process.stdout.write(out)
    if (converted === 0) idleRuns++
    else idleRuns = 0
    if (idleRuns >= 20) { console.log('[monitor] 20 idle passes — stopping'); break }
  } catch (e) {
    console.error('[monitor] error: ' + e.message)
    idleRuns++
  }
  await new Promise((r) => setTimeout(r, 5 * 60 * 1000))
}
