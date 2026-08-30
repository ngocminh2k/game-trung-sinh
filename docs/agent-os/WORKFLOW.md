# Common workflow for all coding agents

## Equivalence contract

“Equivalent” means every agent has the same required context, authority boundary, MCP capabilities, work-item lifecycle, quality bar, and handoff format. It does not require identical models, IDE integrations, or personal global settings.

## Lifecycle

1. **Orient**: read `AGENTS.md`, inspect shared work, and use the knowledge map.
2. **Claim**: make one narrow claim under `docs/agent-work/active/`. If the scope is active, coordinate through a handoff instead of editing concurrently.
3. **Plan**: state behavior, acceptance criteria, affected boundary, and the smallest verification command.
4. **Implement**: preserve unrelated work and keep changes within the claim.
5. **Verify**: run focused tests, then proportionate repository checks.
6. **Handoff or report**: archive the claim with the precise continuation context, or report completion to the user.

## Required verification

Use the narrowest command that proves the change, then add these when their surface is affected:

| Change | Required check |
| --- | --- |
| TypeScript source | `npm run typecheck` |
| Any source change | `npm run lint` and relevant `npm test -- <file-or-pattern>` |
| Build/config/dependency change | `npm run build` |
| User flow, controls, layout, or visual state | relevant `npx playwright test ...` |
| Content or game-rule change | content validation and the focused engine/content tests |

If a check is not run, say why and leave it as the next concrete action. Do not claim success from an unrun command.

## Coordination rules

- Claim IDs are stable kebab-case feature names, for example `combat-agency-copy`.
- An active claim owns only its stated scope. Other agents may review it but may not modify it without an explicit transfer.
- Handoffs must state: completed behavior, touched files, verification output/result, known risks or blockers, and one next action.
- A broken or blocked state is handoff-worthy; hiding it is not.
