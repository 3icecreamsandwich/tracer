import { invoke } from '@tauri-apps/api/core'
import { hasTauriRuntime } from './tauri'
import { redactSensitiveText } from './security/redact'

export type AppLockStatus = {
  has_verifier: boolean
  requires_unlock: boolean
  can_auto_unlock: boolean
}

export type AppLockError = {
  code: string
  message: string
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function toMessage(err: unknown): string {
  if (typeof err === 'string') return err
  if (isRecord(err) && typeof err.message === 'string') return err.message
  return 'Unexpected error'
}

function toAppLockError(err: unknown): AppLockError {
  if (isRecord(err) && typeof err.code === 'string' && typeof err.message === 'string') {
    return { code: err.code, message: redactSensitiveText(err.message) }
  }

  return { code: 'unknown', message: redactSensitiveText(toMessage(err)) }
}

export async function lockGetStatus(): Promise<AppLockStatus> {
  if (!hasTauriRuntime()) {
    return { has_verifier: false, requires_unlock: false, can_auto_unlock: true }
  }
  return invoke<AppLockStatus>('lock_get_status')
}

export async function lockFirstRunSetPassword(password: string): Promise<void> {
  if (!hasTauriRuntime()) return
  try {
    await invoke('lock_first_run_set_password', { password })
  } catch (e) {
    throw toAppLockError(e)
  }
}

export async function lockUnlock(password: string): Promise<void> {
  if (!hasTauriRuntime()) return
  try {
    await invoke('lock_unlock', { password })
  } catch (e) {
    throw toAppLockError(e)
  }
}

export async function lockSetStartupLockEnabled(enabled: boolean, password?: string): Promise<void> {
  if (!hasTauriRuntime()) return
  try {
    await invoke('lock_set_startup_lock_enabled', {
      enabled,
      password: password ?? null
    })
  } catch (e) {
    throw toAppLockError(e)
  }
}

export async function lockResetTracer(): Promise<void> {
  if (!hasTauriRuntime()) return
  try {
    await invoke('lock_reset_tracer')
  } catch (e) {
    throw new Error(redactSensitiveText(toMessage(e)))
  }
}
