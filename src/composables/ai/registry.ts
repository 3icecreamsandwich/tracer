import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModel } from 'ai'
import { curatedModelsByProvider, curatedProviders } from './catalog'
import {
  AiRegistryError,
  AiVaultLockedError,
  MissingAiCredentialError,
  type AiCredentialKind
} from './errors'
import { aiHttpFetch } from './http'
import {
  type AiModelId,
  type AiProviderId,
  type AiQualifiedModelId,
  isAiProviderId,
  parseQualifiedModelId
} from './ids'
import {
  aiOpenAiCompatGetConfig,
  aiSecretsGet,
  aiSecretsSet,
  VaultSecretError,
  type OpenAiCompatConfig
} from './credentials'
import { isTracerLiveAiEnabled, isTracerTestMode } from './test-mode'
import { createTracerDeterministicTestModel } from './test-stub-model'

export type AiProviderModelCatalogItem = {
  id: AiModelId
  label: string
  hint?: string
}

export type AiProviderCatalogItem = {
  id: AiProviderId
  label: string
  hint: string
}

export type AiRegistryCatalog = {
  providers: AiProviderCatalogItem[]
  modelsByProvider: Record<AiProviderId, AiProviderModelCatalogItem[]>
}

const githubHeaders = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2026-03-10'
}

function mapVaultError(e: unknown): AiRegistryError {
  if (e instanceof VaultSecretError) {
    if (e.code === 'not_initialized' || e.code === 'wrong_password' || e.code === 'password_required') {
      return new AiVaultLockedError()
    }
    return new AiRegistryError('missing_provider_config', e.message)
  }
  if (e instanceof AiRegistryError) return e
  if (e instanceof Error) return new AiRegistryError('missing_provider_config', e.message)
  return new AiRegistryError('missing_provider_config', 'Unexpected error')
}

function ensureInCuratedCatalog(providerId: AiProviderId, modelId: string): void {
  const list = curatedModelsByProvider[providerId]
  const ok = list.some((m) => m.id === modelId)
  if (!ok) {
    throw new AiRegistryError(
      'unknown_model',
      `Unknown model '${modelId}' for provider '${providerId}'.`,
      providerId
    )
  }
}

async function requireSecret(providerId: AiProviderId, kind: AiCredentialKind): Promise<string> {
  let value: string | null
  try {
    value = await aiSecretsGet(kind)
  } catch (e) {
    throw mapVaultError(e)
  }
  if (!value) {
    throw new MissingAiCredentialError(
      providerId,
      kind,
      'Missing credentials. Configure this provider in Settings.'
    )
  }
  return value
}

async function markInvalidIfUnauthorized(providerId: AiProviderId, e: unknown): Promise<void> {
  if (providerId !== 'github') return
  const status = (e as any)?.status
  if (status !== 401 && status !== 403) return
  try {
    await aiSecretsSet('github_models_token', '')
  } catch {
  }
}

async function requireOpenAiCompatConfig(): Promise<OpenAiCompatConfig> {
  let cfg: OpenAiCompatConfig | null
  try {
    cfg = await aiOpenAiCompatGetConfig()
  } catch (e) {
    throw mapVaultError(e)
  }
  if (!cfg) {
    throw new AiRegistryError(
      'missing_provider_config',
      'OpenAI compatible provider is not configured. Configure it in Settings.',
      'openai_compat'
    )
  }
  return cfg
}

export function aiRegistryCatalog(): AiRegistryCatalog {
  return {
    providers: curatedProviders,
    modelsByProvider: curatedModelsByProvider
  }
}

export async function resolveAiModel(qualifiedId: string): Promise<LanguageModel> {
  if (isTracerTestMode() && !isTracerLiveAiEnabled()) {
    return createTracerDeterministicTestModel({ provider: 'tracer_test', modelId: qualifiedId })
  }

  let parsed: { providerId: AiProviderId; modelId: string }
  try {
    parsed = parseQualifiedModelId(qualifiedId)
  } catch {
    throw new AiRegistryError('invalid_model_id', `Invalid model id: ${qualifiedId}`)
  }

  const { providerId, modelId } = parsed

  if (!isAiProviderId(providerId)) {
    throw new AiRegistryError('unknown_provider', `Unknown provider '${providerId}'.`)
  }

  if (providerId === 'openai') {
    ensureInCuratedCatalog('openai', modelId)
    const apiKey = await requireSecret('openai', 'openai_api_key')
    const openai = createOpenAI({ apiKey, fetch: aiHttpFetch })
    return openai(modelId)
  }

  if (providerId === 'anthropic') {
    ensureInCuratedCatalog('anthropic', modelId)
    const apiKey = await requireSecret('anthropic', 'anthropic_api_key')
    const anthropic = createAnthropic({ apiKey, fetch: aiHttpFetch })
    return anthropic(modelId)
  }

  if (providerId === 'gemini') {
    ensureInCuratedCatalog('gemini', modelId)
    const apiKey = await requireSecret('gemini', 'gemini_api_key')
    const google = createGoogleGenerativeAI({ apiKey, fetch: aiHttpFetch })
    return google(modelId)
  }

   if (providerId === 'github') {
     ensureInCuratedCatalog('github', modelId)
     const token = await requireSecret('github', 'github_models_token')
     const gh = createOpenAICompatible({
       name: 'github',
       apiKey: token,
       baseURL: 'https://models.github.ai',
       headers: githubHeaders,
       fetch: aiHttpFetch
     })
     const model = gh.chatModel(modelId)
     return new Proxy(model as any, {
       get(target, prop, receiver) {
         const v = Reflect.get(target, prop, receiver)
         if (prop !== 'doGenerate' && prop !== 'doStream') return v
         if (typeof v !== 'function') return v
         return async (...args: any[]) => {
           try {
             return await v.apply(target, args)
           } catch (err) {
             await markInvalidIfUnauthorized('github', err)
             throw err
           }
         }
       }
     })
   }

  if (providerId === 'openai_compat') {
    const cfg = await requireOpenAiCompatConfig()
    const apiKey = await requireSecret('openai_compat', 'openai_compat_api_key')
    const compat = createOpenAICompatible({
      name: 'openai_compat',
      apiKey,
      baseURL: cfg.baseURL,
      fetch: aiHttpFetch
    })
    return compat.chatModel(cfg.modelId)
  }

  throw new AiRegistryError('unknown_provider', `Unknown provider '${providerId}'.`)
}
