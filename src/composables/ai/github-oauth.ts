import { invoke } from '@tauri-apps/api/core'
import { aiHttpFetch } from './http'
import { isTracerTestMode } from './test-mode'

export type GithubDeviceCodeResponse = {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

export type GithubDeviceTokenSuccess = {
  access_token: string
  token_type: string
  scope: string
}

export type GithubDeviceTokenErrorCode =
  | 'authorization_pending'
  | 'slow_down'
  | 'expired_token'
  | 'access_denied'
  | 'device_flow_disabled'
  | 'unsupported_grant_type'
  | 'incorrect_client_credentials'
  | 'incorrect_device_code'

export type GithubDeviceTokenError = {
  error: GithubDeviceTokenErrorCode | string
  error_description?: string
  error_uri?: string
}

export type GithubDevicePollEvent =
  | { type: 'pending'; nextIntervalSec: number }
  | { type: 'slow_down'; nextIntervalSec: number }
  | { type: 'success'; token: GithubDeviceTokenSuccess }
  | { type: 'expired' }
  | { type: 'denied' }
  | { type: 'device_flow_disabled' }
  | { type: 'error'; message: string }

function parseUrlEncoded(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of raw.split('&')) {
    const [k, v] = part.split('=', 2)
    if (!k) continue
    out[decodeURIComponent(k)] = decodeURIComponent(v ?? '')
  }
  return out
}

function asNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return null
}

function getEnvClientId(): string | null {
  const v = (import.meta as any)?.env?.VITE_GITHUB_OAUTH_CLIENT_ID
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!t) return null
  return t
}

export function githubOAuthClientId(): string {
  const id = getEnvClientId()
  if (!id) {
    throw new Error('Missing VITE_GITHUB_OAUTH_CLIENT_ID')
  }
  return id
}

export async function githubDeviceCodeRequest(opts: {
  clientId: string
  scope: string
}): Promise<GithubDeviceCodeResponse> {
  if (isTracerTestMode()) {
    return {
      device_code: 'tracer_test_device_code',
      user_code: 'TRACER-TEST',
      verification_uri: 'https://github.com/login/device',
      expires_in: 600,
      interval: 1
    }
  }

  const res = await aiHttpFetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: opts.clientId,
      scope: opts.scope
    })
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Device code request failed (${res.status})`)
  }

  let parsed: any
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = parseUrlEncoded(text)
  }

  const expiresIn = asNumber(parsed.expires_in) ?? 900
  const interval = asNumber(parsed.interval) ?? 5

  const out: GithubDeviceCodeResponse = {
    device_code: String(parsed.device_code ?? ''),
    user_code: String(parsed.user_code ?? ''),
    verification_uri: String(parsed.verification_uri ?? parsed.verification_url ?? ''),
    expires_in: expiresIn,
    interval
  }

  if (!out.device_code || !out.user_code || !out.verification_uri) {
    throw new Error('Device code response missing required fields')
  }
  return out
}

export function mapDevicePollResponse(
  body: GithubDeviceTokenSuccess | GithubDeviceTokenError,
  currentIntervalSec: number
): GithubDevicePollEvent {
  const maybeSuccess = body as GithubDeviceTokenSuccess
  if (typeof maybeSuccess.access_token === 'string' && maybeSuccess.access_token.trim().length > 0) {
    return { type: 'success', token: maybeSuccess }
  }

  const err = body as GithubDeviceTokenError
  const code = String(err.error ?? 'error')
  if (code === 'authorization_pending') {
    return { type: 'pending', nextIntervalSec: currentIntervalSec }
  }
  if (code === 'slow_down') {
    return { type: 'slow_down', nextIntervalSec: currentIntervalSec + 5 }
  }
  if (code === 'expired_token') {
    return { type: 'expired' }
  }
  if (code === 'access_denied') {
    return { type: 'denied' }
  }
  if (code === 'device_flow_disabled') {
    return { type: 'device_flow_disabled' }
  }
  return {
    type: 'error',
    message: err.error_description?.trim() || `OAuth device flow error: ${code}`
  }
}

export async function githubDeviceTokenPollOnce(opts: {
  clientId: string
  deviceCode: string
}): Promise<GithubDeviceTokenSuccess | GithubDeviceTokenError> {
  if (isTracerTestMode()) {
    return {
      access_token: 'tracer_test_github_models_token',
      token_type: 'bearer',
      scope: 'models:read'
    }
  }

  const res = await aiHttpFetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: opts.clientId,
      device_code: opts.deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    })
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Token request failed (${res.status})`)
  }
  try {
    return JSON.parse(text)
  } catch {
    return parseUrlEncoded(text) as any
  }
}

export type GithubPkceStartResult = {
  id: string
  port: number
}

export type GithubPkceCallback = {
  code: string
  state: string
}

export async function githubPkceStart(): Promise<GithubPkceStartResult> {
  if (isTracerTestMode()) {
    return { id: 'tracer_test_pkce', port: 0 }
  }
  return await invoke<GithubPkceStartResult>('github_oauth_pkce_start')
}

export async function githubPkceFinish(opts: {
  id: string
  expectedState: string
  timeoutMs?: number
}): Promise<GithubPkceCallback> {
  if (isTracerTestMode()) {
    return { code: 'tracer_test_code', state: opts.expectedState }
  }
  return await invoke<GithubPkceCallback>('github_oauth_pkce_finish', {
    id: opts.id,
    args: {
      expectedState: opts.expectedState,
      timeoutMs: opts.timeoutMs
    }
  })
}

export async function githubPkceCancel(id: string): Promise<void> {
  if (isTracerTestMode()) return
  await invoke('github_oauth_pkce_cancel', { id })
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes)
  let s = ''
  for (const b of u8) s += String.fromCharCode(b)
  const b64 = btoa(s)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function randomPkceVerifier(): string {
  const buf = new Uint8Array(32)
  crypto.getRandomValues(buf)
  return base64UrlEncode(buf.buffer)
}

export async function pkceChallengeS256(verifier: string): Promise<string> {
  const bytes = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return base64UrlEncode(digest)
}

export async function githubPkceAuthorizeUrl(opts: {
  clientId: string
  port: number
  state: string
  scope: string
  codeChallenge: string
}): Promise<string> {
  const redirectUri = `http://127.0.0.1:${opts.port}/callback`
  const params = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: redirectUri,
    state: opts.state,
    scope: opts.scope,
    code_challenge: opts.codeChallenge,
    code_challenge_method: 'S256'
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export async function githubPkceExchangeToken(opts: {
  clientId: string
  code: string
  port: number
  codeVerifier: string
}): Promise<GithubDeviceTokenSuccess | GithubDeviceTokenError> {
  if (isTracerTestMode()) {
    return {
      access_token: 'tracer_test_github_models_token',
      token_type: 'bearer',
      scope: 'models:read'
    }
  }

  const redirectUri = `http://127.0.0.1:${opts.port}/callback`
  const res = await aiHttpFetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: opts.clientId,
      code: opts.code,
      redirect_uri: redirectUri,
      code_verifier: opts.codeVerifier
    })
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Token exchange failed (${res.status})`)
  try {
    return JSON.parse(text)
  } catch {
    return parseUrlEncoded(text) as any
  }
}

export async function openExternal(url: string): Promise<void> {
  if (isTracerTestMode()) return
  await invoke('open_external', { url })
}
