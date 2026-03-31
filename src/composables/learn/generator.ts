import type { Term, Uuid } from '../db/types'

export type LearnTrueFalseQuestion = {
  id: string
  kind: 'true_false'
  prompt: string
  answer: boolean
  termId: Uuid
}

export type LearnMultipleChoiceQuestion = {
  id: string
  kind: 'multiple_choice'
  prompt: string
  options: string[]
  answerIndex: number
  termId: Uuid
}

export type LearnQuestion = LearnTrueFalseQuestion | LearnMultipleChoiceQuestion

export type LearnGeneratorOptions = {
  seed: number
  maxQuestions?: number
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

function clampMaxQuestions(v: number | undefined) {
  if (v === undefined) return 40
  const n = Math.floor(v)
  if (!Number.isFinite(n)) return 40
  return Math.min(Math.max(n, 1), 200)
}

function normalizeCell(s: string) {
  return String(s ?? '').replace(/\s+/g, ' ').trim()
}

function formatTfPrompt(front: string, back: string) {
  return `True or False: "${front}" means "${back}".`
}

function formatMcPrompt(front: string) {
  return `What is the definition of "${front}"?`
}

function uniqueBy<T>(items: T[], key: (t: T) => string) {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of items) {
    const k = key(item)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
}

export function generateLearnQuestions(terms: Term[], options: LearnGeneratorOptions): LearnQuestion[] {
  const seed = Number.isFinite(options.seed) ? Math.floor(options.seed) : 1
  const maxQuestions = clampMaxQuestions(options.maxQuestions)
  const rand = makePrng(seed)

  const normalizedTerms = terms
    .map((t) => ({ ...t, front: normalizeCell(t.front), back: normalizeCell(t.back) }))
    .filter((t) => t.id && t.front && t.back)

  if (normalizedTerms.length === 0) return []

  const poolById = new Map<Uuid, { id: Uuid; front: string; back: string }>()
  for (const t of normalizedTerms) poolById.set(t.id as Uuid, t as any)

  const uniqueBackTerms = uniqueBy(normalizedTerms, (t) => t.back)

  const questions: LearnQuestion[] = []

  for (const t of normalizedTerms) {
    const truth = rand() < 0.5

    let shownBack = t.back
    let backSourceId: string = t.id
    let answer = true

    if (!truth) {
      const candidates = uniqueBackTerms.filter((x) => x.id !== t.id && x.back !== t.back)
      if (candidates.length > 0) {
        const wrong = candidates[Math.floor(rand() * candidates.length)]!
        shownBack = wrong.back
        backSourceId = wrong.id
        answer = false
      } else {
        shownBack = t.back
        backSourceId = t.id
        answer = true
      }
    }

    questions.push({
      id: `tf:${t.id}:${answer ? 't' : 'f'}:${backSourceId}`,
      kind: 'true_false',
      prompt: formatTfPrompt(t.front, shownBack),
      answer,
      termId: t.id as Uuid
    })

    const distractorCandidates = uniqueBackTerms
      .filter((x) => x.id !== t.id && x.back !== t.back)
      .map((x) => x.back)

    if (distractorCandidates.length >= 3) {
      const shuffled = shuffle(distractorCandidates, rand)
      const distractors = shuffled.slice(0, 3)
      const rawOptions = [t.back, ...distractors]
      const options = shuffle(rawOptions, rand)
      const answerIndex = options.indexOf(t.back)
      const unique = new Set(options)

      if (unique.size === options.length && answerIndex >= 0) {
        questions.push({
          id: `mc:${t.id}`,
          kind: 'multiple_choice',
          prompt: formatMcPrompt(t.front),
          options,
          answerIndex,
          termId: t.id as Uuid
        })
      }
    }
  }

  const mixed = shuffle(questions, rand)
  return mixed.slice(0, Math.min(maxQuestions, mixed.length))
}
