import { describe, expect, it } from 'vitest'
import { parseTermsTsv, TsvParseError } from '../../src/composables/db/validators/tsv'

describe('parseTermsTsv', () => {
  it('parses valid TSV into term inputs', () => {
    const input = 'hello\tworld\nfoo\tbar\n'
    expect(parseTermsTsv(input)).toEqual([
      { front: 'hello', back: 'world' },
      { front: 'foo', back: 'bar' }
    ])
  })

  it('ignores empty lines and trims surrounding whitespace', () => {
    const input = '\n  a\tb  \n\n\r\n  c\td\n'
    expect(parseTermsTsv(input)).toEqual([
      { front: 'a', back: 'b' },
      { front: 'c', back: 'd' }
    ])
  })

  it('rejects a line without a tab', () => {
    expect(() => parseTermsTsv('nope\n')).toThrow(TsvParseError)
    expect(() => parseTermsTsv('nope\n')).toThrow('must contain a tab')
  })

  it('rejects a line with multiple tabs', () => {
    expect(() => parseTermsTsv('a\tb\tc\n')).toThrow(TsvParseError)
    expect(() => parseTermsTsv('a\tb\tc\n')).toThrow('exactly one tab')
  })

  it('rejects empty input after filtering empty lines', () => {
    expect(() => parseTermsTsv('\n\n\r\n')).toThrow(TsvParseError)
    expect(() => parseTermsTsv('\n\n\r\n')).toThrow('no terms found')
  })
})
