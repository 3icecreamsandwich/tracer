export function isTracerTestMode(): boolean {
  const viteEnv = (import.meta as any)?.env
  if (viteEnv?.TRACER_TEST_MODE === '1') return true
  const nodeEnv = (globalThis as any)?.process?.env
  if (nodeEnv?.TRACER_TEST_MODE === '1') return true
  return false
}

export function isTracerLiveAiEnabled(): boolean {
  const viteEnv = (import.meta as any)?.env
  if (viteEnv?.TRACER_LIVE_AI === '1') return true
  const nodeEnv = (globalThis as any)?.process?.env
  if (nodeEnv?.TRACER_LIVE_AI === '1') return true
  return false
}
