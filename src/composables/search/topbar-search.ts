import type { Uuid } from '../db'
import { filterSetSearch, type SetSearchable } from './set-search'

export type TopbarSearchItem = SetSearchable & {
  kind: 'set' | 'study-guide'
  kindLabel: 'Set' | 'Study guide'
  id: Uuid
  setId?: Uuid
  subtitle?: string | null
}

export function filterTopbarSearchItems(
  items: readonly TopbarSearchItem[],
  query: string
): TopbarSearchItem[] {
  return filterSetSearch(items, query)
}

export function topbarSearchItemTo(item: TopbarSearchItem) {
  if (item.kind === 'set') return `/set/${item.id}`
  return `/study-guide/${item.setId ?? item.id}`
}

export function createWebPreviewSearchItems(now = new Date().toISOString()): TopbarSearchItem[] {
  return [
    {
      kind: 'set',
      kindLabel: 'Set',
      id: 'demo' as Uuid,
      title: 'Demo set',
      description: 'Web preview fallback. Full list requires desktop.',
      subtitle: 'Web preview fallback. Full list requires desktop.'
    },
    {
      kind: 'study-guide',
      kindLabel: 'Study guide',
      id: 'demo-guide' as Uuid,
      setId: 'demo' as Uuid,
      title: 'Study guide · Demo set',
      description: `Created ${now}`,
      subtitle: null
    }
  ]
}
