import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const CORE_FILES = [
  '../src/content/system-defs.ts',
  '../src/content/system-quests.ts',
  '../src/engine/system-runtime.ts',
  '../src/ai/system.ts',
  '../src/content/system-messages.ts',
  '../src/engine/system.ts',
] as const

const AUTHORED_SCENARIO_IMPORT = /\bfrom\s+['"](?:\.\.\/)+content\/(?:story|npcs|locations|endings-data|chapters|quests)['"]/u

describe('System Layer scenario containment', () => {
  it('keeps core System modules free of authored Scenario-I imports', () => {
    for (const relativePath of CORE_FILES) {
      const source = readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')
      expect(source, relativePath).not.toMatch(AUTHORED_SCENARIO_IMPORT)
    }
  })
})
