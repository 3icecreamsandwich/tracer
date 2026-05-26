import { describe, expect, it } from 'vitest'

import {
  createWebPreviewSearchItems,
  filterTopbarSearchItems,
  topbarSearchItemTo,
  type TopbarSearchItem
} from '../../src/composables/search/topbar-search'

describe('topbar search', () => {
  it('returns all items for an empty query and filters suggestions by query', () => {
    const items: TopbarSearchItem[] = [
      {
        kind: 'set',
        kindLabel: 'Set',
        id: 'set-1',
        title: 'Biology 101',
        description: 'Cells and DNA'
      },
      {
        kind: 'study-guide',
        kindLabel: 'Study guide',
        id: 'guide-1',
        setId: 'set-1',
        title: 'Study guide · Biology 101',
        description: null
      },
      {
        kind: 'set',
        kindLabel: 'Set',
        id: 'set-2',
        title: 'World History',
        description: 'Ancient Rome'
      }
    ]

    expect(filterTopbarSearchItems(items, '').map((item) => item.id)).toEqual([
      'set-1',
      'guide-1',
      'set-2'
    ])
    expect(filterTopbarSearchItems(items, 'rome').map((item) => item.id)).toEqual(['set-2'])
    expect(filterTopbarSearchItems(items, 'guide').map((item) => item.id)).toEqual(['guide-1'])
  })

  it('maps results to their destination pages', () => {
    expect(topbarSearchItemTo(createWebPreviewSearchItems()[0])).toBe('/set/demo')
    expect(topbarSearchItemTo(createWebPreviewSearchItems()[1])).toBe('/study-guide/demo')
  })
})
