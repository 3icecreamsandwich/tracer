import type { DbClient, Profile, Uuid } from '../types'
import { nowIsoSql } from '../sql'

const PROFILE_SINGLETON_ID = 'profile' as Uuid

type DbProfileRow = {
  id: string
  name: string
  email: string
  created_at: string
}

export function createProfileRepo(db: DbClient) {
  return {
    async get(): Promise<Profile | null> {
      const rows = await db.select<DbProfileRow>(
        `SELECT id, name, email, created_at FROM profile WHERE id = ? LIMIT 1;`,
        [PROFILE_SINGLETON_ID]
      )
      const row = rows[0]
      if (!row) return null
      return {
        id: row.id as Uuid,
        name: row.name,
        email: row.email,
        createdAt: row.created_at
      }
    },

    async set(input: { name: string; email: string }): Promise<Profile> {
      await db.execute(
        `INSERT INTO profile (id, name, email, created_at)
         VALUES (?, ?, ?, ${nowIsoSql()})
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           email = excluded.email;`,
        [PROFILE_SINGLETON_ID, input.name, input.email]
      )

      const profile = await this.get()
      if (!profile) throw new Error('Failed to upsert profile')
      return profile
    }
  }
}
