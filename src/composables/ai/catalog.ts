import type { AiProviderId } from './ids'

export type AiProviderCatalogItem = {
  id: AiProviderId
  label: string
  hint: string
}

export type AiModelCatalogItem = {
  id: string
  label: string
  hint?: string
}

export const curatedProviders: AiProviderCatalogItem[] = [
  { id: 'openai', label: 'OpenAI', hint: 'BYOK' },
  { id: 'anthropic', label: 'Anthropic', hint: 'BYOK' },
  { id: 'gemini', label: 'Gemini', hint: 'BYOK' },
  { id: 'github', label: 'GitHub Models', hint: 'OAuth' },
  { id: 'openai_compat', label: 'OpenAI Compatible', hint: 'Advanced' }
]

export const curatedModelsByProvider: Record<AiProviderId, AiModelCatalogItem[]> = {
  openai: [
    { id: 'gpt-4o-mini', label: 'gpt-4o-mini' },
    { id: 'gpt-4o', label: 'gpt-4o' },
    { id: 'o3-mini', label: 'o3-mini' }
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20240620', label: 'claude-3-5-sonnet' },
    { id: 'claude-3-5-haiku-20241022', label: 'claude-3-5-haiku' }
  ],
  gemini: [
    { id: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
    { id: 'gemini-1.5-pro', label: 'gemini-1.5-pro' }
  ],
  github: [
    { id: 'openai/gpt-4.1', label: 'openai/gpt-4.1' },
    { id: 'openai/gpt-4o-mini', label: 'openai/gpt-4o-mini' },
    { id: 'openai/gpt-4o', label: 'openai/gpt-4o' }
  ],
  openai_compat: [
    { id: 'configured', label: 'Configured model', hint: 'Uses Advanced endpoint settings' }
  ]
}
