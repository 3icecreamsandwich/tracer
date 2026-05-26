import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  aiSecretsGet: vi.fn(async () => null as string | null),
  aiSecretsSet: vi.fn(async () => undefined),
  aiOpenAiCompatGetConfig: vi.fn(async () => null),
  aiHttpFetch: vi.fn()
}))

vi.mock('../../src/composables/ai/credentials', () => {
  return {
    aiSecretsGet: mocks.aiSecretsGet,
    aiSecretsSet: mocks.aiSecretsSet,
    aiOpenAiCompatGetConfig: mocks.aiOpenAiCompatGetConfig,
    VaultSecretError: class VaultSecretError extends Error {
      readonly code: string
      constructor(code: string, message: string) {
        super(message)
        this.code = code
      }
    }
  }
})

vi.mock('../../src/composables/ai/http', () => ({
  aiHttpFetch: mocks.aiHttpFetch
}))

import { resolveAiModel } from '../../src/composables/ai/registry'
import { AiRegistryError, MissingAiCredentialError } from '../../src/composables/ai/errors'

describe('ai registry', () => {
  beforeEach(() => {
    delete process.env.TRACER_TEST_MODE
    delete process.env.TRACER_LIVE_AI
    mocks.aiSecretsGet.mockReset()
    mocks.aiSecretsGet.mockResolvedValue(null)
    mocks.aiSecretsSet.mockReset()
    mocks.aiSecretsSet.mockResolvedValue(undefined)
    mocks.aiOpenAiCompatGetConfig.mockReset()
    mocks.aiOpenAiCompatGetConfig.mockResolvedValue(null)
    mocks.aiHttpFetch.mockReset()
  })

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

  it('sends GitHub Models chat requests to the inference endpoint', async () => {
    let requestUrl = ''
    mocks.aiSecretsGet.mockImplementation(async (kind: string) => {
      if (kind === 'github_models_token') return 'github-token'
      return null
    })
    mocks.aiHttpFetch.mockImplementation(async (input: RequestInfo | URL) => {
      requestUrl = String(input)
      return new Response(
        JSON.stringify({
          id: 'chatcmpl-test',
          object: 'chat.completion',
          created: 0,
          model: 'openai/gpt-4o-mini',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'ok' },
              finish_reason: 'stop'
            }
          ]
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    })

    const model: any = await resolveAiModel('github:openai/gpt-4o-mini')
    await model.doGenerate({
      prompt: [{ role: 'user', content: [{ type: 'text', text: 'hello' }] }]
    })

    expect(requestUrl).toBe('https://models.github.ai/inference/chat/completions')
  })
})
