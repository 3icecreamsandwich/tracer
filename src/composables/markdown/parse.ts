export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'code'; lang: string | null; code: string }

function isBlank(line: string) {
  return line.trim().length === 0
}

function parseHeading(line: string): { level: 1 | 2 | 3 | 4 | 5 | 6; text: string } | null {
  const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line)
  if (!m) return null
  const level = m[1].length as 1 | 2 | 3 | 4 | 5 | 6
  const text = m[2].trim()
  if (!text) return null
  return { level, text }
}

function parseListItem(line: string): { ordered: boolean; text: string } | null {
  const ordered = /^\s*(\d+)\.\s+(.+?)\s*$/.exec(line)
  if (ordered) return { ordered: true, text: ordered[2].trim() }

  const unordered = /^\s*[-*+]\s+(.+?)\s*$/.exec(line)
  if (unordered) return { ordered: false, text: unordered[1].trim() }

  return null
}

function parseFenceStart(line: string): { lang: string | null } | null {
  const m = /^```\s*([^\s`]+)?\s*$/.exec(line)
  if (!m) return null
  const raw = (m[1] ?? '').trim()
  return { lang: raw ? raw : null }
}

function isFenceEnd(line: string) {
  return /^```\s*$/.test(line)
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')

  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''

    if (isBlank(line)) {
      i += 1
      continue
    }

    const fence = parseFenceStart(line)
    if (fence) {
      const codeLines: string[] = []
      i += 1
      while (i < lines.length) {
        const l = lines[i] ?? ''
        if (isFenceEnd(l)) break
        codeLines.push(l)
        i += 1
      }
      if (i < lines.length) i += 1
      blocks.push({ type: 'code', lang: fence.lang, code: codeLines.join('\n') })
      continue
    }

    const heading = parseHeading(line)
    if (heading) {
      blocks.push({ type: 'heading', level: heading.level, text: heading.text })
      i += 1
      continue
    }

    const li = parseListItem(line)
    if (li) {
      const items: string[] = [li.text]
      const ordered = li.ordered
      i += 1
      while (i < lines.length) {
        const nextLine = lines[i] ?? ''
        if (isBlank(nextLine)) break
        const nextLi = parseListItem(nextLine)
        if (!nextLi || nextLi.ordered !== ordered) break
        items.push(nextLi.text)
        i += 1
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    const paraLines: string[] = [line]
    i += 1
    while (i < lines.length) {
      const nextLine = lines[i] ?? ''
      if (isBlank(nextLine)) break
      if (parseFenceStart(nextLine)) break
      if (parseHeading(nextLine)) break
      if (parseListItem(nextLine)) break
      paraLines.push(nextLine)
      i += 1
    }

    blocks.push({ type: 'paragraph', text: paraLines.join('\n') })
  }

  return blocks
}
