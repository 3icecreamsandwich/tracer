import type {
  DbClient,
  FlashcardSet,
  FlashcardSetListItem,
  Term,
  Uuid
} from '../types'
import { nowIsoSql } from '../sql'

type DbSetRow = {
  id: string
  title: string
  description: string | null
  terms_json: string
  created_at: string
  updated_at: string
}

type DbSetListRow = {
  id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export function createSetsRepo(db: DbClient) {
  return {
    async list(): Promise<FlashcardSetListItem[]> {
      const rows = await db.select<DbSetListRow>(
        `SELECT id, title, description, created_at, updated_at
         FROM flashcard_sets
         ORDER BY updated_at DESC, created_at DESC;`
      )
      return rows.map((r) => ({
        id: r.id as Uuid,
        title: r.title,
        description: r.description ?? null,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    },

    async get(id: Uuid): Promise<FlashcardSet | null> {
      const rows = await db.select<DbSetRow>(
        `SELECT id, title, description, terms_json, created_at, updated_at
         FROM flashcard_sets WHERE id = ? LIMIT 1;`,
        [id]
      )
      const row = rows[0]
      if (!row) return null

      const terms = JSON.parse(row.terms_json) as Term[]
      return {
        id: row.id as Uuid,
        title: row.title,
        description: row.description ?? null,
        terms,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    },

    async create(input: {
      id: Uuid
      title: string
      description?: string | null
      terms: Term[]
    }): Promise<FlashcardSet> {
      const termsJson = JSON.stringify(input.terms)
      await db.execute(
        `INSERT INTO flashcard_sets (id, title, description, terms_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ${nowIsoSql()}, ${nowIsoSql()});`,
        [input.id, input.title, input.description ?? null, termsJson]
      )

      const set = await this.get(input.id)
      if (!set) throw new Error('Failed to create set')
      return set
    },

    async update(input: {
      id: Uuid
      title?: string
      description?: string | null
      terms?: Term[]
    }): Promise<FlashcardSet> {
      const current = await this.get(input.id)
      if (!current) throw new Error('Set not found')

      const nextTitle = input.title ?? current.title
      const nextDescription =
        input.description === undefined ? current.description : input.description
      const nextTerms = input.terms ?? current.terms

      await db.execute(
        `UPDATE flashcard_sets
         SET title = ?,
             description = ?,
             terms_json = ?,
             updated_at = ${nowIsoSql()}
         WHERE id = ?;`,
        [nextTitle, nextDescription, JSON.stringify(nextTerms), input.id]
      )

      const set = await this.get(input.id)
      if (!set) throw new Error('Failed to update set')
      return set
    }
  }
}
