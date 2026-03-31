import type { AppSettings, DbClient } from '../types'

type DbSettingsRow = {
  startup_lock_enabled: number
  default_model_id: string | null
  dark_mode: number
  learn_hybrid_enabled: number
}

function toBool(v: unknown) {
  return Number(v) === 1
}

export function createSettingsRepo(db: DbClient) {
  return {
    async get(): Promise<AppSettings> {
      const rows = await db.select<DbSettingsRow>(
        `SELECT startup_lock_enabled, default_model_id, dark_mode, learn_hybrid_enabled
         FROM app_settings WHERE id = 1 LIMIT 1;`
      )
      const row = rows[0]
      if (!row) {
        return {
          startupLockEnabled: true,
          defaultModelId: null,
          darkMode: false,
          learnHybridEnabled: false
        }
      }

      return {
        startupLockEnabled: toBool(row.startup_lock_enabled),
        defaultModelId: row.default_model_id ?? null,
        darkMode: toBool(row.dark_mode),
        learnHybridEnabled: toBool(row.learn_hybrid_enabled)
      }
    },

    async set(patch: Partial<AppSettings>): Promise<AppSettings> {
      const current = await this.get()
      const next: AppSettings = {
        startupLockEnabled: patch.startupLockEnabled ?? current.startupLockEnabled,
        defaultModelId:
          patch.defaultModelId === undefined ? current.defaultModelId : patch.defaultModelId,
        darkMode: patch.darkMode ?? current.darkMode,
        learnHybridEnabled: patch.learnHybridEnabled ?? current.learnHybridEnabled
      }

      await db.execute(
        `UPDATE app_settings
         SET startup_lock_enabled = ?,
             default_model_id = ?,
             dark_mode = ?,
             learn_hybrid_enabled = ?
         WHERE id = 1;`,
        [
          next.startupLockEnabled ? 1 : 0,
          next.defaultModelId,
          next.darkMode ? 1 : 0,
          next.learnHybridEnabled ? 1 : 0
        ]
      )

      return next
    }
  }
}
