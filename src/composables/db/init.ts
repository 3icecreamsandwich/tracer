import Database from '@tauri-apps/plugin-sql'
import type { DbClient } from './types'

const DB_URL = 'sqlite:tracer.db'

let dbPromise: Promise<DbClient> | null = null

export function useTracerDb(): Promise<DbClient> {
  if (!dbPromise) {
    dbPromise = Database.load(DB_URL) as unknown as Promise<DbClient>
  }
  return dbPromise
}

export function __resetTracerDbForTests() {
  dbPromise = null
}
