export type SetSearchable = {
  title: string
  description?: string | null
}

export function normalizeSetSearchQuery(query: string) {
  return query.trim().toLowerCase()
}

export function filterSetSearch<T extends SetSearchable>(items: readonly T[], query: string): T[] {
  const q = normalizeSetSearchQuery(query)
  if (!q) return items.slice()

  return items.filter((item) => {
    const title = item.title.toLowerCase()
    const description = (item.description ?? '').toLowerCase()
    return title.includes(q) || description.includes(q)
  })
}
