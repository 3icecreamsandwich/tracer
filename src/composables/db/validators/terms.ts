import type { Term, Uuid } from '../types'

export type TermInput = {
  id?: string | null
  front: string
  back: string
}

export type NormalizedTerm = Term

export class TermsValidationError extends Error {
  name = 'TermsValidationError'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getStringProp(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key]
  return typeof v === 'string' ? v : undefined
}

function normalizeText(s: string) {
  return s.replaceAll('\r', '').trim()
}

export function normalizeTerms(
  input: TermInput[],
  opts?: { randomUuid?: () => string }
): NormalizedTerm[] {
  const randomUuid = opts?.randomUuid ?? (() => crypto.randomUUID())

  if (!Array.isArray(input)) throw new TermsValidationError('terms must be an array')

  const out: NormalizedTerm[] = []
  for (let i = 0; i < input.length; i++) {
    const t = input[i]
    if (!isRecord(t)) {
      throw new TermsValidationError(`term[${i}] must be an object`)
    }

    const front = normalizeText(getStringProp(t, 'front') ?? '')
    const back = normalizeText(getStringProp(t, 'back') ?? '')
    if (!front) throw new TermsValidationError(`term[${i}].front must be non-empty`)
    if (!back) throw new TermsValidationError(`term[${i}].back must be non-empty`)

    const rawId = getStringProp(t, 'id')
    const id = rawId && rawId.trim() ? rawId.trim() : randomUuid()
    out.push({ id: id as Uuid, front, back })
  }
  return out
}
