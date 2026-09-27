# Active claim: laya-onnx-system-integration

- Owner: codex
- Claimed: 2026-09-21T15:43:25.509Z
- Objective: Export Laya model to ONNX, implement lazy loading on-demand inference client, wire into src/ai/system.ts with zero boot lag
- Scope: src/ai
- Acceptance criteria: _record before implementation_
- Verification plan: _record before implementation_

## Handoff

- From: codex
- To: human
- Handed off: 2026-09-21T15:54:06.999Z
- Completed or current state: Exported Laya model to ONNX with graph fusion and optimization, extracted compact vocab, implemented zero-lag lazy loading Laya ONNX client with instant fallback, and wired directly into system.ts
- Touched files: src/ai/laya-onnx-client.ts, src/ai/laya-tokenizer.ts, src/ai/jev-client.ts, src/ai/system.ts, test/ai-laya-onnx.test.ts, test/laya-tokenizer.test.ts, scripts/export_onnx.py
- Verification: npm test: 154/154 passed, npm run typecheck: 0 errors, npm run build: 6.41s
- Known risks or blockers: none
- Next action: ready to test live in UI or merge
