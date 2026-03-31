import { streamText } from 'ai'
import type { FlashcardSet } from '../db/types'

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

function tsvCell(s: string) {
  return s
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, ' ')
    .trim()
}

export function buildSetTermsTsv(set: FlashcardSet) {
  const header = ['term', 'definition'].join('\t')
  const rows: string[] = []
  for (const t of set.terms) {
    rows.push([tsvCell(t.front), tsvCell(t.back)].join('\t'))
  }
  return [header, ...rows].join('\n')
}

export function buildGroundedChatSystemPrompt(set: FlashcardSet) {
  const descriptionLine = set.description?.trim() ? `Description: ${set.description.trim()}\n` : ''
  const termsTsv = buildSetTermsTsv(set)

  return [
    'You are Tracer Chat — a study assistant grounded to ONE flashcard set.',
    '',
    'Grounding rules (critical):',
    '- Prefer grounded answers that are supported by the provided set terms/definitions.',
    '- Do NOT invent facts or add outside information.',
    '- If the set does not contain the answer, say you are not sure / you do not know based on this set, and ask a clarifying question.',
    '- When relevant, quote or reference the exact term(s) from the set that support your answer.',
    '',
    `Set title: ${set.title}`,
    descriptionLine.trimEnd(),
    '',
    'Authoritative set contents (TSV: term<TAB>definition):',
    termsTsv,
    '',
    'Answer style:',
    '- Be concise.',
    '- Use plain text (no markdown headings).'
  ]
    .filter((x) => x.length > 0)
    .join('\n')
}

export function streamGroundedChatText(args: {
  model: any
  system: string
  messages: ChatMessage[]
  abortSignal?: AbortSignal
}) {
  return streamText({
    model: args.model,
    system: args.system,
    messages: args.messages,
    abortSignal: args.abortSignal
  })
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export function buildWebPreviewMockChatAnswer(args: {
  set: FlashcardSet
  userMessage: string
}) {
  const terms = args.set.terms
    .slice(0, 8)
    .map((t) => `- ${t.front}: ${t.back}`)
    .join('\n')
  const suffix = args.set.terms.length > 8 ? `\n- (+${args.set.terms.length - 8} more)` : ''

  return [
    'Web preview (mock streamed response).',
    'I can only answer from the currently loaded set contents.',
    '',
    'From this set:',
    terms + suffix,
    '',
    `Your message: ${args.userMessage.trim()}`
  ]
    .filter((x) => x.length > 0)
    .join('\n')
}

export async function* streamWebPreviewMockChatAnswer(args: {
  set: FlashcardSet
  userMessage: string
  abortSignal?: AbortSignal
  chunkSize?: number
  delayMs?: number
}): AsyncGenerator<string, void, void> {
  const text = buildWebPreviewMockChatAnswer({ set: args.set, userMessage: args.userMessage })
  const chunkSize = Math.max(1, Math.floor(args.chunkSize ?? 24))
  const delayMs = Math.max(0, Math.floor(args.delayMs ?? 30))

  for (let i = 0; i < text.length; i += chunkSize) {
    if (args.abortSignal?.aborted) return
    if (delayMs) await sleep(delayMs)
    yield text.slice(i, i + chunkSize)
  }
}
