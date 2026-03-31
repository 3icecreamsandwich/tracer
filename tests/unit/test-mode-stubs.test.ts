import { describe, expect, it } from 'vitest'

import { resolveAiModel } from '../../src/composables/ai/registry'
import { parseGenerateContractOutput } from '../../src/composables/ai/generate-contract'
import { parseTermsTsv } from '../../src/composables/db/validators'
import { githubModelsLoadAuthState } from '../../src/composables/ai/github-state'

describe('TRACER_TEST_MODE stubs', () => {
  it('returns deterministic synthesize TSV output via generate', async () => {
    process.env.TRACER_TEST_MODE = '1'
    const model: any = await resolveAiModel('openai:gpt-4o-mini')

    const res = await model.doGenerate({
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Return ONLY TSV lines in the form: term<TAB>definition. Do not include a header row.'
            }
          ]
        }
      ]
    })

    const text = String((res as any)?.content?.[0]?.text ?? '').trim()
    const terms = parseTermsTsv(text)
    expect(terms.length).toBeGreaterThan(0)
  })

  it('returns deterministic generate contract output via generate', async () => {
    process.env.TRACER_TEST_MODE = '1'
    const model: any = await resolveAiModel('openai:gpt-4o-mini')

    const res = await model.doGenerate({
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Return EXACTLY two fenced code blocks: ```study_guide_md ...``` and ```flashcards_tsv ...```'
            }
          ]
        }
      ]
    })

    const text = String((res as any)?.content?.[0]?.text ?? '').trim()
    const parsed = parseGenerateContractOutput(text)
    expect(parsed.studyGuideMarkdown.length).toBeGreaterThan(0)
    const terms = parseTermsTsv(parsed.flashcardsTsv)
    expect(terms.length).toBeGreaterThan(0)
  })

  it('mocks github models auth state without network', async () => {
    process.env.TRACER_TEST_MODE = '1'
    const state = await githubModelsLoadAuthState()
    expect(state.status).toBe('unauthenticated')
  })

  it('disables aiHttpFetch network by default in test mode', async () => {
    process.env.TRACER_TEST_MODE = '1'
    delete process.env.TRACER_LIVE_AI

    const { aiHttpFetch } = await import('../../src/composables/ai/http')
    expect(() => aiHttpFetch('https://example.com', { method: 'GET' })).toThrow(
      /Network is disabled in TRACER_TEST_MODE/i
    )
  })
})
