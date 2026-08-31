# Bounded agent queue

`docs/agent-work/queue.json` is the approved work queue. It prevents a background agent from inventing a new task after it finishes or from staying interactive while waiting for instructions.

## Rules

1. A queue job has one scope, explicit acceptance criteria, verification commands, and a hard timeout.
2. Run only one job at a time unless their file scopes are disjoint and a human explicitly approves parallel dispatch.
3. A worker has no interactive supervisor. It must either meet the acceptance criteria or hand off the blocker before it exits.
4. An exited process is not success. Read its state file, output log, active claim, and handoff before marking a job accepted.
5. A dependent job remains queued until its dependency has a reviewed handoff; the runner never guesses that an exit code means product success.

## Commands

```powershell
npm run agent:queue -- status
npm run agent:queue -- run phase4-story-proof-review
```

`run` is a foreground one-shot process. Launch it through a hidden terminal only when deliberately running unattended; it enforces the job's timeout and writes state/log files under `artifacts/agent-queue/`.

The runner uses `agy --new-project` because Antigravity otherwise opens its scratch/default project rather than this repository. Override the executable with `AGY_COMMAND` when necessary.
