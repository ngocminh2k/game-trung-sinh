import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const command = args.shift();

function fail(message) {
  console.error(`agent-os: ${message}`);
  process.exitCode = 1;
}

function arg(name) {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
}

function safeId(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function mustRead(relativePath) {
  const target = path.join(root, relativePath);
  if (!existsSync(target)) throw new Error(`missing ${relativePath}`);
  return readFile(target, 'utf8');
}

async function check() {
  const required = [
    'AGENTS.md',
    'CLAUDE.md',
    '.clinerules/00-agent-os.md',
    '.mcp.json',
    'agents/mcp/registry.json',
    'agents/mcp/adapters/codex.config.toml',
    'agents/mcp/adapters/cline_mcp_settings.json',
    'docs/agent-os/KNOWLEDGE.md',
    'docs/agent-os/WORKFLOW.md',
    'docs/agent-os/MCP.md',
    'docs/agent-os/QUEUE.md',
    'docs/agent-work/queue.json',
    'scripts/agent-queue.mjs',
    'opencode.json',
  ];

  try {
    await Promise.all(required.map(mustRead));
    const [claude, cline, claudeMcp, registry, codexAdapter, clineAdapter, opencode] = await Promise.all([
      mustRead('CLAUDE.md'),
      mustRead('.clinerules/00-agent-os.md'),
      mustRead('.mcp.json'),
      mustRead('agents/mcp/registry.json'),
      mustRead('agents/mcp/adapters/codex.config.toml'),
      mustRead('agents/mcp/adapters/cline_mcp_settings.json'),
      mustRead('opencode.json'),
    ]);
    const parsedRegistry = JSON.parse(registry);
    const parsedClaudeMcp = JSON.parse(claudeMcp);
    const parsedClineAdapter = JSON.parse(clineAdapter);
    const parsedOpenCode = JSON.parse(opencode);

    if (!claude.includes('AGENTS.md') || !cline.includes('AGENTS.md')) throw new Error('tool bridge must point to AGENTS.md');
    if (!parsedRegistry.servers?.['codebase-memory']) throw new Error('registry lacks codebase-memory');
    if (!parsedClaudeMcp.mcpServers?.['codebase-memory']) throw new Error('.mcp.json lacks codebase-memory');
    if (!parsedClineAdapter.mcpServers?.['codebase-memory']) throw new Error('Cline adapter lacks codebase-memory');
    if (!codexAdapter.includes('[mcp_servers.codebase-memory]')) throw new Error('Codex adapter lacks codebase-memory');
    if (!parsedOpenCode.mcp?.['codebase-memory']) throw new Error('opencode.json lacks codebase-memory');
    if (!Array.isArray(parsedOpenCode.instructions) || !parsedOpenCode.instructions.includes('docs/agent-os/WORKFLOW.md')) {
      throw new Error('opencode.json must load the shared workflow');
    }
    console.log('agent-os: OK - shared rules, MCP registry, and tool bridges are present.');
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

async function claim() {
  const id = arg('id');
  const owner = arg('owner');
  const objective = arg('objective');
  const scope = arg('scope');
  if (!safeId(id) || !owner || !objective || !scope) return fail('claim requires --id, --owner, --objective, and --scope; id must be kebab-case.');

  const directory = path.join(root, 'docs/agent-work/active');
  const target = path.join(directory, `${id}.md`);
  if (existsSync(target)) return fail(`active claim already exists: ${path.relative(root, target)}`);
  await mkdir(directory, { recursive: true });
  const body = `# Active claim: ${id}\n\n- Owner: ${owner}\n- Claimed: ${new Date().toISOString()}\n- Objective: ${objective}\n- Scope: ${scope}\n- Acceptance criteria: _record before implementation_\n- Verification plan: _record before implementation_\n`;
  await writeFile(target, body, { encoding: 'utf8', flag: 'wx' });
  console.log(`agent-os: claimed ${id}`);
}

async function handoff() {
  const id = arg('id');
  const from = arg('from');
  const to = arg('to');
  const summary = arg('summary');
  const files = arg('files');
  const verification = arg('verification');
  const risks = arg('risks');
  const next = arg('next');
  if (!safeId(id) || !from || !to || !summary || !files || !verification || !risks || !next) {
    return fail('handoff requires --id, --from, --to, --summary, --files, --verification, --risks, and --next.');
  }

  const active = path.join(root, 'docs/agent-work/active', `${id}.md`);
  if (!existsSync(active)) return fail(`no active claim found for ${id}`);
  const existing = await readFile(active, 'utf8');
  if (!existing.includes(`- Owner: ${from}`)) return fail(`active claim is not owned by ${from}`);

  const directory = path.join(root, 'docs/agent-work/handoffs');
  await mkdir(directory, { recursive: true });
  const target = path.join(directory, `${id}-${stamp()}.md`);
  const body = `${existing}\n## Handoff\n\n- From: ${from}\n- To: ${to}\n- Handed off: ${new Date().toISOString()}\n- Completed or current state: ${summary}\n- Touched files: ${files}\n- Verification: ${verification}\n- Known risks or blockers: ${risks}\n- Next action: ${next}\n`;
  await rename(active, target);
  await writeFile(target, body, { encoding: 'utf8' });
  console.log(`agent-os: handoff recorded at ${path.relative(root, target)}`);
}

if (command === 'check') await check();
else if (command === 'claim') await claim();
else if (command === 'handoff') await handoff();
else fail('use one of: check, claim, handoff');
