import { describe, expect, it } from 'vitest'
import { modelMessageSchema } from 'ai'

import {
  assertGenerateModelSupportsUploadedFiles,
  assertGenerateSourceLimits,
  buildGeneratePromptText,
  buildGenerateUserContent,
  GenerateUnsupportedModelError,
  normalizeGenerateRequestError
} from '../../src/composables/ai/generate-request'

describe('generate request helpers', () => {
  it('builds a valid multimodal model message for the AI SDK', () => {
    const content = buildGenerateUserContent({
      promptText: buildGeneratePromptText('Focus on definitions.'),
      pdfs: [{ data: new Uint8Array([1, 2, 3]), filename: 'notes.pdf' }],
      images: [{ data: new Uint8Array([4, 5, 6]), mediaType: 'image/png' }]
    })

    const result = modelMessageSchema.safeParse({ role: 'user', content })
    expect(result.success).toBe(true)
    expect(content).toEqual([
      expect.objectContaining({ type: 'text', text: expect.stringContaining('study_guide_md') }),
      expect.objectContaining({ type: 'file', filename: 'notes.pdf', mediaType: 'application/pdf' }),
      expect.objectContaining({ type: 'image', mediaType: 'image/png' })
    ])
  })

  it('rejects GitHub Models for uploaded-file generation', () => {
    expect(() => assertGenerateModelSupportsUploadedFiles('github:openai/gpt-4o-mini')).toThrow(
      GenerateUnsupportedModelError
    )
    expect(() => assertGenerateModelSupportsUploadedFiles('openai:gpt-4o-mini')).not.toThrow()
  })

  it('rejects OpenAI models that are not file-capable for generation uploads', () => {
    expect(() => assertGenerateModelSupportsUploadedFiles('openai:o3-mini')).toThrow(
      GenerateUnsupportedModelError
    )
  })

  it('normalizes provider invalid-message-format failures to an actionable model error', () => {
    const out = normalizeGenerateRequestError(new Error('invalid message format'))
    expect(out).toBeInstanceOf(GenerateUnsupportedModelError)
    expect((out as Error).message).toContain('file-capable model')
  })

  it('validates combined Generate source limits', () => {
    expect(() => assertGenerateSourceLimits({ pdfPages: 10, imageCount: 10 })).not.toThrow()
    expect(() => assertGenerateSourceLimits({ pdfPages: 11, imageCount: 1 })).toThrow(
      /PDF page limit exceeded/
    )
    expect(() => assertGenerateSourceLimits({ pdfPages: 1, imageCount: 11 })).toThrow(
      /Too many images/
    )
  })
})
