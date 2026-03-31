import { describe, expect, it } from 'vitest'

import { buildGroundedChatSystemPrompt, buildSetTermsTsv } from '../../src/composables/ai/chat'

describe('chat prompt', () => {
  it('buildSetTermsTsv produces header + rows with escaped newlines', () => {
    const set = {
      id: 's-1',
      title: 'Test set',
      description: null,
      terms: [
        { id: 't-1', front: 'A\nB', back: 'C\tD' },
        { id: 't-2', front: ' X ', back: 'Y\r\nZ' }
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }

    const tsv = buildSetTermsTsv(set as any)
    expect(tsv.split('\n')[0]).toBe('term\tdefinition')
    expect(tsv).toContain('A\\nB\tC D')
    expect(tsv).toContain('X\tY\\nZ')
  })

  it('buildGroundedChatSystemPrompt includes grounding rules and set metadata', () => {
    const set = {
      id: 's-1',
      title: 'Biology 101',
      description: 'Cells',
      terms: [{ id: 't-1', front: 'cell', back: 'basic unit of life' }],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }

    const prompt = buildGroundedChatSystemPrompt(set as any)
    expect(prompt).toContain('Prefer grounded answers')
    expect(prompt).toContain('Do NOT invent facts')
    expect(prompt).toContain('Set title: Biology 101')
    expect(prompt).toContain('Description: Cells')
    expect(prompt).toContain('cell\tbasic unit of life')
  })
})
