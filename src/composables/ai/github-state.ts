import { aiSecretsDelete, aiSecretsGet, aiSecretsSet } from './credentials'
import { githubModelsCatalogList } from './github-models'

export type GithubModelsAuthState =
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; models: { id: string }[] }
  | { status: 'invalid' }
  | { status: 'vault_locked' }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function vaultLockedFromError(e: unknown): boolean {
  if (e instanceof Error && /vault is locked/i.test(e.message)) return true
  if (isRecord(e) && typeof e.code === 'string') {
    return e.code === 'vault_locked' || e.code === 'wrong_password' || e.code === 'password_required'
  }
  return false
}

export async function githubModelsGetStoredToken(): Promise<string | null> {
  return await aiSecretsGet('github_models_token')
}

export async function githubModelsStoreToken(token: string): Promise<void> {
  await aiSecretsSet('github_models_token', token)
}

export async function githubModelsInvalidateToken(): Promise<void> {
  await aiSecretsDelete('github_models_token')
}

export async function githubModelsVerifyAndListModels(token: string): Promise<{ id: string }[]> {
  const list = await githubModelsCatalogList(token)
  return list
    .map((m) => ({ id: String((m as any).id ?? '') }))
    .filter((m) => m.id.trim().length > 0)
}

export async function githubModelsLoadAuthState(): Promise<GithubModelsAuthState> {
  let token: string | null
  try {
    token = await githubModelsGetStoredToken()
  } catch (e) {
    if (vaultLockedFromError(e)) return { status: 'vault_locked' }
    return { status: 'unauthenticated' }
  }
  if (!token) return { status: 'unauthenticated' }

  try {
    const models = await githubModelsVerifyAndListModels(token)
    return { status: 'authenticated', models }
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : null
    if (status === 401 || status === 403) {
      await githubModelsInvalidateToken().catch(() => {})
      return { status: 'invalid' }
    }
    return { status: 'invalid' }
  }
}
