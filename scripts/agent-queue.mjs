import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const [command, jobId] = process.argv.slice(2)
const queuePath = path.join(root, 'docs', 'agent-work', 'queue.json')
const runtimeDirectory = path.join(root, 'artifacts', 'agent-queue')

function fail(message) {
  console.error(`agent-queue: ${message}`)
  process.exitCode = 1
}

async function loadQueue() {
  return JSON.parse(await readFile(queuePath, 'utf8'))
}

function statePath(id) {
  return path.join(runtimeDirectory, `${id}.json`)
}

function activeClaimPath(id) {
  return path.join(root, 'docs', 'agent-work', 'active', `${id}.md`)
}

function agyCommand() {
  if (process.env.AGY_COMMAND) return process.env.AGY_COMMAND
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    return path.join(process.env.LOCALAPPDATA, 'agy', 'bin', 'agy.exe')
  }
  return 'agy'
}

async function writeState(id, value) {
  await mkdir(runtimeDirectory, { recursive: true })
  await writeFile(statePath(id), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function status() {
  const queue = await loadQueue()
  const rows = await Promise.all(queue.jobs.map(async (job) => {
    let runtime = null
    if (existsSync(statePath(job.id))) runtime = JSON.parse(await readFile(statePath(job.id), 'utf8'))
    return {
      id: job.id,
      planned: job.status,
      runtime: runtime?.status ?? 'not-started',
      activeClaim: existsSync(activeClaimPath(job.id)),
      finishedAt: runtime?.finishedAt ?? null,
    }
  }))
  console.log(JSON.stringify(rows, null, 2))
}

function taskPrompt(job, timeoutMinutes) {
  const acceptance = job.acceptance.map((item, index) => `${index + 1}. ${item}`).join('\n')
  const verification = job.verification.map((item) => `- ${item}`).join('\n')
  return `You are the one-shot worker for queue job ${job.id}. This is not interactive: do not ask a parent for clarification and do not wait for another message. Work for at most ${Math.max(timeoutMinutes - 3, 1)} minutes, reserving the rest for verification and a handoff.\n\nRead AGENTS.md, docs/agent-os/KNOWLEDGE.md, docs/agent-os/WORKFLOW.md, docs/agent-os/QUEUE.md, docs/agent-work/queue.json, and the relevant prior handoff before editing. Preserve all unrelated dirty changes. Do not use git reset, git clean, force push, delete unrelated files, change secrets, commit, or push.\n\nExclusive scope: ${job.scope}\nObjective: ${job.objective}\n\nAcceptance criteria:\n${acceptance}\n\nVerification:\n${verification}\n\nClaim this job with npm run agent:claim before editing. If acceptance cannot be met, run npm run agent:handoff with the exact failure, commands run, risks, and one next action. If it can be met, run the same handoff with proof. Exit after the handoff; do not start a new task. If subagents are available, use them only for strictly disjoint read-only analysis.`
}

async function run(id) {
  const queue = await loadQueue()
  const job = queue.jobs.find((entry) => entry.id === id)
  if (!job) return fail(`unknown job: ${id}`)
  if (existsSync(activeClaimPath(id))) return fail(`an active claim already exists for ${id}`)
  const dependencies = job.dependsOn ?? []
  for (const dependency of dependencies) {
    if (!existsSync(statePath(dependency))) return fail(`dependency has no runtime record: ${dependency}`)
  }

  const timeoutMinutes = job.timeoutMinutes ?? queue.defaults.timeoutMinutes
  const executable = agyCommand()
  if (path.isAbsolute(executable) && !existsSync(executable)) return fail(`Antigravity executable not found: ${executable}`)
  const startedAt = new Date().toISOString()
  const outPath = path.join(runtimeDirectory, `${id}.out.log`)
  const errPath = path.join(runtimeDirectory, `${id}.err.log`)
  const prompt = taskPrompt(job, timeoutMinutes)
  await writeState(id, { id, status: 'running', startedAt, timeoutMinutes, executable, outPath, errPath })

  const child = spawn(executable, [
    '--new-project',
    '--dangerously-skip-permissions',
    '--mode', 'accept-edits',
    '--effort', 'high',
    '--print-timeout', `${timeoutMinutes}m`,
    '--print',
    prompt,
  ], { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  const out = createWriteStream(outPath, { flags: 'a' })
  const err = createWriteStream(errPath, { flags: 'a' })
  child.stdout.pipe(out)
  child.stderr.pipe(err)
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    child.kill()
  }, timeoutMinutes * 60_000)

  child.on('error', async (error) => {
    clearTimeout(timer)
    out.end()
    err.end()
    await writeState(id, { id, status: 'failed-to-start', startedAt, finishedAt: new Date().toISOString(), error: error.message, outPath, errPath })
    fail(error.message)
  })
  child.on('close', async (code, signal) => {
    clearTimeout(timer)
    out.end()
    err.end()
    await writeState(id, {
      id,
      status: timedOut ? 'timed-out' : code === 0 ? 'exited-awaiting-review' : 'failed',
      startedAt,
      finishedAt: new Date().toISOString(),
      exitCode: code,
      signal,
      outPath,
      errPath,
      activeClaim: existsSync(activeClaimPath(id)),
    })
    console.log(`agent-queue: ${id} ${timedOut ? 'timed out' : `exited with ${code}`}; review its state and handoff.`)
  })
}

if (command === 'status') await status()
else if (command === 'run' && jobId) await run(jobId)
else fail('use: status | run <job-id>')
