import type { AiProviderId } from './ids'

export type AiRegistryErrorCode =
  | 'invalid_model_id'
  | 'unknown_provider'
  | 'unknown_model'
  | 'vault_locked'
  | 'missing_credential'
  | 'missing_provider_config'

export class AiRegistryError extends Error {
  readonly code: AiRegistryErrorCode
  readonly providerId?: AiProviderId

  constructor(code: AiRegistryErrorCode, message: string, providerId?: AiProviderId) {
    super(message)
    this.name = 'AiRegistryError'
    this.code = code
    this.providerId = providerId
  }
}

export type AiCredentialKind =
  | 'openai_api_key'
  | 'anthropic_api_key'
  | 'gemini_api_key'
  | 'github_models_token'
  | 'openai_compat_api_key'

export class MissingAiCredentialError extends AiRegistryError {
  readonly credentialKind: AiCredentialKind

  constructor(providerId: AiProviderId, credentialKind: AiCredentialKind, message: string) {
    super('missing_credential', message, providerId)
    this.name = 'MissingAiCredentialError'
    this.credentialKind = credentialKind
  }
}

export class AiVaultLockedError extends AiRegistryError {
  constructor() {
    super(
      'vault_locked',
      'Your vault is locked. Unlock Tracer to use AI features.'
    )
    this.name = 'AiVaultLockedError'
  }
}
