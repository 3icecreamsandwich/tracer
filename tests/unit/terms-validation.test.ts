import { describe, expect, it } from 'vitest'
import {
  normalizeTerms,
  TermsValidationError
} from '../../src/composables/db/validators/terms'

describe('normalizeTerms', () => {
  it('normalizes front/back, ensures non-empty, and generates id when missing', () => {
    const ids = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222']
    let idx = 0
    const randomUuid = () => ids[idx++]!

    const out = normalizeTerms(
      [
        { front: '  hello  ', back: ' world ' },
        { id: 'custom-id', front: 'x', back: 'y' },
        { front: 'a', back: 'b' }
      ],
      { randomUuid }
    )

    expect(out).toEqual([
      { id: ids[0], front: 'hello', back: 'world' },
      { id: 'custom-id', front: 'x', back: 'y' },
      { id: ids[1], front: 'a', back: 'b' }
    ])
  })

  it('rejects empty front', () => {
    expect(() => normalizeTerms([{ front: '  ', back: 'x' }])).toThrow(TermsValidationError)
  })

  it('rejects empty back', () => {
    expect(() => normalizeTerms([{ front: 'x', back: '' }])).toThrow(TermsValidationError)
  })
})
