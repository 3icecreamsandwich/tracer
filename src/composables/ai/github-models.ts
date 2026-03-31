import { aiHttpFetch } from './http'
import { isTracerTestMode } from './test-mode'

const githubHeaders = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2026-03-10'
}

export type GithubCatalogModel = {
  id: string
  name?: string
  publisher?: string
  summary?: string
  capabilities?: string[]
  supported_input_modalities?: string[]
  supported_output_modalities?: string[]
}

export async function githubModelsCatalogList(token: string): Promise<GithubCatalogModel[]> {
  if (isTracerTestMode()) {
    return [
      { id: 'openai/gpt-4.1', name: 'openai/gpt-4.1' },
      { id: 'openai/gpt-4o-mini', name: 'openai/gpt-4o-mini' },
      { id: 'openai/gpt-4o', name: 'openai/gpt-4o' }
    ]
  }

  const res = await aiHttpFetch('https://models.github.ai/catalog/models', {
    method: 'GET',
    headers: {
      ...githubHeaders,
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const err = new Error(`GitHub Models catalog request failed (${res.status})`)
    ;(err as any).status = res.status
    throw err
  }

  const json = (await res.json()) as unknown
  if (!Array.isArray(json)) return []
  return json as GithubCatalogModel[]
}
