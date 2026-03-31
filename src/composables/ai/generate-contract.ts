export class GenerateContractParseError extends Error {
  name = 'GenerateContractParseError'
}

function indexOfFencedStart(haystack: string, fenceName: string): number {
  const lower = haystack.toLowerCase()
  const needle = `\`\`\`${fenceName.toLowerCase()}`
  return lower.indexOf(needle)
}

function extractFencedBlock(text: string, fenceName: string): string {
  const startIdx = indexOfFencedStart(text, fenceName)
  if (startIdx < 0) {
    throw new GenerateContractParseError(`Missing fenced block: ${fenceName}`)
  }

  const headerLineEnd = text.indexOf('\n', startIdx)
  if (headerLineEnd < 0) {
    throw new GenerateContractParseError(`Missing newline after fenced block start: ${fenceName}`)
  }

  const contentStart = headerLineEnd + 1
  const closeIdx = text.indexOf('```', contentStart)
  if (closeIdx < 0) {
    throw new GenerateContractParseError(`Missing closing fence: ${fenceName}`)
  }

  const body = text.slice(contentStart, closeIdx).split('\r').join('').trim()
  if (!body) {
    throw new GenerateContractParseError(`Empty fenced block: ${fenceName}`)
  }
  return body
}

export function parseGenerateContractOutput(raw: string): {
  studyGuideMarkdown: string
  flashcardsTsv: string
} {
  if (typeof raw !== 'string') {
    throw new GenerateContractParseError('Output must be a string')
  }
  const text = raw.trim()
  if (!text) {
    throw new GenerateContractParseError('Output was empty')
  }

  const studyGuideMarkdown = extractFencedBlock(text, 'study_guide_md')
  const flashcardsTsv = extractFencedBlock(text, 'flashcards_tsv')

  return { studyGuideMarkdown, flashcardsTsv }
}
