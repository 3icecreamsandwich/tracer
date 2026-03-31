import { describe, expect, it } from 'vitest'

async function withWindow<T>(win: any, fn: () => Promise<T> | T): Promise<T> {
  const prevWindow = (globalThis as any).window
  ;(globalThis as any).window = win
  try {
    return await fn()
  } finally {
    if (prevWindow === undefined) {
      delete (globalThis as any).window
    } else {
      ;(globalThis as any).window = prevWindow
    }
  }
}

async function withGlobalIsTauri<T>(value: any, fn: () => Promise<T> | T): Promise<T> {
  const prev = (globalThis as any).isTauri
  ;(globalThis as any).isTauri = value
  try {
    return await fn()
  } finally {
    if (prev === undefined) {
      delete (globalThis as any).isTauri
    } else {
      ;(globalThis as any).isTauri = prev
    }
  }
}

async function withForceWeb<T>(value: string | undefined, fn: () => Promise<T> | T): Promise<T> {
  const prev = process.env.VITE_TRACER_FORCE_WEB
  if (value === undefined) {
    delete process.env.VITE_TRACER_FORCE_WEB
  } else {
    process.env.VITE_TRACER_FORCE_WEB = value
  }
  try {
    return await fn()
  } finally {
    if (prev === undefined) {
      delete process.env.VITE_TRACER_FORCE_WEB
    } else {
      process.env.VITE_TRACER_FORCE_WEB = prev
    }
  }
}

describe('hasTauriRuntime', () => {
  it('returns false when forced web preview is enabled', async () => {
    await withForceWeb('1', async () => {
      await withWindow({ __TAURI_INTERNALS__: { metadata: {} }, navigator: { userAgent: 'Tauri' } }, async () => {
        await withGlobalIsTauri(true, async () => {
          const { hasTauriRuntime } = await import('../../src/composables/tauri')
          expect(hasTauriRuntime()).toBe(false)
        })
      })
    })
  })

  it('detects Tauri by __TAURI_INTERNALS__', async () => {
    await withForceWeb(undefined, async () => {
      await withGlobalIsTauri(undefined, async () => {
        await withWindow(
          {
            __TAURI_INTERNALS__: { metadata: {} },
            navigator: { userAgent: 'Mozilla/5.0' }
          },
          async () => {
            const { hasTauriRuntime } = await import('../../src/composables/tauri')
            expect(hasTauriRuntime()).toBe(true)
          }
        )
      })
    })
  })

  it('detects Tauri by global isTauri flag', async () => {
    await withForceWeb(undefined, async () => {
      await withWindow({ navigator: { userAgent: 'Mozilla/5.0' } }, async () => {
        await withGlobalIsTauri(true, async () => {
          const { hasTauriRuntime } = await import('../../src/composables/tauri')
          expect(hasTauriRuntime()).toBe(true)
        })
      })
    })
  })

  it('falls back to user agent sniffing', async () => {
    await withForceWeb(undefined, async () => {
      await withGlobalIsTauri(undefined, async () => {
        await withWindow({ navigator: { userAgent: 'Tauri' } }, async () => {
          const { hasTauriRuntime } = await import('../../src/composables/tauri')
          expect(hasTauriRuntime()).toBe(true)
        })
      })
    })
  })
})
