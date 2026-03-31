export type AiProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'github'
  | 'openai_compat'

export const aiProviderIds: readonly AiProviderId[] = [
  'openai',
  'anthropic',
  'gemini',
  'github',
  'openai_compat'
] as const

export function isAiProviderId(v: string): v is AiProviderId {
  return (aiProviderIds as readonly string[]).includes(v)
}

export type AiModelId = string

export type AiQualifiedModelId = `${AiProviderId}:${AiModelId}`

export function parseQualifiedModelId(raw: string): {
  providerId: AiProviderId
  modelId: AiModelId
} {
  const idx = raw.indexOf(':')
  if (idx <= 0 || idx >= raw.length - 1) {
    throw new Error(`Invalid model id: ${raw}`)
  }

  const providerRaw = raw.slice(0, idx)
  if (!isAiProviderId(providerRaw)) {
    throw new Error(`Invalid model id: ${raw}`)
  }
  const providerId = providerRaw
  const modelId = raw.slice(idx + 1)

  return { providerId, modelId }
}
