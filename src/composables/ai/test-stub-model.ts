import type {
  LanguageModelV3,
  LanguageModelV3CallOptions,
  LanguageModelV3GenerateResult,
  LanguageModelV3StreamPart,
  LanguageModelV3StreamResult
} from '@ai-sdk/provider'

function fixedSynthesizeTsv(): string {
  return [
    'Photosynthesis\tProcess where plants convert light energy into chemical energy.',
    'Mitosis\tCell division producing two genetically identical daughter cells.',
    'Osmosis\tMovement of water across a semipermeable membrane from low solute to high solute.'
  ].join('\n')
}

function fixedGenerateContract(): string {
  const study = [
    '# Study Guide',
    '',
    '## Key concepts',
    '- Photosynthesis: converts light to chemical energy',
    '- Mitosis: produces identical cells',
    '- Osmosis: water moves toward higher solute concentration'
  ].join('\n')

  const cards = fixedSynthesizeTsv()

  return [
    '```study_guide_md',
    study,
    '```',
    '',
    '```flashcards_tsv',
    cards,
    '```'
  ].join('\n')
}

function extractUserTextFromPrompt(prompt: LanguageModelV3CallOptions['prompt']): string {
  const parts: string[] = []
  for (const msg of prompt) {
    if (msg.role !== 'user') continue
    for (const p of msg.content) {
      if (p.type === 'text') parts.push(p.text)
    }
  }
  return parts.join('\n').trim()
}

function chooseResponseText(options: LanguageModelV3CallOptions): string {
  const userText = extractUserTextFromPrompt(options.prompt)

  if (/Return ONLY TSV lines/i.test(userText) || /Return ONLY TSV/i.test(userText)) {
    return fixedSynthesizeTsv()
  }

  if (/flashcards_tsv/i.test(userText) && /study_guide_md/i.test(userText)) {
    return fixedGenerateContract()
  }

  return [
    'Deterministic test-mode response.',
    'I can only answer based on the provided set contents.',
    'If the answer is not in the set, I will say I do not know based on this set.'
  ].join('\n')
}

function baseGenerateResult(text: string): LanguageModelV3GenerateResult {
  return {
    content: [{ type: 'text', text }],
    finishReason: { unified: 'stop', raw: 'stop' },
    usage: {
      inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
      outputTokens: { total: 0, text: 0, reasoning: 0 }
    },
    warnings: []
  }
}

function streamFromText(text: string): ReadableStream<LanguageModelV3StreamPart> {
  const id = 't1'
  return new ReadableStream<LanguageModelV3StreamPart>({
    start(controller) {
      controller.enqueue({ type: 'stream-start', warnings: [] })
      controller.enqueue({ type: 'text-start', id })
      controller.enqueue({ type: 'text-delta', id, delta: text })
      controller.enqueue({ type: 'text-end', id })
      controller.enqueue({
        type: 'finish',
        finishReason: { unified: 'stop', raw: 'stop' },
        usage: {
          inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 0, text: 0, reasoning: 0 }
        }
      })
      controller.close()
    }
  })
}

export function createTracerDeterministicTestModel(args?: {
  provider?: string
  modelId?: string
}): LanguageModelV3 {
  const provider = args?.provider ?? 'tracer_test'
  const modelId = args?.modelId ?? 'deterministic'

  const model: LanguageModelV3 = {
    specificationVersion: 'v3',
    provider,
    modelId,
    supportedUrls: {},
    async doGenerate(options) {
      const text = chooseResponseText(options)
      return baseGenerateResult(text)
    },
    async doStream(options) {
      const text = chooseResponseText(options)
      const out: LanguageModelV3StreamResult = {
        stream: streamFromText(text)
      }
      return out
    }
  }

  return model
}
