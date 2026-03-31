import { describe, expect, it } from 'vitest'
import { generateLearnQuestions } from '../../src/composables/learn/generator'
import type { Term } from '../../src/composables/db/types'

function makeTerms(count: number): Term[] {
  const out: Term[] = []
  for (let i = 0; i < count; i += 1) {
    out.push({
      id: `t-${i + 1}`,
      front: `Term ${i + 1}`,
      back: `Definition ${i + 1}`
    })
  }
  return out
}

describe('generateLearnQuestions', () => {
  it('returns stable bounds and is deterministic for the same seed', () => {
    const terms = makeTerms(10)
    const a = generateLearnQuestions(terms, { seed: 123, maxQuestions: 40 })
    const b = generateLearnQuestions(terms, { seed: 123, maxQuestions: 40 })

    expect(a.length).toBeGreaterThan(0)
    expect(a.length).toBeLessThanOrEqual(40)
    expect(a).toEqual(b)
  })

  it('multiple choice questions have 4 unique options with a valid answerIndex', () => {
    const terms = makeTerms(12)
    const q = generateLearnQuestions(terms, { seed: 7, maxQuestions: 200 })
    const mc = q.filter((x) => x.kind === 'multiple_choice')
    expect(mc.length).toBeGreaterThan(0)

    for (const item of mc) {
      const options = item.options
      expect(options).toHaveLength(4)
      expect(new Set(options).size).toBe(4)
      expect(item.answerIndex).toBeGreaterThanOrEqual(0)
      expect(item.answerIndex).toBeLessThan(4)
    }
  })
})
