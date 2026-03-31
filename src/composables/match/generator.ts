import type { Term, Uuid } from '../db/types'

export type MatchTile = {
  id: string
  kind: 'term' | 'definition'
  pairId: Uuid
  text: string
}

export type MatchGeneratorOptions = {
  seed: number
  pairCount?: number
}

function makePrng(seed: number) {
  let x = (seed | 0) || 1
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return (x >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rand: () => number) {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]!
    a[j] = tmp!
  }
  return a
}

function clampPairCount(v: number | undefined) {
  if (v === undefined) return 8
  const n = Math.floor(v)
  if (!Number.isFinite(n)) return 8
  return Math.min(Math.max(n, 1), 50)
}

function normalizeCell(s: string) {
  return String(s ?? '').trim()
}

export function generateMatchTiles(terms: Term[], options: MatchGeneratorOptions): MatchTile[] {
  const seed = Number.isFinite(options.seed) ? Math.floor(options.seed) : 1
  const pairCount = clampPairCount(options.pairCount)
  const rand = makePrng(seed)

  const normalized = terms
    .map((t) => ({ ...t, front: normalizeCell(t.front), back: normalizeCell(t.back) }))
    .filter((t) => t.id && t.front && t.back)

  if (normalized.length === 0) return []

  const chosen = shuffle(normalized, rand).slice(0, Math.min(pairCount, normalized.length))

  const tiles: MatchTile[] = []
  for (const t of chosen) {
    const pairId = t.id as Uuid
    tiles.push({ id: `term:${pairId}`, kind: 'term', pairId, text: t.front })
    tiles.push({ id: `def:${pairId}`, kind: 'definition', pairId, text: t.back })
  }

  return shuffle(tiles, rand)
}
