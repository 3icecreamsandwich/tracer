import { describe, expect, it } from 'vitest'
import { generateMatchTiles } from '../../src/composables/match/generator'
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

describe('generateMatchTiles', () => {
  it('is deterministic for the same seed', () => {
    const terms = makeTerms(20)
    const a = generateMatchTiles(terms, { seed: 123, pairCount: 8 })
    const b = generateMatchTiles(terms, { seed: 123, pairCount: 8 })
    expect(a).toEqual(b)
  })

  it('returns 2 tiles per chosen pair, up to pairCount', () => {
    const terms = makeTerms(20)
    const tiles = generateMatchTiles(terms, { seed: 7, pairCount: 8 })
    expect(tiles).toHaveLength(16)

    const pairIds = new Set(tiles.map((t) => t.pairId))
    expect(pairIds.size).toBe(8)
    for (const id of pairIds) {
      const perPair = tiles.filter((t) => t.pairId === id)
      expect(perPair).toHaveLength(2)
      expect(new Set(perPair.map((t) => t.kind))).toEqual(new Set(['term', 'definition']))
    }
  })

  it('filters blank terms and trims text', () => {
    const tiles = generateMatchTiles(
      [
        { id: 'ok', front: '  foo ', back: ' bar  ' },
        { id: 'bad1', front: '   ', back: 'x' },
        { id: 'bad2', front: 'x', back: '' }
      ],
      { seed: 1, pairCount: 8 }
    )

    expect(tiles).toHaveLength(2)
    expect(tiles.map((t) => t.text).sort()).toEqual(['bar', 'foo'])
  })
})
