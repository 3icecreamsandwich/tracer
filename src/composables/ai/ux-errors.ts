import { AiRegistryError, MissingAiCredentialError } from './errors'
import type { AiProviderId } from './ids'
import { GenerateContractParseError } from './generate-contract'
import { GenerateUnsupportedModelError } from './generate-request'
import { TermsValidationError, TsvParseError } from '../db/validators'
import { redactSensitiveText } from '../security/redact'

export type AiErrorKey =
  | 'missing_default_model'
  | 'missing_credentials'
  | 'oauth_not_authenticated'
  | 'provider_rate_limited'
  | 'network_offline'
  | 'provider_error'
  | 'unsupported_model_input'
  | 'parse_error_tsv'

export type AiErrorUx = {
  key: AiErrorKey
  title: string
  message: string
  providerId?: AiProviderId
  showGoToSettings: boolean
}

export function aiErrorSettingsReason(key: AiErrorKey): string | null {
  if (key === 'missing_default_model') return 'missing-default-model'
  if (key === 'missing_credentials') return 'missing-credentials'
  if (key === 'oauth_not_authenticated') return 'oauth-not-authenticated'
  return null
}

export function aiErrorForMissingDefaultModel(): AiErrorUx {
  return {
    key: 'missing_default_model',
    title: 'Default AI model required',
    message: 'Choose a Default AI Model in Settings to use this feature.',
    showGoToSettings: true
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function errorStatus(err: unknown): number | null {
  const maybe: any = err
  const status = maybe?.status
  if (typeof status === 'number' && Number.isFinite(status)) return status

  const responseStatus = maybe?.response?.status
  if (typeof responseStatus === 'number' && Number.isFinite(responseStatus)) return responseStatus

  const causeStatus = maybe?.cause?.status
  if (typeof causeStatus === 'number' && Number.isFinite(causeStatus)) return causeStatus

  return null
}

function isOffline(): boolean {
  const nav: any = (globalThis as any)?.navigator
  if (!nav) return false
  if (typeof nav.onLine !== 'boolean') return false
  return nav.onLine === false
}

function isFetchOfflineError(err: unknown): boolean {
  if (isOffline()) return true
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  if (msg.includes('failed to fetch')) return true
  if (msg.includes('networkerror')) return true
  if (msg.includes('network request failed')) return true
  return false
}

function isRateLimitError(err: unknown): boolean {
  const status = errorStatus(err)
  if (status === 429) return true

  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (msg.includes('rate limit')) return true
    if (msg.includes('too many requests')) return true
  }

  if (isRecord(err) && typeof err.code === 'string') {
    const code = err.code.toLowerCase()
    if (code.includes('rate_limit')) return true
    if (code === 'rate_limit_exceeded') return true
  }
  return false
}

export function normalizeAiError(err: unknown): AiErrorUx {
  if (err instanceof TsvParseError || err instanceof TermsValidationError || err instanceof GenerateContractParseError) {
    return {
      key: 'parse_error_tsv',
      title: 'AI output could not be parsed',
      message: redactSensitiveText(
        err.message || 'The AI output was not valid TSV. Copy the raw output and try again.'
      ),
      showGoToSettings: false
    }
  }

  if (err instanceof GenerateUnsupportedModelError) {
    return {
      key: 'unsupported_model_input',
      title: 'Model does not support uploaded files',
      message: redactSensitiveText(err.message),
      showGoToSettings: true
    }
  }

  if (err instanceof MissingAiCredentialError) {
    if (err.providerId === 'github' && err.credentialKind === 'github_models_token') {
      return {
        key: 'oauth_not_authenticated',
        title: 'GitHub Models not authenticated',
        message: 'Authenticate GitHub Models in Settings to use this provider.',
        providerId: err.providerId,
        showGoToSettings: true
      }
    }
    return {
      key: 'missing_credentials',
      title: 'Missing provider credentials',
      message: 'Configure your AI provider credentials in Settings to continue.',
      providerId: err.providerId,
      showGoToSettings: true
    }
  }

  if (err instanceof AiRegistryError) {
    if (err.code === 'missing_credential' || err.code === 'missing_provider_config') {
      return {
        key: 'missing_credentials',
        title: 'Missing provider credentials',
        message: redactSensitiveText(err.message || 'Configure this provider in Settings.'),
        providerId: err.providerId,
        showGoToSettings: true
      }
    }
  }

  if (isFetchOfflineError(err)) {
    return {
      key: 'network_offline',
      title: 'You are offline',
      message: 'Reconnect to the internet and try again.',
      showGoToSettings: false
    }
  }

  if (isRateLimitError(err)) {
    return {
      key: 'provider_rate_limited',
      title: 'Rate limit reached',
      message: 'The AI provider is rate limited. Wait a moment and try again.',
      showGoToSettings: false
    }
  }

  const status = errorStatus(err)
  if (typeof status === 'number' && status >= 500) {
    return {
      key: 'provider_error',
      title: 'Provider error',
      message: `The AI provider failed (${status}). Try again in a moment.`,
      showGoToSettings: false
    }
  }

  if (err instanceof Error) {
    return {
      key: 'provider_error',
      title: 'AI request failed',
      message: redactSensitiveText(err.message || 'Unexpected AI error.'),
      showGoToSettings: false
    }
  }

  return {
    key: 'provider_error',
    title: 'AI request failed',
    message: 'Unexpected AI error.',
    showGoToSettings: false
  }
}

export function isAiErrorCandidate(err: unknown): boolean {
  if (err instanceof TsvParseError) return true
  if (err instanceof TermsValidationError) return true
  if (err instanceof GenerateContractParseError) return true
  if (err instanceof AiRegistryError) return true
  if (err instanceof MissingAiCredentialError) return true
  if (isFetchOfflineError(err)) return true
  if (isRateLimitError(err)) return true
  if (errorStatus(err) !== null) return true
  return false
}
