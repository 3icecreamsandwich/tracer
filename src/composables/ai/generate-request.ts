import type { DataContent, UserContent } from 'ai'
import { parseQualifiedModelId } from './ids'

export class GenerateUnsupportedModelError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GenerateUnsupportedModelError'
  }
}

export type GeneratePdfInput = {
  data: DataContent
  filename: string
}

export type GenerateImageInput = {
  data: DataContent
  mediaType?: string
}

export function assertGenerateSourceLimits(input: { pdfPages: number; imageCount: number }) {
  if (input.imageCount > 10) {
    throw new Error(`Too many images selected. Max is 10; selected files contain ${input.imageCount} images.`)
  }

  if (input.pdfPages > 10) {
    throw new Error(`PDF page limit exceeded. Max is 10 pages total; selected PDFs contain ${input.pdfPages} pages.`)
  }
}

export function buildGeneratePromptText(instructions = '') {
  const extra = instructions.trim()
  const extraLine = extra ? `User instructions: ${extra}\n` : ''
  return [
    'You are creating study materials from the provided source documents (PDFs and images).',
    'Return EXACTLY two fenced code blocks and NOTHING else.',
    '',
    '1) A markdown study guide:',
    '```study_guide_md',
    '(markdown)',
    '```',
    '',
    '2) Flashcards as TSV with one card per line:',
    '```flashcards_tsv',
    'term<TAB>definition',
    '... (no header row)',
    '```',
    '',
    'Flashcards TSV rules:',
    '- Output TSV only inside the flashcards_tsv fence.',
    '- One card per line.',
    '- Each line must contain exactly ONE tab separator.',
    '- Do not include tabs inside term or definition (use spaces instead).',
    '- Do not include blank lines.',
    '- Do not include numbering or bullets.',
    '- If you need a line break inside a cell, use the literal sequence "\\n" (do not insert real newlines).',
    '- Do not include a header row.',
    '',
    extraLine.trimEnd()
  ]
    .filter((x) => x.length > 0)
    .join('\n')
}

export function buildGenerateUserContent(input: {
  promptText: string
  pdfs?: GeneratePdfInput[]
  images?: GenerateImageInput[]
}): UserContent {
  const content: UserContent = [{ type: 'text', text: input.promptText }]

  for (const pdf of input.pdfs ?? []) {
    content.push({
      type: 'file',
      data: pdf.data,
      filename: pdf.filename,
      mediaType: 'application/pdf'
    })
  }

  for (const image of input.images ?? []) {
    content.push({
      type: 'image',
      image: image.data,
      mediaType: image.mediaType || 'image/*'
    })
  }

  return content
}

export function assertGenerateModelSupportsUploadedFiles(qualifiedModelId: string) {
  const { providerId, modelId } = parseQualifiedModelId(qualifiedModelId)
  if (providerId === 'openai' && modelId === 'o3-mini') {
    throw new GenerateUnsupportedModelError(
      'Generate from uploaded PDFs and images requires a file-capable vision model. Choose gpt-4o, gpt-4o-mini, Claude, Gemini, or another file-capable model in Settings.'
    )
  }

  if (providerId !== 'github') return

  throw new GenerateUnsupportedModelError(
    'Generate from uploaded PDFs and images is not supported by GitHub Models because its chat endpoint accepts text messages only. Choose OpenAI, Anthropic, Gemini, or a file-capable OpenAI-compatible model in Settings.'
  )
}

function errorMessage(err: unknown): string {
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return ''
}

export function normalizeGenerateRequestError(err: unknown): unknown {
  if (err instanceof GenerateUnsupportedModelError) return err

  const message = errorMessage(err).toLowerCase()
  if (
    message.includes('invalid message format') ||
    message.includes('unsupported functionality') ||
    message.includes('file part') ||
    message.includes('media type')
  ) {
    return new GenerateUnsupportedModelError(
      'The selected AI model rejected the uploaded PDF/image message format. Choose a file-capable model such as gpt-4o, gpt-4o-mini, Claude, Gemini, or a compatible provider that supports uploaded files.'
    )
  }

  return err
}
