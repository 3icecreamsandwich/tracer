import { describe, expect, it } from 'vitest'
import { filterSetSearch, normalizeSetSearchQuery } from '../../src/composables/search/set-search'

describe('set search', () => {
  it('normalizes queries by trimming and lowercasing', () => {
    expect(normalizeSetSearchQuery('  Hello  ')).toBe('hello')
  })

  it('filters by title and description (case-insensitive)', () => {
    const items = [
      { title: 'Biology 101', description: 'Cells and DNA' },
      { title: 'World History', description: 'Ancient Rome' },
      { title: 'Chemistry', description: null }
    ]

    expect(filterSetSearch(items, 'bio').map((x) => x.title)).toEqual(['Biology 101'])
    expect(filterSetSearch(items, 'ROME').map((x) => x.title)).toEqual(['World History'])
    expect(filterSetSearch(items, '   ').map((x) => x.title)).toEqual([
      'Biology 101',
      'World History',
      'Chemistry'
    ])
  })
})
