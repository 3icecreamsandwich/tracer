const REDACTED = '[REDACTED]'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

export function redactSensitiveText(input: string): string {
  if (typeof input !== 'string' || input.length === 0) return input

  let s = input

  s = s.replace(/\bBearer\s+([A-Za-z0-9._-]{8,})\b/gi, `Bearer ${REDACTED}`)

  s = s.replace(/\bsk-([A-Za-z0-9_-]{8,})\b/g, `sk-${REDACTED}`)
  s = s.replace(/\bgho_([A-Za-z0-9_-]{8,})\b/g, `gho_${REDACTED}`)
  s = s.replace(/\bAIza([A-Za-z0-9_-]{8,})\b/g, `AIza${REDACTED}`)

  return s
}

function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase()
  return (
    k.includes('password') ||
    k.includes('secret') ||
    k.includes('token') ||
    k.includes('api_key') ||
    k.includes('apikey') ||
    k.includes('access_token') ||
    k.includes('refresh_token')
  )
}

export function redactSensitive<T>(value: T, opts?: { maxDepth?: number }): T {
  const maxDepth = Math.max(0, Math.floor(opts?.maxDepth ?? 6))
  const seen = new WeakMap<object, unknown>()

  const walk = (v: unknown, depth: number, parentKey?: string): unknown => {
    if (typeof v === 'string') {
      if (parentKey && isSensitiveKey(parentKey)) return REDACTED
      return redactSensitiveText(v)
    }

    if (typeof v !== 'object' || v === null) return v
    if (depth >= maxDepth) return '[REDACTED:depth]'

    const existing = seen.get(v as object)
    if (existing) return existing

    if (Array.isArray(v)) {
      const out: unknown[] = []
      seen.set(v, out)
      for (const item of v) out.push(walk(item, depth + 1))
      return out
    }

    if (isRecord(v)) {
      const out: Record<string, unknown> = {}
      seen.set(v, out)
      for (const [k, child] of Object.entries(v)) {
        if (isSensitiveKey(k)) {
          out[k] = REDACTED
        } else {
          out[k] = walk(child, depth + 1, k)
        }
      }
      return out
    }

    return v
  }

  return walk(value, 0) as T
}
