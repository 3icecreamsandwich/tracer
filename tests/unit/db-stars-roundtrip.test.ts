import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'

type DbClient = {
  execute: (sql: string, bindValues?: unknown[]) => Promise<unknown>
  select: <T>(sql: string, bindValues?: unknown[]) => Promise<T[]>
}

function quoteSqlValue(v: unknown) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL'
  if (typeof v === 'boolean') return v ? '1' : '0'
  const s = String(v)
  return `'${s.replace(/'/g, "''")}'`
}

function bindIntoSql(sql: string, bindValues?: unknown[]) {
  if (!bindValues || bindValues.length === 0) return sql
  const parts = sql.split('?')
  let out = parts[0] ?? ''
  for (let i = 1; i < parts.length; i += 1) {
    const v = bindValues[i - 1]
    out += quoteSqlValue(v) + (parts[i] ?? '')
  }
  return out
}

function runSqlite(dbPath: string, script: string) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn('sqlite3', ['-bail', dbPath], { stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))
    child.on('exit', (code) => resolve({ code: code ?? 1, stdout, stderr }))
    child.stdin.end(script)
  })
}

async function applyMigrations(dbPath: string) {
  const migrationPath = path.resolve(process.cwd(), 'src-tauri', 'migrations', '001_core.sql')
  const migrationSql = await readFile(migrationPath, 'utf8')
  const res = await runSqlite(dbPath, migrationSql)
  if (res.code !== 0) throw new Error(`sqlite3 migrations failed: ${res.stderr}`)
}

function createSqliteCliDb(dbPath: string): DbClient {
  return {
    async execute(sql: string, bindValues?: unknown[]) {
      const script = bindIntoSql(sql, bindValues)
      const res = await runSqlite(dbPath, script)
      if (res.code !== 0) throw new Error(res.stderr || 'sqlite3 execute failed')
      return undefined
    },

    async select<T>(sql: string, bindValues?: unknown[]) {
      const script = ['.mode json', '.headers off', bindIntoSql(sql, bindValues)].join('\n') +
        '\n'
      const res = await runSqlite(dbPath, script)
      if (res.code !== 0) throw new Error(res.stderr || 'sqlite3 select failed')
      const trimmed = res.stdout.trim()
      if (!trimmed) return []
      return JSON.parse(trimmed) as T[]
    }
  }
}

describe('stars repo roundtrip (sqlite:tracer.db)', () => {
  it('persists and queries starred term ids per set', async () => {
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'tracer-db-'))
    try {
      const dbPath = path.join(tmpDir, 'test.db')
      await applyMigrations(dbPath)

      const db = createSqliteCliDb(dbPath)
      const { createStarsRepo } = await import('../../src/composables/db/repos/stars.repo')
      const repo = createStarsRepo(db)

      const setId = '00000000-0000-4000-8000-000000000123'
      const term1 = '00000000-0000-4000-8000-000000000001'
      const term2 = '00000000-0000-4000-8000-000000000002'

      await repo.setStarred(setId, term1, true)
      await repo.setStarred(setId, term2, true)
      expect(await repo.isStarred(setId, term1)).toBe(true)

      const ids = await repo.listTermIds(setId)
      expect(ids).toEqual(expect.arrayContaining([term1, term2]))

      await repo.setStarred(setId, term1, false)
      expect(await repo.isStarred(setId, term1)).toBe(false)
    } finally {
      await rm(tmpDir, { recursive: true, force: true })
    }
  })
})
