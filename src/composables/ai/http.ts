import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { hasTauriRuntime } from '../tauri'
import { isTracerLiveAiEnabled, isTracerTestMode } from './test-mode'

const hasTauriInternals = hasTauriRuntime()

export function aiHttpFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (isTracerTestMode() && !isTracerLiveAiEnabled()) {
    throw new Error('Network is disabled in TRACER_TEST_MODE (set TRACER_LIVE_AI=1 to allow live calls).')
  }
  if (hasTauriInternals) return tauriFetch(input, init)
  return fetch(input, init)
}
