// 10 static hosts serving dist/ on 4175..4184 — separate origins = separate
// localStorage, so bot groups never see each other's saves.
//   node scripts/playtest-hosts.mjs start   (detached, PID file)
//   node scripts/playtest-hosts.mjs stop
import { spawn, execSync } from 'node:child_process'
import { writeFileSync, readFileSync, unlinkSync } from 'node:fs'

const PIDS = 'scripts/.playtest-hosts.pids'
const BASE = 4175

if (process.argv[2] === 'stop') {
  try {
    for (const pid of readFileSync(PIDS, 'utf8').split('\n').filter(Boolean)) {
      try { process.kill(Number(pid)) } catch { /* gone */ }
    }
    unlinkSync(PIDS)
    console.log('hosts stopped')
  } catch { console.log('no pid file') }
  process.exit(0)
}

const pids = []
for (let i = 0; i < 10; i++) {
  const port = BASE + i
  const child = spawn('npx', ['vite', 'preview', '--port', String(port), '--host', '127.0.0.1', '--strictPort'], {
    detached: true, stdio: 'ignore', cwd: process.cwd(), shell: true,
  })
  pids.push(child.pid)
  child.unref()
}
writeFileSync(PIDS, pids.join('\n'))
await new Promise((res) => setTimeout(res, 4000))
let up = 0
for (let i = 0; i < 10; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${BASE + i}/`, { signal: AbortSignal.timeout(2000) })
    if (r.ok) up += 1
  } catch { /* not yet */ }
}
console.log(`hosts up: ${up}/10 on ${BASE}..${BASE + 9}`)
