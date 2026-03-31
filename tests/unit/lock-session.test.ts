import { describe, expect, it, vi } from 'vitest'

async function withSessionStorage<T>(storage: Storage | undefined, fn: () => Promise<T> | T): Promise<T> {
  const prev = (globalThis as any).sessionStorage
  if (storage === undefined) {
    delete (globalThis as any).sessionStorage
  } else {
    ;(globalThis as any).sessionStorage = storage
  }
  try {
    return await fn()
  } finally {
    if (prev === undefined) {
      delete (globalThis as any).sessionStorage
    } else {
      ;(globalThis as any).sessionStorage = prev
    }
  }
}

function createMemoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear() {
      map.clear()
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null
    },
    removeItem(key: string) {
      map.delete(key)
    },
    setItem(key: string, value: string) {
      map.set(key, String(value))
    }
  } as any
}

async function importFreshLockSession() {
  vi.resetModules()
  const mod = await import('../../src/composables/lock-session')
  return mod
}

describe('useLockSession', () => {
  it('persists unlockedThisSession in sessionStorage when available', async () => {
    const storage = createMemoryStorage()

    await withSessionStorage(storage, async () => {
      const { useLockSession } = await importFreshLockSession()
      const a = useLockSession()
      expect(a.unlockedThisSession.value).toBe(false)
      a.markUnlocked()
      expect(a.unlockedThisSession.value).toBe(true)
    })

    await withSessionStorage(storage, async () => {
      const { useLockSession } = await importFreshLockSession()
      const b = useLockSession()
      expect(b.unlockedThisSession.value).toBe(true)
      b.markLocked()
      expect(b.unlockedThisSession.value).toBe(false)
    })
  })

  it('falls back to in-memory state when sessionStorage is unavailable', async () => {
    await withSessionStorage(undefined, async () => {
      const { useLockSession } = await importFreshLockSession()
      const s = useLockSession()
      expect(s.unlockedThisSession.value).toBe(false)
      s.markUnlocked()
      expect(s.unlockedThisSession.value).toBe(true)
      s.markLocked()
      expect(s.unlockedThisSession.value).toBe(false)
    })
  })
})
