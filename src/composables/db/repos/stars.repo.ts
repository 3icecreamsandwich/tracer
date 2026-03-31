import type { DbClient, Uuid } from '../types'

type DbStarRow = {
  term_id: string
}

export function createStarsRepo(db: DbClient) {
  return {
    async listTermIds(setId: Uuid): Promise<Uuid[]> {
      const rows = await db.select<DbStarRow>(
        `SELECT term_id FROM starred_terms WHERE set_id = ? ORDER BY created_at DESC;`,
        [setId]
      )
      return rows.map((r) => r.term_id as Uuid)
    },

    async isStarred(setId: Uuid, termId: Uuid): Promise<boolean> {
      const rows = await db.select<{ c: number }>(
        `SELECT COUNT(1) as c FROM starred_terms WHERE set_id = ? AND term_id = ?;`,
        [setId, termId]
      )
      return Number(rows[0]?.c ?? 0) > 0
    },

    async setStarred(setId: Uuid, termId: Uuid, starred: boolean): Promise<void> {
      if (starred) {
        await db.execute(
          `INSERT OR IGNORE INTO starred_terms (set_id, term_id) VALUES (?, ?);`,
          [setId, termId]
        )
        return
      }
      await db.execute(
        `DELETE FROM starred_terms WHERE set_id = ? AND term_id = ?;`,
        [setId, termId]
      )
    },

    async toggle(setId: Uuid, termId: Uuid): Promise<boolean> {
      const starred = await this.isStarred(setId, termId)
      await this.setStarred(setId, termId, !starred)
      return !starred
    }
  }
}
