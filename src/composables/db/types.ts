export type Uuid = string

export type IsoDateTimeString = string

export type Term = {
  id: Uuid
  front: string
  back: string
}

export type FlashcardSet = {
  id: Uuid
  title: string
  description: string | null
  terms: Term[]
  createdAt: IsoDateTimeString
  updatedAt: IsoDateTimeString
}

export type FlashcardSetListItem = {
  id: Uuid
  title: string
  description: string | null
  createdAt: IsoDateTimeString
  updatedAt: IsoDateTimeString
}

export type Profile = {
  id: Uuid
  name: string
  email: string
  createdAt: IsoDateTimeString
}

export type AppSettings = {
  startupLockEnabled: boolean
  defaultModelId: string | null
  darkMode: boolean
  learnHybridEnabled: boolean
}

export type StudyGuide = {
  id: Uuid
  setId: Uuid
  markdown: string
  createdAt: IsoDateTimeString
}

export type DbClient = {
  execute: (sql: string, bindValues?: unknown[]) => Promise<unknown>
  select: <T>(sql: string, bindValues?: unknown[]) => Promise<T[]>
}
