import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'

function runSqlite(dbPath: string, sql: string) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn('sqlite3', ['-bail', dbPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))
    child.on('exit', (code) => resolve({ code: code ?? 1, stdout, stderr }))
    child.stdin.end(sql)
  })
}

describe('SQLite migrations (task 3)', () => {
  it('creates required tables, enforces JSON validity, and supports insert/select roundtrip', async () => {
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'tracer-sql-'))
    const dbPath = path.join(tmpDir, 'test.db')

    try {
      const migrationPath = path.resolve(
        process.cwd(),
        'src-tauri',
        'migrations',
        '001_core.sql'
      )
      const migrationSql = await readFile(migrationPath, 'utf8')

      const migrateRes = await runSqlite(dbPath, migrationSql)
      expect(migrateRes.code).toBe(0)
      expect(migrateRes.stderr).toBe('')

      const tableNamesRes = await runSqlite(
        dbPath,
        [
          '.mode list',
          ".headers off",
          "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
        ].join('\n') + '\n'
      )
      expect(tableNamesRes.code).toBe(0)
      const tables = tableNamesRes.stdout
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      for (const name of [
        'profile',
        'flashcard_sets',
        'starred_terms',
        'study_guides',
        'app_settings'
      ]) {
        expect(tables).toContain(name)
      }

      const invalidJsonRes = await runSqlite(
        dbPath,
        [
          'BEGIN;',
          "INSERT INTO flashcard_sets (id, title, description, terms_json) VALUES ('set-1', 'Bad', NULL, 'not-json');",
          'COMMIT;'
        ].join('\n') + '\n'
      )
      expect(invalidJsonRes.code).not.toBe(0)
      expect(invalidJsonRes.stderr.toLowerCase()).toContain('constraint')

      const termsJson = JSON.stringify([
        {
          id: '00000000-0000-4000-8000-000000000000',
          front: 'hello',
          back: 'world'
        }
      ])

      const goodInsertRes = await runSqlite(
        dbPath,
        [
          'BEGIN;',
          `INSERT INTO flashcard_sets (id, title, description, terms_json) VALUES ('set-2', 'Good', 'ok', '${termsJson.replaceAll("'", "''")}');`,
          'COMMIT;'
        ].join('\n') + '\n'
      )
      expect(goodInsertRes.code).toBe(0)

      const selectRes = await runSqlite(
        dbPath,
        [
          '.mode json',
          '.headers off',
          "SELECT id, title, terms_json FROM flashcard_sets WHERE id = 'set-2';"
        ].join('\n') + '\n'
      )
      expect(selectRes.code).toBe(0)

      const rows = JSON.parse(selectRes.stdout) as Array<{
        id: string
        title: string
        terms_json: string
      }>
      expect(rows).toHaveLength(1)
      expect(rows[0]?.id).toBe('set-2')
      expect(rows[0]?.title).toBe('Good')
      expect(JSON.parse(rows[0]!.terms_json)).toEqual(JSON.parse(termsJson))
    } finally {
      await rm(tmpDir, { recursive: true, force: true })
    }
  })
})
