import { describe, expect, it } from 'vitest'

import { redactSensitive, redactSensitiveText } from '../../src/composables/security/redact'

describe('security redact', () => {
  it('redacts common token patterns in free-form text', () => {
    const input =
      'Authorization: Bearer gho_0123456789abcdef and key sk-0123456789abcdef plus AIzaSyDUMMYKEY123456'
    const out = redactSensitiveText(input)
    expect(out).toContain('Bearer [REDACTED]')
    expect(out).toContain('sk-[REDACTED]')
    expect(out).toContain('AIza[REDACTED]')
    expect(out).not.toContain('gho_0123456789abcdef')
    expect(out).not.toContain('sk-0123456789abcdef')
  })

  it('redacts values under sensitive keys', () => {
    const input = {
      token: 'gho_0123456789abcdef',
      nested: {
        apiKey: 'sk-0123456789abcdef'
      },
      message: 'Bearer gho_0123456789abcdef'
    }

    const out = redactSensitive(input)
    expect(out.token).toBe('[REDACTED]')
    expect(out.nested.apiKey).toBe('[REDACTED]')
    expect(out.message).toBe('Bearer [REDACTED]')
  })
})
