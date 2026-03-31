export function hasTauriRuntime(): boolean {
  const env = (((globalThis as any)?.process?.env ?? (import.meta as any)?.env ?? {}) as Record<string, unknown>)
  if (env.VITE_TRACER_FORCE_WEB === '1') return false
  const w = (globalThis as any)?.window
  if (!w) return false

  if (w.__TAURI_INTERNALS__ && typeof w.__TAURI_INTERNALS__ === 'object') return true
  if ((globalThis as any)?.isTauri) return true

  const ua = w.navigator?.userAgent ?? ''
  return /\bTauri\b/i.test(ua)
}
