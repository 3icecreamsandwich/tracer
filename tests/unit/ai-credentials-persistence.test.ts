import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tauri-apps/api/core', () => {
  return {
    invoke: vi.fn(async () => null)
  }
})

vi.mock('../../src/composables/tauri', () => {
  return {
    hasTauriRuntime: () => true
  }
})

describe('aiOpenAiCompatSetConfig invoke payload', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.VITE_TRACER_FORCE_WEB
  })

  it('passes nested args payload for ai_openai_compat_set_config', async () => {
    const { aiOpenAiCompatSetConfig } = await import('../../src/composables/ai/credentials')
    const { invoke } = await import('@tauri-apps/api/core')
    const invokeMock = vi.mocked(invoke)
    invokeMock.mockResolvedValue(null as any)

    await aiOpenAiCompatSetConfig({ baseURL: ' https://example.com/v1 ', modelId: '  model-x  ' })

    expect(invokeMock).toHaveBeenCalledWith('ai_openai_compat_set_config', {
      args: {
        configJson: JSON.stringify({ baseURL: 'https://example.com/v1', modelId: 'model-x' })
      }
    })
  })
})
