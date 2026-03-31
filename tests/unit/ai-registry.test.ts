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

import { resolveAiModel } from '../../src/composables/ai/registry'
import { AiRegistryError, MissingAiCredentialError } from '../../src/composables/ai/errors'

describe('ai registry', () => {
  it('rejects invalid qualified model ids', async () => {
    await expect(resolveAiModel('nope')).rejects.toBeInstanceOf(AiRegistryError)
    await expect(resolveAiModel('nope')).rejects.toMatchObject({ code: 'invalid_model_id' })
  })

  it('rejects unknown provider ids', async () => {
    await expect(resolveAiModel('wat:model')).rejects.toBeInstanceOf(AiRegistryError)
    await expect(resolveAiModel('wat:model')).rejects.toMatchObject({ code: 'invalid_model_id' })
  })

  it('returns missing credential error when secret absent', async () => {
    await expect(resolveAiModel('openai:gpt-4o-mini')).rejects.toBeInstanceOf(MissingAiCredentialError)
    await expect(resolveAiModel('openai:gpt-4o-mini')).rejects.toMatchObject({
      code: 'missing_credential',
      providerId: 'openai',
      credentialKind: 'openai_api_key'
    })
  })
})
