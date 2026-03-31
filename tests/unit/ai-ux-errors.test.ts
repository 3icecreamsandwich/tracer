import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/composables/ai/credentials', () => {
  return {
    aiSecretsGet: vi.fn(async () => null),
    aiSecretsSet: vi.fn(async () => undefined),
    aiOpenAiCompatGetConfig: vi.fn(async () => null),
    VaultSecretError: class VaultSecretError extends Error {
      readonly code: string
      constructor(code: string, message: string) {
        super(message)
        this.code = code
      }
    }
  }
})

import { normalizeAiError } from '../../src/composables/ai/ux-errors'
import { MissingAiCredentialError } from '../../src/composables/ai/errors'
import { TsvParseError } from '../../src/composables/db/validators'

describe('ai ux errors', () => {
  it('maps missing github token to oauth_not_authenticated', () => {
    const err = new MissingAiCredentialError('github', 'github_models_token', 'Missing credentials')
    const out = normalizeAiError(err)
    expect(out.key).toBe('oauth_not_authenticated')
    expect(out.showGoToSettings).toBe(true)
  })

  it('maps TSV parse error to parse_error_tsv', () => {
    const out = normalizeAiError(new TsvParseError('line 1 must contain a tab separator'))
    expect(out.key).toBe('parse_error_tsv')
    expect(out.showGoToSettings).toBe(false)
  })

  it('maps offline fetch failures to network_offline', () => {
    const original = globalThis.navigator
    try {
      Object.defineProperty(globalThis, 'navigator', {
        value: { onLine: false },
        configurable: true
      })
      const out = normalizeAiError(new Error('Failed to fetch'))
      expect(out.key).toBe('network_offline')
    } finally {
      Object.defineProperty(globalThis, 'navigator', {
        value: original,
        configurable: true
      })
    }
  })

  it('maps provider 429 to provider_rate_limited', () => {
    const e: any = new Error('Too Many Requests')
    e.status = 429
    const out = normalizeAiError(e)
    expect(out.key).toBe('provider_rate_limited')
  })

  it('redacts sensitive tokens from provider_error messages', () => {
    const out = normalizeAiError(
      new Error('request failed: Authorization: Bearer gho_0123456789abcdef; sk-0123456789abcdef')
    )
    expect(out.key).toBe('provider_error')
    expect(out.message).toContain('[REDACTED]')
    expect(out.message).not.toContain('gho_0123456789abcdef')
    expect(out.message).not.toContain('sk-0123456789abcdef')
  })
})
