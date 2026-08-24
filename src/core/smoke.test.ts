import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// Toolchain wiring check: TypeScript + Vitest + Zod all resolve through one import.
const RealmName = z.string().min(1)

describe('scaffold', () => {
  it('parses a realm name with zod', () => {
    expect(RealmName.parse('Luyện Khí')).toBe('Luyện Khí')
    expect(() => RealmName.parse('')).toThrow()
  })
})
