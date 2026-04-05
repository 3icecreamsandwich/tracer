import { invoke } from '@tauri-apps/api/core'
import type { AiCredentialKind } from './errors'
import { hasTauriRuntime } from '../tauri'

type VaultSecretErrorShape = {
  code: string
  message: string
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function toVaultSecretError(err: unknown): VaultSecretErrorShape {
  if (isRecord(err) && typeof err.code === 'string' && typeof err.message === 'string') {
    return { code: err.code, message: err.message }
  }
  if (err instanceof Error) return { code: 'unknown', message: err.message }
  return { code: 'unknown', message: typeof err === 'string' ? err : 'Unexpected error' }
}

function hasTauriInternalsNow(): boolean {
  return hasTauriRuntime()
}

const inMemorySecrets = new Map<string, string>()

export type OpenAiCompatConfig = {
  baseURL: string
  modelId: string
}

export class VaultSecretError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'VaultSecretError'
    this.code = code
  }
}

export async function aiSecretsGet(kind: AiCredentialKind): Promise<string | null> {
  if (!hasTauriInternalsNow()) {
    return inMemorySecrets.get(kind) ?? null
  }
  try {
    const value = await invoke<string | null>('ai_secrets_get', { kind })
    if (typeof value !== 'string' || value.trim().length === 0) return null
    return value
  } catch (e) {
    const err = toVaultSecretError(e)
    throw new VaultSecretError(err.code, err.message)
  }
}

export async function aiSecretsSet(kind: AiCredentialKind, value: string): Promise<void> {
  const trimmed = value.trim()
  if (!hasTauriInternalsNow()) {
    if (!trimmed) {
      inMemorySecrets.delete(kind)
    } else {
      inMemorySecrets.set(kind, trimmed)
    }
    return
  }
  try {
    await invoke('ai_secrets_set', { kind, value: trimmed })
  } catch (e) {
    const err = toVaultSecretError(e)
    throw new VaultSecretError(err.code, err.message)
  }
}

export async function aiSecretsDelete(kind: AiCredentialKind): Promise<void> {
  if (!hasTauriInternalsNow()) {
    inMemorySecrets.delete(kind)
    return
  }
  try {
    await invoke('ai_secrets_delete', { kind })
  } catch (e) {
    const err = toVaultSecretError(e)
    throw new VaultSecretError(err.code, err.message)
  }
}

export async function aiOpenAiCompatGetConfig(): Promise<OpenAiCompatConfig | null> {
  if (!hasTauriInternalsNow()) {
    const raw = inMemorySecrets.get('openai_compat_config')
    if (!raw) return null
    try {
      return JSON.parse(raw) as OpenAiCompatConfig
    } catch {
      return null
    }
  }

  try {
    const raw = await invoke<string | null>('ai_openai_compat_get_config')
    if (!raw) return null
    const parsed = JSON.parse(raw) as OpenAiCompatConfig
    if (!parsed?.baseURL || !parsed?.modelId) return null
    return parsed
  } catch (e) {
    const err = toVaultSecretError(e)
    throw new VaultSecretError(err.code, err.message)
  }
}

export async function aiOpenAiCompatSetConfig(config: OpenAiCompatConfig): Promise<void> {
  const payload = {
    baseURL: config.baseURL.trim(),
    modelId: config.modelId.trim()
  }
  if (!hasTauriInternalsNow()) {
    inMemorySecrets.set('openai_compat_config', JSON.stringify(payload))
    return
  }
  try {
    await invoke('ai_openai_compat_set_config', { args: { configJson: JSON.stringify(payload) } })
  } catch (e) {
    const err = toVaultSecretError(e)
    throw new VaultSecretError(err.code, err.message)
  }
}
