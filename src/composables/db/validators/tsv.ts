import type { TermInput } from './terms'

export class TsvParseError extends Error {
  name = 'TsvParseError'
}

function cleanLine(line: string) {
  return line.split('\r').join('')
}

export function parseTermsTsv(tsv: string): TermInput[] {
  if (typeof tsv !== 'string') throw new TsvParseError('tsv must be a string')

  const lines = cleanLine(tsv).split('\n')
  const terms: TermInput[] = []

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? ''
    const line = raw.trim()
    if (!line) continue

    const tabIndex = line.indexOf('\t')
    if (tabIndex < 0) {
      throw new TsvParseError(`line ${i + 1} must contain a tab separator`)
    }
    if (line.indexOf('\t', tabIndex + 1) !== -1) {
      throw new TsvParseError(`line ${i + 1} must contain exactly one tab separator`)
    }

    const front = line.slice(0, tabIndex)
    const back = line.slice(tabIndex + 1)

    terms.push({ front, back })
  }

  if (terms.length === 0) throw new TsvParseError('no terms found')
  return terms
}

export function parseTermsCsvLike(csv: string): TermInput[] {
  if (typeof csv !== 'string') throw new TsvParseError('csv must be a string')

  const lines = cleanLine(csv).split('\n')
  const terms: TermInput[] = []

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? ''
    const line = raw.trim()
    if (!line) continue

    const commaIndex = line.indexOf(',')
    if (commaIndex < 0) {
      throw new TsvParseError(`line ${i + 1} must contain a comma separator`)
    }

    const front = line.slice(0, commaIndex).trim()
    const back = line.slice(commaIndex + 1).trim()
    if (!front || !back) {
      throw new TsvParseError(`line ${i + 1} must contain term and definition`)
    }

    terms.push({ front, back })
  }

  if (terms.length === 0) throw new TsvParseError('no terms found')
  return terms
}
