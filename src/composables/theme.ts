import { createSettingsRepo, useTracerDb } from './db'

function applyDarkClass(enabled: boolean) {
  const root = document.documentElement
  root.classList.toggle('dark', enabled)
}

export async function themeInitFromDb() {
  const db = await useTracerDb()
  const settings = await createSettingsRepo(db).get()
  applyDarkClass(settings.darkMode)
  return settings.darkMode
}

export async function themeSetDarkMode(enabled: boolean) {
  applyDarkClass(enabled)
  const db = await useTracerDb()
  const repo = createSettingsRepo(db)
  await repo.set({ darkMode: enabled })
}
