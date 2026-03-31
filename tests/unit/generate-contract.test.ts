import { describe, expect, it } from 'vitest'
import {
  parseGenerateContractOutput,
  GenerateContractParseError
} from '../../src/composables/ai/generate-contract'

describe('parseGenerateContractOutput', () => {
  it('extracts study guide markdown and flashcards tsv blocks', () => {
    const raw = [
      '```study_guide_md',
      '# Guide',
      '- a',
      '```',
      '',
      '```flashcards_tsv',
      'term\tdef',
      '```'
    ].join('\n')

    expect(parseGenerateContractOutput(raw)).toEqual({
      studyGuideMarkdown: ['# Guide', '- a'].join('\n'),
      flashcardsTsv: 'term\tdef'
    })
  })

  it('rejects missing blocks', () => {
    expect(() => parseGenerateContractOutput('nope')).toThrow(GenerateContractParseError)
    expect(() => parseGenerateContractOutput('nope')).toThrow('Missing fenced block')
  })

  it('rejects empty fenced blocks', () => {
    const raw = ['```study_guide_md', '', '```', '```flashcards_tsv', 'a\tb', '```'].join('\n')
    expect(() => parseGenerateContractOutput(raw)).toThrow(GenerateContractParseError)
    expect(() => parseGenerateContractOutput(raw)).toThrow('Empty fenced block: study_guide_md')
  })
})
